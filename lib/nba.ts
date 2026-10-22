import { cacheLife } from "next/cache";
import { NBA_API } from "@/lib/api";
import type {
  GameDetail,
  Injury,
  Play,
  StatLine,
  TeamBoxScore,
  TeamInjuries,
  TeamLeaders,
  TeamStats,
} from "@/types/boxscore";
import type { Game, GameStatus, GameTeam, Scoreboard } from "@/types/game";
import type { NewsArticle, NewsImage } from "@/types/news";

type EspnCompetitor = {
  homeAway: "home" | "away";
  winner?: boolean;
  score?: string;
  records?: { summary?: string }[];
  team: {
    id: string;
    abbreviation: string;
    displayName: string;
    color?: string;
    logo?: string;
    logoDark?: string;
  };
};

type EspnEvent = {
  id: string;
  date: string;
  status: {
    period: number;
    displayClock: string;
    type: { name: string; state: "pre" | "in" | "post" };
  };
  competitions: { competitors: EspnCompetitor[] }[];
};

type EspnScoreboard = {
  /** Solo viene cuando no se pasa `?dates=`. */
  day?: { date: string };
  leagues: { calendar?: string[] }[];
  events: EspnEvent[];
};

type EspnNewsImage = {
  type: string;
  name?: string;
  url: string;
  alt?: string;
  caption?: string;
};

type EspnNews = {
  articles: {
    id: number;
    headline: string;
    description?: string;
    byline?: string;
    published: string;
    links: { web: { href: string } };
    images?: EspnNewsImage[];
  }[];
};

/**
 * Las crónicas traen una foto (`header`); las previas solo imágenes
 * generadas (`stitcher`), de las que elegimos la 16:9 más grande.
 */
function pickNewsImage(
  images: EspnNewsImage[] = [],
  headline: string,
): NewsImage | null {
  const image =
    images.find((i) => i.type === "header") ??
    images.find((i) => i.name === "espn.all.awayhome.16x9.2") ??
    images.find((i) => i.name?.includes("16x9"));
  if (!image) return null;
  return {
    url: image.url.replace(/^http:/, "https:"),
    alt: image.alt || image.caption || headline,
  };
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`ESPN respondió ${response.status} en ${url}`);
  }
  return response.json() as Promise<T>;
}

function toTeam(competitor: EspnCompetitor, hasScore: boolean): GameTeam {
  return {
    id: competitor.team.id,
    abbreviation: competitor.team.abbreviation,
    displayName: competitor.team.displayName,
    color: competitor.team.color ?? null,
    logo: competitor.team.logo ?? null,
    logoDark: competitor.team.logoDark ?? competitor.team.logo ?? null,
    score: hasScore && competitor.score ? Number(competitor.score) : null,
    record: competitor.records?.[0]?.summary ?? null,
    winner: competitor.winner ?? false,
  };
}

function toStatus(status: EspnEvent["status"]): GameStatus {
  if (status.type.name === "STATUS_POSTPONED") return { state: "postponed" };
  switch (status.type.state) {
    case "pre":
      return { state: "scheduled" };
    case "in":
      return {
        state: "live",
        period: status.period,
        clock: status.displayClock,
        halftime: status.type.name === "STATUS_HALFTIME",
      };
    case "post":
      return { state: "final", period: status.period };
  }
}

function toGame(event: EspnEvent): Game {
  const status = toStatus(event.status);
  const hasScore = status.state === "live" || status.state === "final";
  const competitors = event.competitions[0].competitors;
  const away = competitors.find((c) => c.homeAway === "away")!;
  const home = competitors.find((c) => c.homeAway === "home")!;
  return {
    id: event.id,
    startsAt: event.date,
    away: toTeam(away, hasScore),
    home: toTeam(home, hasScore),
    status,
  };
}

/** @param date Jornada en formato `YYYYMMDD` (fecha de EE. UU.). Sin ella, ESPN devuelve la jornada actual. */
export async function getScoreboard(date?: string): Promise<Scoreboard> {
  "use cache";
  cacheLife("seconds");

  const url = date ? `${NBA_API.scoreboard}?dates=${date}` : NBA_API.scoreboard;
  const data = await getJson<EspnScoreboard>(url);
  // Con `?dates=` ESPN no devuelve `day`: la jornada es la que hemos pedido.
  const day = date
    ? `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`
    : data.day!.date;
  const games = data.events
    .map(toGame)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const calendar = data.leagues[0]?.calendar ?? [];
  const nextGameDay =
    games.length === 0
      ? (calendar.find((calendarDay) => calendarDay.slice(0, 10) > day) ?? null)
      : null;
  // ESPN marca cada jornada a las 07:00Z (medianoche en el Pacífico): los
  // 10 primeros caracteres son la fecha de EE. UU.
  const gameDays = calendar.map((calendarDay) => calendarDay.slice(0, 10));

  return { day, games, nextGameDay, gameDays };
}

