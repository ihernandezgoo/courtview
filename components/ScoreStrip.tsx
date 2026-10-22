import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { RetryButton } from "@/components/RetryButton";
import { TeamMark } from "@/components/TeamMark";
import {
  formatDay,
  formatGameStatus,
  formatRecord,
  formatScore,
  formatShortDay,
  toNbaDate,
} from "@/lib/format";
import { getScoreboard } from "@/lib/nba";
import type { Game, GameTeam, Scoreboard } from "@/types/game";

const CELL = "w-40 shrink-0 border-r border-line px-3 py-1.5";

/** Celdas mínimas por copia para que el carrusel llene pantallas anchas. */
const MIN_CELLS_PER_COPY = 14;
/** Segundos que tarda cada celda en recorrer su ancho. */
const SECONDS_PER_CELL = 5;

type GameDay = { label: string; scoreboard: Scoreboard };

function StripTeam({ team, game }: { team: GameTeam; game: Game }) {
  const started = game.status.state === "live" || game.status.state === "final";
  const lost = game.status.state === "final" && !team.winner;

  return (
    <div
      className={`flex h-6 items-center text-[13px] font-semibold ${lost ? "text-muted" : ""}`}
    >
      <TeamMark team={team} />
      {started ? (
        <span
          className={`ml-auto font-score text-base tabular-nums leading-none ${
            lost ? "font-medium" : "font-bold"
          }`}
        >
          {formatScore(team.score)}
        </span>
      ) : (
        <span className="ml-auto text-xs font-normal tabular-nums text-muted">
          {formatRecord(team.record)}
        </span>
      )}
    </div>
  );
}

function StripGame({ game }: { game: Game }) {
  const live = game.status.state === "live";

  return (
    <li className="shrink-0">
      <Link href={`/partidos/${game.id}`} className={`block hover:bg-background ${CELL}`}>
        <StripTeam team={game.away} game={game} />
        <StripTeam team={game.home} game={game} />
        <p
          className={`mt-0.5 flex items-center gap-1.5 text-[11px] uppercase tracking-wide tabular-nums ${
            live ? "font-semibold text-live" : "text-muted"
          }`}
        >
          {live && (
            <span
              aria-hidden
              className="size-1.5 rounded-full bg-live motion-safe:animate-pulse"
            />
          )}
          {live && <span className="sr-only">En directo:</span>}
          {formatGameStatus(game.status, game.startsAt)}
        </p>
      </Link>
    </li>
  );
}

function DayLabel({ day }: { day: GameDay }) {
  return (
    <li className="flex w-16 shrink-0 flex-col justify-center border-r border-line bg-background px-2 text-[11px] uppercase tracking-wide">
      <span className="font-semibold">{day.label}</span>
      <span className="text-muted">{formatShortDay(day.scoreboard.day)}</span>
    </li>
  );
}

function Strip({ children }: { children: ReactNode }) {
  return (
    <section
      aria-label="Partidos de ayer, hoy y mañana"
      className="border-b border-line bg-surface"
    >
      {children}
    </section>
  );
}

export async function ScoreStrip() {
  await connection();
  const now = new Date();

  let days: GameDay[];
  try {
    const [yesterday, today, tomorrow] = await Promise.all([
      getScoreboard(toNbaDate(now, -1)),
      getScoreboard(toNbaDate(now)),
      getScoreboard(toNbaDate(now, 1)),
    ]);
    days = [
      { label: "Ayer", scoreboard: yesterday },
      { label: "Hoy", scoreboard: today },
      { label: "Mañana", scoreboard: tomorrow },
    ];
  } catch {
    return (
      <Strip>
        <p className="mx-auto max-w-6xl px-4 py-2 text-xs text-muted">
          No se han podido cargar los partidos. <RetryButton />
        </p>
      </Strip>
    );
  }

  const withGames = days.filter((day) => day.scoreboard.games.length > 0);

  if (withGames.length === 0) {
    const next = days[2].scoreboard.nextGameDay;
    return (
      <Strip>
        <p className="mx-auto max-w-6xl px-4 py-2 text-xs text-muted">
          No hay partidos ni ayer, ni hoy, ni mañana.
          {next && ` Próxima jornada: ${formatDay(next)}.`}
        </p>
      </Strip>
    );
  }

  const cells = withGames.reduce(
    (total, day) => total + 1 + day.scoreboard.games.length,
    0,
  );
  const copies = Math.max(2, Math.ceil(MIN_CELLS_PER_COPY / cells));
  const trackStyle = {
    "--marquee-copies": copies,
    "--marquee-duration": `${cells * SECONDS_PER_CELL}s`,
  } as CSSProperties;

  return (
    <Strip>
      {/* Con movimiento reducido no hay animación: se desliza a mano. */}
      <div className="overflow-hidden motion-reduce:overflow-x-auto motion-reduce:[scrollbar-width:none] motion-reduce:[&::-webkit-scrollbar]:hidden">
        <div
          style={trackStyle}
          className="marquee-track flex w-max"
        >
          {Array.from({ length: copies }, (_, copy) => (
            <ul
              key={copy}
              aria-hidden={copy > 0 || undefined}
              inert={copy > 0 || undefined}
              className={`flex ${copy > 0 ? "motion-reduce:hidden" : ""}`}
            >
              {withGames.map((day) => [
                <DayLabel key={day.label} day={day} />,
                ...day.scoreboard.games.map((game) => (
                  <StripGame key={game.id} game={game} />
                )),
              ])}
            </ul>
          ))}
        </div>
      </div>
    </Strip>
  );
}

export function ScoreStripSkeleton() {
  return (
    <Strip>
      <ul aria-busy aria-label="Cargando partidos" className="flex overflow-hidden">
        {Array.from({ length: 12 }, (_, i) => (
          <li key={i} className={CELL}>
            {[0, 1].map((line) => (
              <div key={line} className="flex h-6 items-center gap-2">
                <span className="size-5 rounded-full bg-line" />
                <span className="h-3 w-9 rounded-sm bg-line" />
                <span className="ml-auto h-3 w-6 rounded-sm bg-line" />
              </div>
            ))}
            <span className="mt-1.5 block h-2.5 w-14 rounded-sm bg-line" />
          </li>
        ))}
      </ul>
    </Strip>
  );
}
