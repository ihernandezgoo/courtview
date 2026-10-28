import { cacheLife } from "next/cache";
import { nbaApi } from "@/lib/api";
import { getJson, toStatLine } from "@/lib/nba";
import { pickTeamLogos } from "@/lib/standings";
import type {
  Draft,
  PlayerBio,
  PlayerGame,
  PlayerGameGroup,
  PlayerProfile,
  PlayerSeason,
  StatRank,
} from "@/types/player";
import type { TeamRef } from "@/types/standings";

type EspnTeam = {
  id: string;
  abbreviation: string;
  displayName: string;
  color?: string;
  logos?: { href: string; rel: string[] }[];
  logo?: string;
};

type EspnAthlete = {
  athlete: {
    id: string;
    displayName: string;
    jersey?: string;
    position?: { abbreviation: string };
    team?: EspnTeam;
    headshot?: { href: string };
    displayHeight?: string;
    displayWeight?: string;
    age?: number;
    displayDOB?: string;
    displayBirthPlace?: string;
    displayDraft?: string;
    displayExperience?: string;
    statsSummary?: {
      displayName: string;
      statistics: { name: string; rankDisplayValue?: string }[];
    };
  };
};

type EspnGameLog = {
  names: string[];
  filters?: { name: string; value: string; options: { value: string; displayValue: string }[] }[];
  events: Record<
    string,
    {
      id: string;
      gameDate: string;
      atVs: "vs" | "@";
      homeTeamId: string;
      homeTeamScore?: string;
      awayTeamScore?: string;
      gameResult?: "W" | "L";
      opponent: EspnTeam;
    }
  >;
  seasonTypes: {
    displayName: string;
    categories?: { events?: { eventId: string; stats: string[] }[] }[];
  }[];
};

type EspnPlayerStats = {
  teams?: Record<string, EspnTeam>;
  categories: {
    name: string;
    names: string[];
    totals?: string[];
    statistics: {
      teamId?: string;
      teamSlug: string;
      season: { displayName: string };
      stats: string[];
    }[];
  }[];
};

function toTeamRef(team: EspnTeam): TeamRef {
  const logos = pickTeamLogos(team.logos);
  return {
    id: team.id,
    abbreviation: team.abbreviation,
    displayName: team.displayName,
    color: team.color ?? null,
    logo: logos.logo ?? team.logo ?? null,
    logoDark: logos.logoDark ?? team.logo ?? null,
  };
}

