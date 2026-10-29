import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatMonth } from "@/lib/format";

type Props = {
  /** Jornada seleccionada, `YYYY-MM-DD` (fecha de EE. UU.). */
  selected: string;
  /** Mes que se está viendo, `YYYY-MM`. */
  month: string;
  /** Jornada de hoy, `YYYY-MM-DD`. */
  today: string;
  gameDays: string[];
};

const WEEKDAYS = [
  { short: "L", long: "lunes" },
  { short: "M", long: "martes" },
  { short: "X", long: "miércoles" },
  { short: "J", long: "jueves" },
  { short: "V", long: "viernes" },
  { short: "S", long: "sábado" },
  { short: "D", long: "domingo" },
];

function shiftMonth(month: string, delta: number) {
  const [year, m] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, m - 1 + delta, 1));
  return date.toISOString().slice(0, 7);
}

/** Celdas del mes empezando en lunes; `null` son huecos antes del día 1. */
function monthCells(month: string) {
  const [year, m] = month.split("-").map(Number);
  const first = new Date(Date.UTC(year, m - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, m, 0)).getUTCDate();
  const offset = (first.getUTCDay() + 6) % 7;
  return [
    ...Array.from({ length: offset }, () => null),
    ...Array.from(
      { length: daysInMonth },
      (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`,
    ),
  ];
}

export function GameCalendar({ selected, month, today, gameDays }: Props) {
  const withGames = new Set(gameDays);
  // `calendario=1` mantiene abierto el desplegable al cambiar de mes.
  const monthHref = (delta: number) =>
    `/partidos?fecha=${selected}&mes=${shiftMonth(month, delta)}&calendario=1`;

  return (
    <div className="w-full max-w-72">
      <div className="mb-2 flex items-center justify-between">
        <Link
          href={monthHref(-1)}
          aria-label="Mes anterior"
          className="flex size-8 items-center justify-center rounded-sm text-muted hover:bg-surface hover:text-foreground"
        >
          <ChevronLeft size={16} strokeWidth={1.75} />
        </Link>
        <h2 className="text-sm font-semibold first-letter:uppercase">{formatMonth(month)}</h2>
        <Link
          href={monthHref(1)}
          aria-label="Mes siguiente"
          className="flex size-8 items-center justify-center rounded-sm text-muted hover:bg-surface hover:text-foreground"
        >
          <ChevronRight size={16} strokeWidth={1.75} />
        </Link>
      </div>

      <div className="grid grid-cols-7 text-center">
        {WEEKDAYS.map((day) => (
          <abbr
            key={day.short}
            title={day.long}
            className="pb-1 text-[11px] font-semibold uppercase tracking-wide text-subtle no-underline"
          >
            {day.short}
          </abbr>
        ))}
        {monthCells(month).map((day, i) => {
          if (!day) return <span key={`hueco-${i}`} />;
          const number = Number(day.slice(8));
          const isSelected = day === selected;
          const isToday = day === today;
          const hasGames = withGames.has(day);
          const base = "relative flex h-9 items-center justify-center rounded-sm text-sm tabular-nums";

          if (!hasGames && !isSelected) {
            return (
              <span key={day} className={`${base} text-subtle ${isToday ? "font-semibold underline underline-offset-4" : ""}`}>
                {number}
              </span>
            );
          }

          return (
            <Link
              key={day}
              href={`/partidos?fecha=${day}`}
              aria-current={isSelected ? "date" : undefined}
              aria-label={`${number}${isToday ? ", hoy" : ""}${hasGames ? ", con partidos" : ""}`}
              className={`${base} font-medium ${
                isSelected ? "bg-accent text-accent-foreground" : "hover:bg-surface"
              } ${isToday ? "underline underline-offset-4" : ""}`}
            >
              {number}
              {hasGames && (
                <span
                  aria-hidden
                  className={`absolute bottom-1 size-1 rounded-full ${
                    isSelected ? "bg-accent-foreground" : "bg-accent"
                  }`}
                />
              )}
            </Link>
          );
        })}
      </div>

      {selected !== today && (
        <Link
          href="/partidos"
          className="mt-3 inline-block text-sm font-medium text-accent hover:underline"
        >
          Ir a hoy
        </Link>
      )}
    </div>
  );
}
