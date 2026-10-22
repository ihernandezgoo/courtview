export type GameTeam = {
  id: string;
  abbreviation: string;
  displayName: string;
  /** Hex sin `#`, tal como lo devuelve ESPN. */
  color: string | null;
  /** Logo para fondo claro y para fondo oscuro. */
  logo: string | null;
  logoDark: string | null;
  score: number | null;
  record: string | null;
  winner: boolean;
};

export type GameStatus =
  | { state: "scheduled" }
  | { state: "live"; period: number; clock: string; halftime: boolean }
  | { state: "final"; period: number }
  | { state: "postponed" };

export type Game = {
  id: string;
  /** ISO 8601 en UTC. */
  startsAt: string;
  away: GameTeam;
  home: GameTeam;
  status: GameStatus;
};

export type Scoreboard = {
  /** Fecha de la jornada en EE. UU. (`YYYY-MM-DD`). */
  day: string;
  games: Game[];
  /** Próxima fecha con partidos, en UTC, si la jornada está vacía. */
  nextGameDay: string | null;
  /** Todas las jornadas con partidos de la temporada (`YYYY-MM-DD`, fecha de EE. UU.). */
  gameDays: string[];
};
