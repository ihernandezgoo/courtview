import { CalendarDays } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { AutoRefresh } from "@/components/AutoRefresh";
import { GameCalendar } from "@/components/GameCalendar";
import { RetryButton } from "@/components/RetryButton";
import { ScoreRow } from "@/components/ScoreRow";
import { SectionHeading } from "@/components/SectionHeading";
import { SiteHeader } from "@/components/SiteHeader";
import { WeekStrip } from "@/components/WeekStrip";
import { formatDay, formatGameNight, formatShortDay, toNbaDay } from "@/lib/format";
import { getScoreboard } from "@/lib/nba";

export const metadata: Metadata = {
  title: "Partidos · CourtView",
};

export default function GamesPage({ searchParams }: PageProps<"/partidos">) {
  return (
    <>
      <SiteHeader current="partidos" />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-20 md:pb-10">
        <h1 className="sr-only">Partidos de la NBA</h1>
        <Suspense fallback={<GamesSkeleton />}>
          <GameDay searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

/** `YYYY-MM-DD` válido o `null`. */
function parseDay(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value) ? value : null;
}

function parseMonth(value: string | undefined) {
  return value && /^\d{4}-(0[1-9]|1[0-2])$/.test(value) ? value : null;
}

async function GameDay({ searchParams }: Pick<PageProps<"/partidos">, "searchParams">) {
  const params = await searchParams;
  await connection();
  const today = toNbaDay(new Date());
  const day = parseDay(first(params.fecha)) ?? today;
  const month = parseMonth(first(params.mes)) ?? day.slice(0, 7);

  let scoreboard;
  try {
    scoreboard = await getScoreboard(day.replaceAll("-", ""));
  } catch {
    return (
      <p className="py-3 text-sm text-muted">
        No se han podido cargar los partidos de ESPN. <RetryButton />
      </p>
    );
  }

  const { games, gameDays } = scoreboard;
  const next = gameDays.find((d) => d > day) ?? null;
  const anyLive = games.some((game) => game.status.state === "live");

  return (
    <div className="flex flex-col gap-6">
      {anyLive && <AutoRefresh />}

      <div className="mx-auto flex w-full max-w-xl flex-col gap-3">
        <WeekStrip selected={day} today={today} gameDays={gameDays} />
        <details open={first(params.calendario) === "1"} className="group">
          <summary className="mx-auto flex w-fit cursor-pointer list-none items-center gap-1.5 rounded-sm px-2 py-1 text-sm font-medium text-accent hover:bg-surface [&::-webkit-details-marker]:hidden">
            <CalendarDays size={16} strokeWidth={1.75} aria-hidden />
            <span className="group-open:hidden">Ver calendario del mes</span>
            <span className="hidden group-open:inline">Ocultar calendario</span>
          </summary>
          <div className="mt-3 flex justify-center border-y border-line py-4">
            <GameCalendar selected={day} month={month} today={today} gameDays={gameDays} />
          </div>
        </details>
      </div>

      <section aria-labelledby="jornada" className="flex flex-col gap-3">
        <h2 id="jornada" className="font-display text-3xl font-extrabold leading-none tracking-tight first-letter:uppercase sm:text-4xl">
          {formatGameNight(day)}
        </h2>

        <SectionHeading
          title={day === today ? "Hoy" : formatShortDay(day)}
          meta={`${games.length} ${games.length === 1 ? "partido" : "partidos"}`}
        />

        {games.length === 0 ? (
          <p className="py-3 text-sm text-muted">
            No hay partidos esta noche.
            {next && (
              <>
                {" "}
                Próxima jornada:{" "}
                <Link href={`/partidos?fecha=${next}`} className="text-accent hover:underline">
                  {formatDay(`${next}T12:00:00Z`, "UTC")}
                </Link>
                .
              </>
            )}
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => (
              <ScoreRow key={game.id} game={game} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function GamesSkeleton() {
  return (
    <div aria-busy aria-label="Cargando partidos" className="flex flex-col gap-6">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-3">
        <span className="mx-auto h-8 w-40 rounded-sm bg-surface" />
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {Array.from({ length: 7 }, (_, i) => (
            <span key={i} className="h-[4.5rem] rounded-card border border-line bg-card" />
          ))}
        </div>
        <span className="mx-auto h-7 w-44 rounded-sm bg-surface" />
      </div>
      <div className="flex flex-col gap-3">
        <span className="h-8 w-2/3 rounded-sm bg-surface" />
        <SectionHeading title="Cargando" />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i} className="panel flex flex-col gap-1 px-4 pt-3 pb-2">
              <span className="h-3 w-16 rounded-sm bg-surface" />
              {[0, 1].map((line) => (
                <div key={line} className="flex h-10 items-center gap-3">
                  <span className="size-7 rounded-full bg-surface" />
                  <span className="h-3.5 w-32 rounded-sm bg-surface" />
                  <span className="ml-auto h-6 w-10 rounded-sm bg-surface" />
                </div>
              ))}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