/** Sin caché: lo llama la sincronización (`lib/news.ts`), que guarda el resultado en BD. */
export async function fetchNews(limit = 50): Promise<NewsArticle[]> {
  const data = await getJson<EspnNews>(`${NBA_API.news}?limit=${limit}`);
  return data.articles.map((article) => ({
    id: String(article.id),
    headline: article.headline,
    description: article.description ?? null,
    byline: article.byline ?? null,
    publishedAt: article.published,
    url: article.links.web.href.replace(/^http:/, "https:"),
    image: pickNewsImage(article.images, article.headline),
  }));
}

type EspnSummaryCompetitor = {
  homeAway: "home" | "away";
  winner?: boolean;
  score?: string;
  linescores?: { displayValue: string }[];
  record?: { type: string; summary: string }[];
  team: {
    id: string;
    abbreviation: string;
    displayName: string;
    color?: string;
    logos?: { href: string; rel: string[] }[];
  };
};

type EspnStatGroup = {
  keys: string[];
  totals: string[];
  athletes: {
    starter: boolean;
    didNotPlay: boolean;
    ejected: boolean;
    reason?: string;
    stats: string[];
    athlete: {
      id: string;
      displayName: string;
      shortName: string;
      jersey?: string;
      position?: { abbreviation: string };
    };
  }[];
};

type EspnPlayers = { team: { id: string }; statistics: EspnStatGroup[] };

type EspnLeaders = {
  team: { id: string };
  leaders?: {
    name: string;
    leaders?: {
      displayValue: string;
      athlete: { displayName: string };
      statistics?: { abbreviation: string; displayValue: string }[];
    }[];
  }[];
};

type EspnInjuries = {
  team: { id: string };
  injuries: {
    status: string;
    athlete: { displayName: string; position?: { abbreviation: string } };
    details?: { type?: string; side?: string };
  }[];
};

type EspnSummary = {
  header: {
    competitions: {
      date: string;
      status: {
        period?: number;
        displayClock?: string;
        type: EspnEvent["status"]["type"];
      };
      competitors: EspnSummaryCompetitor[];
      broadcasts?: { media?: { shortName?: string } }[];
    }[];
  };
  boxscore?: {
    teams?: { team: { id: string }; statistics: { name: string; displayValue: string }[] }[];
    players?: EspnPlayers[];
  };
  gameInfo?: {
    venue?: { fullName: string; address?: { city?: string; state?: string } };
    attendance?: number;
    officials?: { displayName: string }[];
  };
  leaders?: EspnLeaders[];
  injuries?: EspnInjuries[];
  seasonseries?: { type: string; summary: string }[];
  plays?: {
    id: string;
    text: string;
    awayScore: number;
    homeScore: number;
    scoringPlay: boolean;
    period: { number: number };
    clock: { displayValue: string };
    team?: { id: string };
  }[];
};

function pickLogo(team: EspnSummaryCompetitor["team"], rel: string) {
  return team.logos?.find((logo) => logo.rel.includes(rel))?.href ?? null;
}

function toSummaryTeam(competitor: EspnSummaryCompetitor, hasScore: boolean): GameTeam {
  const logo = pickLogo(competitor.team, "default");
  return {
    id: competitor.team.id,
    abbreviation: competitor.team.abbreviation,
    displayName: competitor.team.displayName,
    color: competitor.team.color ?? null,
    logo,
    logoDark: pickLogo(competitor.team, "dark") ?? logo,
    score: hasScore && competitor.score ? Number(competitor.score) : null,
    record: competitor.record?.find((r) => r.type === "total")?.summary ?? null,
    winner: competitor.winner ?? false,
  };
}

/** ESPN usa `""` o `"--"` para lo que no hay. */
function statValue(value: string | undefined) {
  return value && value !== "--" ? value : null;
}

function toStatLine(keys: string[], values: string[]): StatLine {
  return Object.fromEntries(keys.map((key, i) => [key, statValue(values[i])]));
}

const DNP_REASONS: Record<string, string> = {
  "COACH'S DECISION": "Decisión técnica",
  "NOT WITH TEAM": "No está con el equipo",
};

function toBoxScore(players: EspnPlayers): TeamBoxScore {
  const group = players.statistics[0];
  return {
    teamId: players.team.id,
    totals: toStatLine(group.keys, group.totals),
    players: group.athletes.map((a) => ({
      id: a.athlete.id,
      name: a.athlete.displayName,
      shortName: a.athlete.shortName,
      position: a.athlete.position?.abbreviation ?? null,
      jersey: a.athlete.jersey ?? null,
      starter: a.starter,
      didNotPlay: a.didNotPlay,
      // ESPN pone motivo también a quien sí juega: solo vale si no ha jugado.
      reason: a.didNotPlay && a.reason ? (DNP_REASONS[a.reason] ?? a.reason) : null,
      ejected: a.ejected,
      stats: toStatLine(group.keys, a.stats),
    })),
  };
}

