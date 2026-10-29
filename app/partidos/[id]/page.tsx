import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { AutoRefresh } from "@/components/AutoRefresh";
import { BoxScoreTable } from "@/components/game/BoxScoreTable";
import { GameFacts, GameInjuries } from "@/components/game/GameFacts";
import { GameHeader } from "@/components/game/GameHeader";
import { GameLeaders } from "@/components/game/GameLeaders";
import { LineScore } from "@/components/game/LineScore";
import { PlayByPlay } from "@/components/game/PlayByPlay";
import { TeamStatsTable } from "@/components/game/TeamStatsTable";
import { RetryButton } from "@/components/RetryButton";
import { SectionHeading } from "@/components/SectionHeading";
import { SiteHeader } from "@/components/SiteHeader";
import { formatDateTime, formatGameNight, formatScore, nbaDayOf } from "@/lib/format";
import { getGameDetail } from "@/lib/nba";

const isGameId = (id: string) => /^\d+$/.test(id);

export async function generateMetadata({
  params,
}: PageProps<"/partidos/[id]">): Promise<Metadata> {
  const { id } = await params;
  const game = isGameId(id) ? await getGameDetail(id).catch(() => null) : null;
  if (!game) return { title: "Partido · CourtView" };
  const { away, home } = game;
  const score =
    away.score !== null && home.score !== null
      ? `${away.abbreviation} ${formatScore(away.score)}-${formatScore(home.score)} ${home.abbreviation}`
      : `${away.abbreviation} en ${home.abbreviation}`;
  return { title: `${score} · CourtView` };
}

export default function GamePage({ params }: PageProps<"/partidos/[id]">) {
  return (
    <>
      <SiteHeader current="partidos" />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-4 pb-20 md:pb-10">
        <Suspense fallback={<GameSkeleton />}>
          <Game params={params} />
        </Suspense>
      </main>
    </>
  );
}

function Section({
  id,
  title,
  boxed = true,
  children,
}: {
  id: string;
  title: string;
  /** Envuelve el contenido en una tarjeta; no hace falta si ya trae la suya. */
  boxed?: boolean;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="flex min-w-0 flex-col">
      <SectionHeading id={id} title={title} />
      {boxed ? <div className="panel px-4 py-2">{children}</div> : children}
    </section>
  );
}

async function Game({ params }: Pick<PageProps<"/partidos/[id]">, "params">) {
  const { id } = await params;
  if (!isGameId(id)) notFound();

  let game;
  try {
    game = await getGameDetail(id);
  } catch {
    return (
      <p className="py-3 text-sm text-muted">
        No se ha podido cargar el partido de ESPN. <RetryButton />
      </p>
    );
  }
  if (!game) notFound();

  const day = nbaDayOf(game.startsAt);
  const started = game.status.state === "live" || game.status.state === "final";
  const boxes = [game.away, game.home].flatMap((team) => {
    const box = game.boxScore.find((b) => b.teamId === team.id);
    return box ? [{ team, box }] : [];
  });

  const anchors = [
    started && { href: "#parciales", label: "Parciales" },
    boxes.length > 0 && { href: "#box-score", label: "Box score" },
    game.teamStats.length > 0 && started && { href: "#equipos", label: "Equipos" },
    game.plays.length > 0 && { href: "#jugadas", label: "Jugada a jugada" },
  ].filter((a): a is { href: string; label: string } => Boolean(a));

  return (
    <div className="flex flex-col gap-8">
      {game.status.state === "live" && <AutoRefresh />}

      <div className="flex flex-col gap-4">
        <Link
          href={`/partidos?fecha=${day}`}
          className="-ml-1 inline-flex items-center gap-1 self-start text-sm text-muted hover:text-foreground"
        >
          <ChevronLeft size={16} strokeWidth={1.75} aria-hidden />
          <span className="first-letter:uppercase">{formatGameNight(day)}</span>
        </Link>
        <GameHeader game={game} />
        {anchors.length > 1 && (
          <nav aria-label="Secciones del partido" className="flex gap-2 overflow-x-auto">
            {anchors.map((anchor) => (
              <a
                key={anchor.href}
                href={anchor.href}
                className="panel whitespace-nowrap px-3 py-1.5 text-xs font-bold uppercase tracking-wider hover:border-accent hover:text-accent"
              >
                {anchor.label}
              </a>
            ))}
          </nav>
        )}
      </div>

      {!started && (
        <p className="text-sm text-muted">
          {game.status.state === "postponed"
            ? "El partido está aplazado. ESPN aún no ha dado nueva fecha."
            : `Empieza el ${formatDateTime(game.startsAt)}. El box score y la jugada a jugada aparecerán cuando empiece.`}
        </p>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        {started && (
          <Section id="parciales" title="Parciales" boxed={false}>
            <LineScore game={game} />
          </Section>
        )}
        <Section id="lideres" title={started ? "Líderes del partido" : "Líderes de la temporada"}>
          <GameLeaders game={game} />
        </Section>
        {!started && (
          <Section id="informacion" title="Información">
            <GameFacts game={game} />
          </Section>
        )}
      </div>

      {boxes.length > 0 && (
        <Section id="box-score" title="Box score" boxed={false}>
          <div className="flex flex-col gap-4">
            {boxes.map(({ team, box }) => (
              <BoxScoreTable key={team.id} team={team} box={box} />
            ))}
          </div>
        </Section>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        {started && game.teamStats.length > 0 && (
          <Section id="equipos" title="Estadísticas de equipo">
            <TeamStatsTable game={game} />
          </Section>
        )}
        <div className="flex flex-col gap-8">
          {started && (
            <Section id="informacion" title="Información">
              <GameFacts game={game} />
            </Section>
          )}
          <Section id="bajas" title="Bajas">
            <GameInjuries game={game} />
          </Section>
        </div>
      </div>

      {game.plays.length > 0 && (
        <Section id="jugadas" title="Jugada a jugada">
          <PlayByPlay game={game} />
        </Section>
      )}
    </div>
  );
}

function GameSkeleton() {
  return (
    <div aria-busy aria-label="Cargando partido" className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <span className="h-4 w-56 rounded-sm bg-surface" />
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6 rounded-card bg-chrome px-4 py-8 sm:px-8">
          {[0, 1].map((side) => (
            <div key={side} className={`flex items-center gap-3 ${side ? "order-3 flex-row-reverse" : ""}`}>
              <span className="size-10 rounded-full bg-chrome-raised sm:size-16" />
              <span className="hidden h-5 w-32 rounded-sm bg-chrome-raised sm:block" />
              <span className={`h-12 w-16 rounded-sm bg-chrome-raised ${side ? "mr-auto" : "ml-auto"}`} />
            </div>
          ))}
          <span className="order-2 h-6 w-12 rounded-sm bg-chrome-raised" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <SectionHeading title="Box score" />
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="flex h-9 items-center gap-4 border-b border-line">
            <span className="h-3 w-32 rounded-sm bg-surface" />
            {Array.from({ length: 8 }, (_, j) => (
              <span key={j} className="ml-auto h-3 w-6 rounded-sm bg-surface" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
