import type { Game } from "@/types/game";

/** Estadísticas tal como las da ESPN, por clave (`points`, `fieldGoalsMade-fieldGoalsAttempted`…). */
export type StatLine = Record<string, string | null>;

export type BoxScorePlayer = {
  id: string;
  name: string;
  shortName: string;
  position: string | null;
  jersey: string | null;
  starter: boolean;
  didNotPlay: boolean;
  /** Motivo de no jugar ("COACH'S DECISION"…), solo si no ha jugado. */
  reason: string | null;
  ejected: boolean;
  stats: StatLine;
};

export type TeamBoxScore = {
  teamId: string;
  players: BoxScorePlayer[];
  totals: StatLine;
};

export type TeamStats = {
  teamId: string;
  stats: StatLine;
};

export type GameLeader = {
  /** `points`, `rebounds`, `assists` o, antes del partido, `pointsPerGame`… */
  category: string;
  athleteId: string;
  athlete: string;
  value: string;
  /** Resumen del resto de su línea: "FG 7/18 · FT 9/9". */
  detail: string | null;
};

export type TeamLeaders = {
  teamId: string;
  leaders: GameLeader[];
};

export type Play = {
  id: string;
  period: number;
  clock: string;
  text: string;
  teamId: string | null;
  awayScore: number;
  homeScore: number;
  scoring: boolean;
};

export type Injury = {
  athlete: string;
  position: string | null;
  status: string;
  detail: string | null;
};

export type TeamInjuries = {
  teamId: string;
  injuries: Injury[];
};

export type GameDetail = Game & {
  /** Puntos por periodo de cada equipo (4 cuartos + prórrogas). Vacío antes del partido. */
  linescores: { away: number[]; home: number[] };
  venue: { name: string; city: string | null } | null;
  attendance: number | null;
  officials: string[];
  broadcasts: string[];
  /** "LAL lidera la serie 1-0". */
  seasonSeries: string | null;
  teamStats: TeamStats[];
  boxScore: TeamBoxScore[];
  leaders: TeamLeaders[];
  injuries: TeamInjuries[];
  plays: Play[];
};
