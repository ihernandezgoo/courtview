import { cacheLife } from "next/cache";
import { nbaApi } from "@/lib/api";
import { getJson } from "@/lib/nba";
import type { ConferenceId, Standing, Standings, TeamRef } from "@/types/standings";

type EspnLogo = { href: string; rel: string[] };

type EspnStandingEntry = {
  team: {
    id: string;
    abbreviation: string;
    displayName: string;
    color?: string;
    logos?: EspnLogo[];
  };
  stats: { type: string; value?: number; displayValue?: string; summary?: string }[];
};

type EspnGroup = {
  name: string;
  abbreviation?: string;
  children?: EspnGroup[];
  standings?: { entries: EspnStandingEntry[] };
};

type EspnStandings = EspnGroup & { seasons?: { displayName: string }[] };

/** Logo claro y oscuro. ESPN repite el oscuro en versión "scoreboard": preferimos el normal. */
export function pickTeamLogos(logos: EspnLogo[] = []) {
  const logo = logos.find((l) => l.rel.includes("default"))?.href ?? null;
  const dark =
    logos.find((l) => l.rel.includes("dark") && !l.rel.includes("scoreboard")) ??
    logos.find((l) => l.rel.includes("dark"));
  return { logo, logoDark: dark?.href ?? logo };
}

function toTeamRef(team: EspnStandingEntry["team"]): TeamRef {
  return {
    id: team.id,
    abbreviation: team.abbreviation,
    displayName: team.displayName,
    color: team.color ?? null,
    ...pickTeamLogos(team.logos),
  };
}

function toStanding(entry: EspnStandingEntry, conference: ConferenceId, division: string): Standing {
  const stat = (type: string) => entry.stats.find((s) => s.type === type);
  const num = (type: string) => {
    const value = stat(type)?.value;
    return typeof value === "number" && Number.isFinite(value) ? value : null;
  };
  const record = (type: string) => {
    const value = stat(type);
    const text = value?.summary ?? value?.displayValue;
    return text && /^\d+-\d+$/.test(text) ? text : null;
  };
  return {
    team: toTeamRef(entry.team),
    conference,
    division,
    seed: num("playoffseed"),
    wins: num("wins") ?? 0,
    losses: num("losses") ?? 0,
    winPercent: num("winpercent") ?? 0,
    home: record("home"),
    road: record("road"),
    vsConference: record("vsconf"),
    vsDivision: record("vsdiv"),
    lastTen: record("lasttengames"),
    streak: num("streak") || null,
    pointsFor: num("avgpointsfor"),
    pointsAgainst: num("avgpointsagainst"),
    differential: num("differential"),
  };
}

/** Clasificación de la temporada regular, con cada equipo etiquetado con su conferencia y división. */
export async function getStandings(): Promise<Standings> {
  "use cache";
  cacheLife("minutes");

  const data = await getJson<EspnStandings>(nbaApi().standings);
  const standings = (data.children ?? []).flatMap((conference) => {
    const id: ConferenceId = conference.abbreviation === "West" ? "west" : "east";
    return (conference.children ?? []).flatMap((division) =>
      (division.standings?.entries ?? []).map((entry) => toStanding(entry, id, division.name)),
    );
  });
  return { season: data.seasons?.[0]?.displayName ?? "", standings };
}

/** Por porcentaje de victorias; a igualdad, más victorias y después el puesto de ESPN. */
export function sortByRecord(standings: Standing[]) {
  return [...standings].sort(
    (a, b) =>
      b.winPercent - a.winPercent ||
      b.wins - a.wins ||
      (a.seed ?? Infinity) - (b.seed ?? Infinity),
  );
}

/** Por el puesto de ESPN en la conferencia, que ya resuelve los desempates. */
export function sortBySeed(standings: Standing[]) {
  return [...standings].sort(
    (a, b) => (a.seed ?? Infinity) - (b.seed ?? Infinity) || b.winPercent - a.winPercent,
  );
}

/** Partidos de diferencia con `leader`. */
export function gamesBehind(leader: Standing, team: Standing) {
  return (leader.wins - team.wins + (team.losses - leader.losses)) / 2;
}

export const CONFERENCES: { id: ConferenceId; label: string }[] = [
  { id: "east", label: "Conferencia Este" },
  { id: "west", label: "Conferencia Oeste" },
];

/** Divisiones en el orden habitual, por conferencia. */
export const DIVISIONS: Record<ConferenceId, string[]> = {
  east: ["Atlantic", "Central", "Southeast"],
  west: ["Northwest", "Pacific", "Southwest"],
};

/** Corte tras el 6.º (playoffs directos) y tras el 10.º (play-in). */
export const PLAYOFF_CUTOFF = 6;
export const PLAY_IN_CUTOFF = 10;
