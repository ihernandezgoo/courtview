import type { TeamRef } from "@/types/standings";

/** Cómo se formatea el valor: promedio (1 decimal), porcentaje o total. */
export type LeaderStatKind = "average" | "percent" | "total";

export type Leader = {
  /** Con empates, varios comparten puesto. */
  rank: number;
  athlete: { id: string; name: string; position: string | null };
  team: TeamRef | null;
  value: number;
};

export type LeaderCategory = {
  id: string;
  /** `PTS`, `REB`… */
  abbreviation: string;
  /** "Puntos por partido". */
  label: string;
  kind: LeaderStatKind;
  leaders: Leader[];
};
