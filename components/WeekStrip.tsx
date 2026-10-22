import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatDay, formatMonth, formatWeekday } from "@/lib/format";

type Props = {
  /** Jornada seleccionada, `YYYY-MM-DD` (fecha de EE. UU.). */
  selected: string;
  today: string;
  gameDays: string[];
};

function shiftDay(day: string, delta: number) {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + delta);
  return date.toISOString().slice(0, 10);
}

/** Lunes a domingo de la semana de `day`. */
function weekOf(day: string) {
  const weekday = (new Date(`${day}T12:00:00Z`).getUTCDay() + 6) % 7;
  const monday = shiftDay(day, -weekday);
  return Array.from({ length: 7 }, (_, i) => shiftDay(monday, i));
}

const ARROW =
  "flex size-8 items-center justify-center rounded-sm text-muted hover:bg-surface hover:text-foreground";

export function WeekStrip({ selected, today, gameDays }: Props) {
  const withGames = new Set(gameDays);
  const week = weekOf(selected);

  return (
    <nav aria-label="Semana" className="flex flex-col gap-2">
      <div className="relative flex items-center justify-center gap-4">
        {selected !== today && (
          <Link
            href="/partidos"
            className="absolute right-0 rounded-sm px-2 py-1 text-sm font-medium text-accent hover:bg-surface"
          >
            Hoy
          </Link>
        )}
        <Link href={`/partidos?fecha=${shiftDay(selected, -7)}`} aria-label="Semana anterior" className={ARROW}>
          <ChevronLeft size={16} strokeWidth={1.75} />
        </Link>
        <p className="min-w-32 text-center text-sm font-medium text-muted">
          {formatMonth(selected.slice(0, 7))}
        </p>
        <Link href={`/partidos?fecha=${shiftDay(selected, 7)}`} aria-label="Semana siguiente" className={ARROW}>
          <ChevronRight size={16} strokeWidth={1.75} />
        </Link>
      </div>

      <ol className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {week.map((day) => {
          const isSelected = day === selected;
          const isToday = day === today;
          const hasGames = withGames.has(day);
          const content = (
            <>
              <span className={`text-xs ${isSelected ? "" : "text-muted"}`}>{formatWeekday(day)}</span>
              <span className="text-lg font-semibold tabular-nums leading-none">
                {Number(day.slice(8))}
              </span>
              <span
                aria-hidden
                className={`size-1.5 rounded-full ${
                  hasGames ? (isSelected ? "bg-background" : "bg-accent") : "bg-transparent"
                }`}
              />
            </>
          );
          const base = `flex h-[4.5rem] flex-col items-center justify-center gap-1.5 rounded-md border ${
            isToday && !isSelected ? "border-foreground" : "border-line"
          }`;
          const label = `${formatDay(`${day}T12:00:00Z`, "UTC")}${isToday ? ", hoy" : ""}${
            hasGames ? ", con partidos" : ", sin partidos"
          }`;

          return (
            <li key={day}>
              <Link
                href={`/partidos?fecha=${day}`}
                aria-current={isSelected ? "date" : undefined}
                aria-label={label}
                className={`${base} ${
                  isSelected
                    ? "border-accent bg-accent text-background"
                    : `hover:border-subtle hover:bg-surface ${hasGames ? "" : "text-subtle"}`
                }`}
              >
                {content}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
