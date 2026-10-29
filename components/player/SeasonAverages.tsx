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
    <dl className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {STATS.map((stat) => {
        const rank = ranks[stat.key];
        return (
          <div key={stat.key} className="panel flex flex-col gap-1.5 px-3 py-3">
            <dt className="text-[11px] font-bold uppercase tracking-wider text-accent">
              <abbr title={stat.title} className="no-underline">
                {stat.label}
              </abbr>
            </dt>
            <dd className="font-display text-4xl font-extrabold leading-none tabular-nums">
              {stat.attempts
                ? formatPctValue(averages[stat.key], averages[stat.attempts])
                : formatStat(averages[stat.key])}
            </dd>
            {rank && (
              <dd className="text-[11px] text-muted tabular-nums">{formatRank(rank)} en la NBA</dd>
            )}
          </div>
        );
      })}
    </dl>
  );
}
