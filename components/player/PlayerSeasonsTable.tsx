import { TeamMark } from "@/components/TeamMark";
import { formatPctValue, formatStat } from "@/lib/format";
import type { StatLine } from "@/types/boxscore";
import type { PlayerSeason } from "@/types/player";

type Column = {
  label: string;
  title: string;
  format: (stats: StatLine) => string;
  divider?: boolean;
};

const stat = (key: string) => (s: StatLine) => formatStat(s[key]);
/** Con los intentos por partido, para que una temporada sin triples salga con raya. */
const pct = (key: string, madeAttempted: string) => (s: StatLine) =>
  formatPctValue(s[key], s[madeAttempted]);

const COLUMNS: Column[] = [
  { label: "PJ", title: "Partidos jugados", format: stat("gamesPlayed") },
  { label: "TIT", title: "Partidos como titular", format: stat("gamesStarted") },
  { label: "MIN", title: "Minutos por partido", format: stat("avgMinutes") },
  { label: "PTS", title: "Puntos por partido", format: stat("avgPoints"), divider: true },
  { label: "REB", title: "Rebotes por partido", format: stat("avgRebounds") },
  { label: "AST", title: "Asistencias por partido", format: stat("avgAssists") },
  { label: "STL", title: "Robos por partido", format: stat("avgSteals") },
  { label: "BLK", title: "Tapones por partido", format: stat("avgBlocks") },
  { label: "TO", title: "Pérdidas por partido", format: stat("avgTurnovers") },
  {
    label: "FG%",
    title: "Porcentaje de tiros de campo",
    format: pct("fieldGoalPct", "avgFieldGoalsMade-avgFieldGoalsAttempted"),
    divider: true,
  },
  {
    label: "3P%",
    title: "Porcentaje de triples",
    format: pct("threePointFieldGoalPct", "avgThreePointFieldGoalsMade-avgThreePointFieldGoalsAttempted"),
  },
  {
    label: "FT%",
    title: "Porcentaje de tiros libres",
    format: pct("freeThrowPct", "avgFreeThrowsMade-avgFreeThrowsAttempted"),
  },
];

const STICKY = "sticky left-0 z-10 bg-background";
const CELL = "h-9 px-2 text-right tabular-nums whitespace-nowrap";
const HEAD = "h-8 px-2 text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap text-muted";

function StatCells({ stats }: { stats: StatLine }) {
  return COLUMNS.map((column) => (
    <td key={column.label} className={`${CELL} ${column.divider ? "border-l border-line" : ""}`}>
      {column.format(stats)}
    </td>
  ));
}

/** Promedios por temporada en temporada regular, con la carrera al final. */
export function PlayerSeasonsTable({ seasons, career }: { seasons: PlayerSeason[]; career: StatLine | null }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <caption className="sr-only">Promedios por temporada</caption>
        <thead>
          <tr className="border-b border-foreground">
            <th scope="col" className={`${STICKY} ${HEAD} pl-2 text-left`}>
              Temporada
            </th>
            <th scope="col" className={`${HEAD} text-left`}>
              Equipo
            </th>
            {COLUMNS.map((column) => (
              <th
                key={column.label}
                scope="col"
                className={`${HEAD} text-right ${column.divider ? "border-l border-line" : ""}`}
              >
                <abbr title={column.title} className="no-underline">
                  {column.label}
                </abbr>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {seasons.map((season, i) => (
            <tr
              key={`${season.season}-${season.team?.id ?? "total"}-${i}`}
              className="group border-t border-line hover:bg-surface"
            >
              <th
                scope="row"
                className={`${STICKY} h-9 pr-3 pl-2 text-left font-normal tabular-nums whitespace-nowrap group-hover:bg-surface`}
              >
                {season.season}
              </th>
              <td className="h-9 px-2 whitespace-nowrap">
                {season.team ? (
                  <TeamMark team={season.team} />
                ) : (
                  <abbr title="Total de la temporada entre todos sus equipos" className="no-underline">
                    TOT
                  </abbr>
                )}
              </td>
              <StatCells stats={season.stats} />
            </tr>
          ))}
        </tbody>
        {career && (
          <tfoot>
            <tr className="border-t border-foreground font-semibold">
              <th scope="row" className={`${STICKY} h-9 pr-3 pl-2 text-left`}>
                Carrera
              </th>
              <td className="h-9 px-2" />
              <StatCells stats={career} />
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