/** `6' 8"` → 80. */
function parseHeight(value: string | undefined) {
  const match = value?.match(/^(\d+)'\s*(\d+)"/);
  return match ? Number(match[1]) * 12 + Number(match[2]) : null;
}

/** `230 lbs` → 230. */
function parseWeight(value: string | undefined) {
  const match = value?.match(/^(\d+)/);
  return match ? Number(match[1]) : null;
}

/** `28/2/1999` → `1999-02-28`. */
function parseBirthDate(value: string | undefined) {
  const match = value?.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  return `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
}

/** `2018: Rd 1, Pk 3 (ATL)`. */
function parseDraft(value: string | undefined): Draft | null {
  const match = value?.match(/^(\d{4}): Rd (\d+), Pk (\d+)(?: \((\w+)\))?/);
  if (!match) return null;
  return {
    year: Number(match[1]),
    round: Number(match[2]),
    pick: Number(match[3]),
    team: match[4] ?? null,
  };
}

/** `9th Season` → 9; `Rookie` → 1. */
function parseExperience(value: string | undefined) {
  if (!value) return null;
  if (/rookie/i.test(value)) return 1;
  const match = value.match(/^(\d+)/);
  return match ? Number(match[1]) : null;
}

/** `1st` → 1; `Tied-52nd` → 52 empatado. */
function parseRank(value: string | undefined): StatRank | null {
  const match = value?.match(/^(Tied-)?(\d+)/);
  return match ? { rank: Number(match[2]), tied: Boolean(match[1]) } : null;
}

function toBio(data: EspnAthlete["athlete"]): PlayerBio {
  return {
    id: data.id,
    name: data.displayName,
    jersey: data.jersey ?? null,
    position: data.position?.abbreviation ?? null,
    team: data.team ? toTeamRef(data.team) : null,
    headshot: data.headshot?.href ?? null,
    heightInches: parseHeight(data.displayHeight),
    weightLbs: parseWeight(data.displayWeight),
    age: data.age ?? null,
    birthDate: parseBirthDate(data.displayDOB),
    birthPlace: data.displayBirthPlace ?? null,
    draft: parseDraft(data.displayDraft),
    experience: parseExperience(data.displayExperience),
  };
}

const SEASON_TYPES: [RegExp, string][] = [
  [/postseason|playoff/i, "Playoffs"],
  [/play-?in/i, "Play-in"],
  [/regular/i, "Temporada regular"],
  [/preseason/i, "Pretemporada"],
];

function toGameLog(data: EspnGameLog): PlayerGameGroup[] {
  return data.seasonTypes.flatMap((seasonType) => {
    const label = SEASON_TYPES.find(([pattern]) => pattern.test(seasonType.displayName))?.[1];
    if (!label) return [];
    const games = (seasonType.categories ?? []).flatMap((category) =>
      (category.events ?? []).flatMap((row): PlayerGame[] => {
        const event = data.events[row.eventId];
        if (!event) return [];
        const home = event.atVs === "vs";
        const homeScore = event.homeTeamScore ? Number(event.homeTeamScore) : null;
        const awayScore = event.awayTeamScore ? Number(event.awayTeamScore) : null;
        return [
          {
            id: event.id,
            startsAt: event.gameDate,
            home,
            opponent: toTeamRef(event.opponent),
            won: event.gameResult ? event.gameResult === "W" : null,
            teamScore: home ? homeScore : awayScore,
            opponentScore: home ? awayScore : homeScore,
            stats: toStatLine(data.names, row.stats),
          },
        ];
      }),
    );
    if (games.length === 0) return [];
    games.sort((a, b) => b.startsAt.localeCompare(a.startsAt));
    return [{ label, games }];
  });
}

function toSeasons(data: EspnPlayerStats) {
  const averages = data.categories.find((c) => c.name === "averages");
  if (!averages) return { seasons: [], career: null };
  const seasons = averages.statistics.map(
    (row): PlayerSeason => ({
      season: row.season.displayName,
      // La fila de total de una temporada con traspaso no lleva `teamId`.
      team: row.teamId && data.teams?.[row.teamSlug] ? toTeamRef(data.teams[row.teamSlug]) : null,
      stats: toStatLine(averages.names, row.stats),
    }),
  );
  return {
    seasons,
    career: averages.totals ? toStatLine(averages.names, averages.totals) : null,
  };
}

/** Promedios de una temporada: la fila de total si cambió de equipo, si no la única. */
function seasonAverages(seasons: PlayerSeason[], season: string | null) {
  const rows = seasons.filter((s) => s.season === season);
  return (rows.length > 1 ? rows.find((s) => s.team === null) : rows[0])?.stats ?? null;
}

/** `null` si ESPN no conoce al jugador. */
export async function getPlayer(id: string): Promise<PlayerProfile | null> {
  "use cache";
  cacheLife("minutes");

  const api = nbaApi();
  const response = await fetch(api.athlete(id));
  if (response.status === 400 || response.status === 404) {
    cacheLife("hours");
    return null;
  }
  if (!response.ok) throw new Error(`ESPN respondió ${response.status} en el jugador ${id}`);
  const { athlete } = (await response.json()) as EspnAthlete;

  // Sin registro de partidos o sin estadísticas la ficha se sigue enseñando.
  const [gameLog, stats] = await Promise.all([
    getJson<EspnGameLog>(api.athleteGameLog(id)).catch(() => null),
    getJson<EspnPlayerStats>(api.athleteStats(id)).catch(() => null),
  ]);

  const seasonFilter = gameLog?.filters?.find((f) => f.name === "season");
  const season =
    seasonFilter?.options.find((o) => o.value === seasonFilter.value)?.displayValue ?? null;
  const { seasons, career } = stats ? toSeasons(stats) : { seasons: [], career: null };

  // Los puestos solo valen si son de la misma temporada que los promedios.
  const summary = athlete.statsSummary;
  const ranks: Record<string, StatRank> =
    summary && season && summary.displayName.startsWith(season)
      ? Object.fromEntries(
          summary.statistics.flatMap((s) => {
            const rank = parseRank(s.rankDisplayValue);
            return rank ? [[s.name, rank]] : [];
          }),
        )
      : {};

  return {
    bio: toBio(athlete),
    season,
    averages: seasonAverages(seasons, season),
    ranks,
    gameLog: gameLog ? toGameLog(gameLog) : [],
    seasons,
    career,
  };
}
