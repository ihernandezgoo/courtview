import type { GameTeam } from "@/types/game";

export type TeamRef = Pick<GameTeam, "id" | "abbreviation" | "displayName" | "color" | "logo" | "logoDark">;

export type ConferenceId = "east" | "west";

export type Standing = {
  team: TeamRef;
  conference: ConferenceId;
  /** Nombre de la división tal como lo da ESPN: `Atlantic`, `Pacific`… */
  division: string;
  /** Puesto en la conferencia según ESPN, ya con desempates aplicados. */
  seed: number | null;
  wins: number;
  losses: number;
  /** Entre 0 y 1. */
  winPercent: number;
  /** Récords parciales `V-D`. */
  home: string | null;
  road: string | null;
  vsConference: string | null;
  vsDivision: string | null;
  lastTen: string | null;
  /** Positivo: victorias seguidas; negativo: derrotas. */
  streak: number | null;
  pointsFor: number | null;
  pointsAgainst: number | null;
  differential: number | null;
};

export type Standings = {
  /** `2026-27`. */
  season: string;
  standings: Standing[];
};
