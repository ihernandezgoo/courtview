import { TeamMark } from "@/components/TeamMark";
import {
  formatAverage,
  formatGamesBehind,
  formatRecord,
  formatSignedAverage,
  formatStreak,
  formatWinPct,
} from "@/lib/format";
import { gamesBehind, PLAY_IN_CUTOFF, PLAYOFF_CUTOFF } from "@/lib/standings";
import type { Standing } from "@/types/standings";

type Column = {
  label: string;
  title: string;
  format: (row: Standing, leader: Standing) => string;
  /** Clase extra de la celda (color de racha o diferencia). */
  tone?: (row: Standing) => string;
  /** Línea a la izquierda para separar bloques. */
  divider?: boolean;
};

const toneOf = (value: number | null) =>
  value === null || value === 0 ? "" : value > 0 ? "text-win" : "text-loss";

const COLUMNS: Column[] = [
  { label: "V", title: "Victorias", format: (r) => String(r.wins) },
  { label: "D", title: "Derrotas", format: (r) => String(r.losses) },
  { label: "%", title: "Porcentaje de victorias", format: (r) => formatWinPct(r.winPercent) },
  {
    label: "PD",
    title: "Partidos de diferencia con el primero",
    format: (r, leader) => formatGamesBehind(gamesBehind(leader, r)),
  },
  { label: "Casa", title: "Récord en casa", format: (r) => formatRecord(r.home), divider: true },
  { label: "Fuera", title: "Récord fuera", format: (r) => formatRecord(r.road) },
  { label: "Conf", title: "Récord contra la conferencia", format: (r) => formatRecord(r.vsConference) },
  { label: "Div", title: "Récord contra la división", format: (r) => formatRecord(r.vsDivision) },
  { label: "U10", title: "Últimos 10 partidos", format: (r) => formatRecord(r.lastTen) },
  {
    label: "Racha",
    title: "Racha actual (V: victorias, D: derrotas)",
    format: (r) => formatStreak(r.streak),
    tone: (r) => toneOf(r.streak),
  },
  { label: "PPG", title: "Puntos a favor por partido", format: (r) => formatAverage(r.pointsFor), divider: true },
  { label: "OPP", title: "Puntos en contra por partido", format: (r) => formatAverage(r.pointsAgainst) },
  {
    label: "DIF",
    title: "Diferencia de puntos por partido",
    format: (r) => formatSignedAverage(r.differential),
    tone: (r) => toneOf(r.differential),
  },
];

const STICKY = "sticky left-0 z-10 bg-background";
const CELL = "h-9 px-2 text-right tabular-nums whitespace-nowrap";

type Props = {
  /** Ya ordenadas; los partidos de diferencia se cuentan respecto a la primera. */
  rows: Standing[];
  caption: string;
  /** Marca las líneas de corte de playoffs y play-in (solo en la vista de conferencia). */
  cutoffs?: boolean;
};

export function StandingsTable({ rows, caption, cutoffs = false }: Props) {
  const leader = rows[0];
  if (!leader) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-foreground">
            <th scope="col" className={`${STICKY} h-8 w-8 pl-2 text-right text-[11px] font-semibold text-muted`}>
              <abbr title="Puesto" className="no-underline">
                #
              </abbr>
            </th>
            <th
              scope="col"
              className="sticky left-8 z-10 h-8 bg-background pr-3 pl-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted"
            >
              Equipo
            </th>
            {COLUMNS.map((column) => (
              <th
                key={column.label}
                scope="col"
                className={`h-8 px-2 text-right text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap text-muted ${
                  column.divider ? "border-l border-line" : ""
                }`}
              >
                <abbr title={column.title} className="no-underline">
                  {column.label}
                </abbr>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const border =
              cutoffs && i === PLAYOFF_CUTOFF
                ? "border-t border-t-foreground/50"
                : cutoffs && i === PLAY_IN_CUTOFF
                  ? "border-t border-dashed border-t-foreground/50"
                  : "border-t border-line";
            return (
              <tr key={row.team.id} className={`${border} group hover:bg-surface`}>
                <td className={`${STICKY} h-9 w-8 pl-2 text-right tabular-nums text-muted group-hover:bg-surface`}>
                  {i + 1}
                </td>
                <th
                  scope="row"
                  className="sticky left-8 z-10 h-9 bg-background pr-3 pl-3 text-left font-medium whitespace-nowrap group-hover:bg-surface"
                >
                  <span className="flex items-center gap-2">
                    <TeamMark team={row.team} />
                    <span className="hidden font-normal text-muted lg:inline">{row.team.displayName}</span>
                  </span>
                </th>
                {COLUMNS.map((column) => (
                  <td
                    key={column.label}
                    className={`${CELL} ${column.divider ? "border-l border-line" : ""} ${
                      column.tone?.(row) ?? ""
                    }`}
                  >
                    {column.format(row, leader)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Leyenda de las líneas de corte, para poner bajo las tablas de conferencia. */
export function CutoffLegend() {
  return (
    <p className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
      <span className="flex items-center gap-2">
        <span aria-hidden className="w-5 border-t border-foreground/50" />
        Playoffs directos (1.º–{PLAYOFF_CUTOFF}.º)
      </span>
      <span className="flex items-center gap-2">
        <span aria-hidden className="w-5 border-t border-dashed border-foreground/50" />
        Play-in ({PLAYOFF_CUTOFF + 1}.º–{PLAY_IN_CUTOFF}.º)
      </span>
    </p>
  );
}
