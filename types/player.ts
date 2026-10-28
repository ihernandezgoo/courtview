import type { StatLine } from "@/types/boxscore";
import type { TeamRef } from "@/types/standings";

export type Draft = { year: number; round: number; pick: number; team: string | null };

export type PlayerBio = {
  id: string;
  name: string;
  jersey: string | null;
  /** Abreviatura de ESPN: `PG`, `G`, `F-C`… */
  position: string | null;
  team: TeamRef | null;
  headshot: string | null;
  heightInches: number | null;
  weightLbs: number | null;
  age: number | null;
  /** `YYYY-MM-DD`. */
  birthDate: string | null;
  birthPlace: string | null;
  /** `null` si no fue elegido en el draft. */
  draft: Draft | null;
  /** Temporada en la liga: 1 para un novato. */
  experience: number | null;
};

/** Puesto en la liga de una estadística de la temporada. */
export type StatRank = { rank: number; tied: boolean };

export type PlayerGame = {
  id: string;
  /** ISO 8601 en UTC. */
  startsAt: string;
  home: boolean;
  opponent: TeamRef;
  /** `null` si ESPN no lo da (partido sin terminar). */
  won: boolean | null;
  teamScore: number | null;
  opponentScore: number | null;
  stats: StatLine;
};

export type PlayerGameGroup = {
  /** "Temporada regular", "Playoffs", "Pretemporada". */
  label: string;
  /** Del más reciente al más antiguo. */
  games: PlayerGame[];
};

export type PlayerSeason = {
  /** `2024-25`. */
  season: string;
  /** `null` en la fila de total de una temporada con traspaso. */
  team: TeamRef | null;
  stats: StatLine;
};

export type PlayerProfile = {
  bio: PlayerBio;
  /** Temporada del registro de partidos y de los promedios destacados: `2026-27`. */
  season: string | null;
  /** Promedios de esa temporada en temporada regular; `null` si no ha jugado. */
  averages: StatLine | null;
  /** Puestos en la liga por clave de `averages` (`avgPoints`…). */
  ranks: Record<string, StatRank>;
  gameLog: PlayerGameGroup[];
  /** Promedios por temporada, de la más antigua a la actual. */
  seasons: PlayerSeason[];
  career: StatLine | null;
};
