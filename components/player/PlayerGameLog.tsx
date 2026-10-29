import Link from "next/link";
import { TeamMark } from "@/components/TeamMark";
import { formatGameResult, formatPctValue, formatShortDate, formatStat } from "@/lib/format";
import type { StatLine } from "@/types/boxscore";
import type { PlayerGame } from "@/types/player";

type Column = {
  label: string;
  title: string;
  format: (stats: StatLine) => string;
  /** Línea a la izquierda para separar bloques (tiro). */
  divider?: boolean;
};

const stat = (key: string) => (s: StatLine) => formatStat(s[key]);
const pct = (key: string, madeAttempted: string) => (s: StatLine) =>
  formatPctValue(s[key], s[madeAttempted]);

const FG = "fieldGoalsMade-fieldGoalsAttempted";
const THREE = "threePointFieldGoalsMade-threePointFieldGoalsAttempted";
const FT = "freeThrowsMade-freeThrowsAttempted";

const COLUMNS: Column[] = [
  { label: "MIN", title: "Minutos", format: stat("minutes") },
  { label: "PTS", title: "Puntos", format: stat("points") },
  { label: "REB", title: "Rebotes", format: stat("totalRebounds") },
  { label: "AST", title: "Asistencias", format: stat("assists") },
  { label: "STL", title: "Robos", format: stat("steals") },
  { label: "BLK", title: "Tapones", format: stat("blocks") },
  { label: "TO", title: "Pérdidas", format: stat("turnovers") },
  { label: "FG", title: "Tiros de campo (anotados-intentados)", format: stat(FG), divider: true },
  { label: "FG%", title: "Porcentaje de tiros de campo", format: pct("fieldGoalPct", FG) },
  { label: "3P", title: "Triples (anotados-intentados)", format: stat(THREE) },
  { label: "3P%", title: "Porcentaje de triples", format: pct("threePointPct", THREE) },
  { label: "FT", title: "Tiros libres (anotados-intentados)", format: stat(FT) },
  { label: "FT%", title: "Porcentaje de tiros libres", format: pct("freeThrowPct", FT) },
  { label: "PF", title: "Faltas personales", format: stat("fouls"), divider: true },
];

const STICKY = "sticky left-0 z-10 bg-card";
const CELL = "h-9 px-2 text-right tabular-nums whitespace-nowrap";
const HEAD = "h-8 px-2 text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap text-muted";

export function PlayerGameLog({ games, caption }: { games: PlayerGame[]; caption: string }) {
  return (
    <div className="panel overflow-x-auto">
      <table className="w-full text-[13px]">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-line">
            <th scope="col" className={`${STICKY} ${HEAD} pl-2 text-left`}>
              Fecha
            </th>
            <th scope="col" className={`${HEAD} text-left`}>
              Rival
            </th>
            <th scope="col" className={`${HEAD} text-left`}>
              <abbr title="Resultado (V: victoria, D: derrota)" className="no-underline">
                Res
              </abbr>
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
          {games.map((game) => (
            <tr key={game.id} className="group border-t border-line hover:bg-surface">
              <th
                scope="row"
                className={`${STICKY} h-9 pr-3 pl-2 text-left font-normal whitespace-nowrap group-hover:bg-surface`}
              >
                <Link href={`/partidos/${game.id}`} className="tabular-nums hover:text-accent hover:underline">
                  {formatShortDate(game.startsAt)}
                </Link>
              </th>
              <td className="h-9 px-2 whitespace-nowrap">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 text-muted">{game.home ? "vs" : "@"}</span>
                  <TeamMark team={game.opponent} />
                </span>
              </td>
              <td
                className={`h-9 px-2 whitespace-nowrap tabular-nums ${
                  game.won === null ? "text-muted" : game.won ? "text-win" : "text-loss"
                }`}
              >
                {formatGameResult(game.won, game.teamScore, game.opponentScore)}
              </td>
              {COLUMNS.map((column) => (
                <td
                  key={column.label}
                  className={`${CELL} ${column.divider ? "border-l border-line" : ""} ${
                    column.label === "PTS" ? "font-semibold" : ""
                  }`}
                >
                  {column.format(game.stats)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
