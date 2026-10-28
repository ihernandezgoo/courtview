import { formatPctValue, formatRank, formatStat } from "@/lib/format";
import type { StatLine } from "@/types/boxscore";
import type { StatRank } from "@/types/player";

/** `attempts`: clave de anotados-intentados de los porcentajes. */
const STATS: { key: string; label: string; title: string; attempts?: string }[] = [
  { key: "avgPoints", label: "PTS", title: "Puntos por partido" },
  { key: "avgRebounds", label: "REB", title: "Rebotes por partido" },
  { key: "avgAssists", label: "AST", title: "Asistencias por partido" },
  {
    key: "fieldGoalPct",
    label: "FG%",
    title: "Porcentaje de tiros de campo",
    attempts: "avgFieldGoalsMade-avgFieldGoalsAttempted",
  },
  {
    key: "threePointFieldGoalPct",
    label: "3P%",
    title: "Porcentaje de triples",
    attempts: "avgThreePointFieldGoalsMade-avgThreePointFieldGoalsAttempted",
  },
  { key: "avgMinutes", label: "MIN", title: "Minutos por partido" },
];

/** Las 6 cifras de la temporada, en grande, con el puesto en la liga cuando ESPN lo da. */
export function SeasonAverages({
  averages,
  ranks,
}: {
  averages: StatLine;
  ranks: Record<string, StatRank>;
}) {
  return (
    <dl className="grid grid-cols-3 gap-x-4 gap-y-4 sm:grid-cols-6">
      {STATS.map((stat) => {
        const rank = ranks[stat.key];
        return (
          <div key={stat.key} className="flex flex-col">
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">
              <abbr title={stat.title} className="no-underline">
                {stat.label}
              </abbr>
            </dt>
            <dd className="font-score text-4xl font-bold leading-none tabular-nums">
              {stat.attempts
                ? formatPctValue(averages[stat.key], averages[stat.attempts])
                : formatStat(averages[stat.key])}
            </dd>
            {rank && (
              <dd className="mt-1 text-xs text-muted tabular-nums">{formatRank(rank)} en la NBA</dd>
            )}
          </div>
        );
      })}
    </dl>
  );
}