const INJURY_STATUS: Record<string, string> = {
  Out: "Baja",
  "Day-To-Day": "Día a día",
  Questionable: "Duda",
  Doubtful: "Muy dudoso",
  Probable: "Probable",
  Suspension: "Sancionado",
};

function toInjuries(entry: EspnInjuries): TeamInjuries {
  return {
    teamId: entry.team.id,
    injuries: entry.injuries.map(
      (injury): Injury => ({
        athlete: injury.athlete.displayName,
        position: injury.athlete.position?.abbreviation ?? null,
        status: INJURY_STATUS[injury.status] ?? injury.status,
        detail:
          [injury.details?.type, injury.details?.side].filter(Boolean).join(", ") || null,
      }),
    ),
  };
}

function toLeaders(entry: EspnLeaders): TeamLeaders {
  return {
    teamId: entry.team.id,
    leaders: (entry.leaders ?? []).flatMap((category) => {
      const leader = category.leaders?.[0];
      if (!leader) return [];
      const detail = (leader.statistics ?? [])
        // La primera estadística repite el valor principal.
        .slice(1)
        .map((stat) => `${stat.abbreviation} ${stat.displayValue}`)
        .join(" · ");
      return [
        {
          category: category.name,
          athlete: leader.athlete.displayName,
          value: leader.displayValue,
          detail: detail || null,
        },
      ];
    }),
  };
}

/** "LAL lead series 1-0" → "LAL lidera la serie 1-0". */
function translateSeries(summary: string) {
  return summary
    .replace(/^(\S+) leads? series (.+)$/, "$1 lidera la serie $2")
    .replace(/^(\S+) wins? series (.+)$/, "$1 gana la serie $2")
    .replace(/^(\S+) won series (.+)$/, "$1 ganó la serie $2")
    .replace(/^Series tied (.+)$/, "Serie empatada $1");
}

/** `null` si ESPN no conoce el partido. */
export async function getGameDetail(gameId: string): Promise<GameDetail | null> {
  "use cache";

  const response = await fetch(NBA_API.summary(gameId));
  if (response.status === 404 || response.status === 400) {
    cacheLife("hours");
    return null;
  }
  if (!response.ok) {
    throw new Error(`ESPN respondió ${response.status} en el partido ${gameId}`);
  }
  const data = (await response.json()) as EspnSummary;

  const competition = data.header.competitions[0];
  const away = competition.competitors.find((c) => c.homeAway === "away")!;
  const home = competition.competitors.find((c) => c.homeAway === "home")!;
  const linescores = {
    away: (away.linescores ?? []).map((l) => Number(l.displayValue)),
    home: (home.linescores ?? []).map((l) => Number(l.displayValue)),
  };
  const status = toStatus({
    period: competition.status.period ?? linescores.home.length,
    displayClock: competition.status.displayClock ?? "",
    type: competition.status.type,
  });

  // En directo se refresca cada pocos segundos; terminado apenas cambia.
  if (status.state === "live") cacheLife("seconds");
  else if (status.state === "final") cacheLife("hours");
  else cacheLife("minutes");

  const hasScore = status.state === "live" || status.state === "final";
  const venue = data.gameInfo?.venue;
  const series = data.seasonseries?.find((s) => s.type === "season")?.summary;

  return {
    id: gameId,
    startsAt: competition.date,
    away: toSummaryTeam(away, hasScore),
    home: toSummaryTeam(home, hasScore),
    status,
    linescores,
    venue: venue
      ? {
          name: venue.fullName,
          city: [venue.address?.city, venue.address?.state].filter(Boolean).join(", ") || null,
        }
      : null,
    attendance: data.gameInfo?.attendance || null,
    officials: (data.gameInfo?.officials ?? []).map((o) => o.displayName),
    broadcasts: [
      ...new Set(
        (competition.broadcasts ?? []).flatMap((b) =>
          b.media?.shortName ? [b.media.shortName] : [],
        ),
      ),
    ],
    seasonSeries: series ? translateSeries(series) : null,
    teamStats: (data.boxscore?.teams ?? []).map(
      (team): TeamStats => ({
        teamId: team.team.id,
        stats: Object.fromEntries(
          team.statistics.map((s) => [s.name, statValue(s.displayValue)]),
        ),
      }),
    ),
    boxScore: (data.boxscore?.players ?? [])
      .filter((p) => p.statistics[0]?.athletes.length)
      .map(toBoxScore),
    leaders: (data.leaders ?? []).map(toLeaders),
    injuries: (data.injuries ?? []).map(toInjuries).filter((t) => t.injuries.length > 0),
    plays: (data.plays ?? []).map(
      (play): Play => ({
        id: play.id,
        period: play.period.number,
        clock: play.clock.displayValue,
        text: play.text,
        teamId: play.team?.id ?? null,
        awayScore: play.awayScore,
        homeScore: play.homeScore,
        scoring: play.scoringPlay,
      }),
    ),
  };
}
