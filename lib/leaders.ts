import { cacheLife } from "next/cache";
import { nbaApi } from "@/lib/api";
import { getJson } from "@/lib/nba";
import { pickTeamLogos } from "@/lib/standings";
import type { Leader, LeaderCategory, LeaderStatKind } from "@/types/leaders";

type EspnLeaders = {
  leaders: {
    categories: {
      name: string;
      leaders: {
        value: number;
        athlete: { id: string; displayName: string; position?: { abbreviation: string } };
        team?: {
          id: string;
          abbreviation: string;
          displayName: string;
          color?: string;
          logos?: { href: string; rel: string[] }[];
        };
      }[];
    }[];
  };
};

/**
 * Categorías que mostramos y en qué orden. Dejamos fuera las que a principio
 * de temporada no significan nada (PER, valoración de ESPN, faltas).
 */
const CATEGORIES: { id: string; abbreviation: string; label: string; kind: LeaderStatKind }[] = [
  { id: "pointsPerGame", abbreviation: "PTS", label: "Puntos por partido", kind: "average" },
  { id: "reboundsPerGame", abbreviation: "REB", label: "Rebotes por partido", kind: "average" },
  { id: "assistsPerGame", abbreviation: "AST", label: "Asistencias por partido", kind: "average" },
  { id: "stealsPerGame", abbreviation: "STL", label: "Robos por partido", kind: "average" },
  { id: "blocksPerGame", abbreviation: "BLK", label: "Tapones por partido", kind: "average" },
  { id: "3PointsMadePerGame", abbreviation: "3PM", label: "Triples por partido", kind: "average" },
  { id: "fieldGoalPercentage", abbreviation: "FG%", label: "Tiros de campo", kind: "percent" },
  { id: "3PointPct", abbreviation: "3P%", label: "Triples", kind: "percent" },
  { id: "FreeThrowPct", abbreviation: "FT%", label: "Tiros libres", kind: "percent" },
  { id: "minutesPerGame", abbreviation: "MIN", label: "Minutos por partido", kind: "average" },
  { id: "avgTurnovers", abbreviation: "TO", label: "Pérdidas por partido", kind: "average" },
  { id: "doubleDouble", abbreviation: "DD", label: "Dobles-dobles", kind: "total" },
  { id: "points", abbreviation: "PTS", label: "Puntos totales", kind: "total" },
];

/** ESPN da unos porcentajes sobre 100 (`78.4`) y otros sobre 1 (`0.8`). */
function normalize(value: number, kind: LeaderStatKind) {
  return kind === "percent" && value <= 1 ? value * 100 : value;
}

function toLeaders(
  entries: EspnLeaders["leaders"]["categories"][number]["leaders"],
  kind: LeaderStatKind,
): Leader[] {
  // Empates al decimal que se muestra: comparten puesto.
  const shown = (value: number) => (kind === "total" ? Math.round(value) : value.toFixed(1));
  let rank = 0;
  return entries.map((entry, i) => {
    const value = normalize(entry.value, kind);
    const previous = i > 0 ? normalize(entries[i - 1].value, kind) : null;
    if (previous === null || shown(previous) !== shown(value)) rank = i + 1;
    return {
      rank,
      athlete: {
        id: entry.athlete.id,
        name: entry.athlete.displayName,
        position: entry.athlete.position?.abbreviation ?? null,
      },
      team: entry.team
        ? {
            id: entry.team.id,
            abbreviation: entry.team.abbreviation,
            displayName: entry.team.displayName,
            color: entry.team.color ?? null,
            ...pickTeamLogos(entry.team.logos),
          }
        : null,
      value,
    };
  });
}

/** Los 10 primeros de cada categoría en la temporada actual. */
export async function getLeaders(): Promise<LeaderCategory[]> {
  "use cache";
  cacheLife("minutes");

  const data = await getJson<EspnLeaders>(nbaApi().leaders);
  return CATEGORIES.flatMap((category) => {
    const source = data.leaders.categories.find((c) => c.name === category.id);
    if (!source?.leaders.length) return [];
    return [{ ...category, leaders: toLeaders(source.leaders, category.kind) }];
  });
}
