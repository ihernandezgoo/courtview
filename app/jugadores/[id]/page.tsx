import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { PlayerGameLog } from "@/components/player/PlayerGameLog";
import { PlayerHeader } from "@/components/player/PlayerHeader";
import { PlayerSeasonsTable } from "@/components/player/PlayerSeasonsTable";
import { SeasonAverages } from "@/components/player/SeasonAverages";
import { RetryButton } from "@/components/RetryButton";
import { SectionHeading } from "@/components/SectionHeading";
import { SiteHeader } from "@/components/SiteHeader";
import { formatGameCount, formatStat } from "@/lib/format";
import { getPlayer } from "@/lib/player";

const isPlayerId = (id: string) => /^\d+$/.test(id);

export async function generateMetadata({ params }: PageProps<"/jugadores/[id]">): Promise<Metadata> {
  const { id } = await params;
  const player = isPlayerId(id) ? await getPlayer(id).catch(() => null) : null;
  if (!player) return { title: "Jugador · CourtView" };
  const team = player.bio.team ? ` (${player.bio.team.abbreviation})` : "";
  return { title: `${player.bio.name}${team} · CourtView` };
}

export default function PlayerPage({ params }: PageProps<"/jugadores/[id]">) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-20 md:pb-10">
        <Suspense fallback={<PlayerSkeleton />}>
          <Player params={params} />
        </Suspense>
      </main>
    </>
  );
}

function Section({
  id,
  title,
  meta,
  children,
}: {
  id: string;
  title: string;
  meta?: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="flex min-w-0 flex-col gap-3">
      <SectionHeading id={id} title={title} meta={meta} />
      {children}
    </section>
  );
}

async function Player({ params }: Pick<PageProps<"/jugadores/[id]">, "params">) {
  const { id } = await params;
  if (!isPlayerId(id)) notFound();

  let player;
  try {
    player = await getPlayer(id);
  } catch {
    return (
      <p className="py-3 text-sm text-muted">
        No se ha podido cargar el jugador de ESPN. <RetryButton />
      </p>
    );
  }
  if (!player) notFound();

  const { bio, season, averages, ranks, gameLog, seasons, career } = player;
  const gamesPlayed = averages?.gamesPlayed ? Number(averages.gamesPlayed) : null;

  return (
    <div className="flex flex-col gap-8">
      <PlayerHeader bio={bio} />

      <Section
        id="promedios"
        title={season ? `Promedios ${season}` : "Promedios"}
        meta={gamesPlayed !== null ? formatGameCount(gamesPlayed) : undefined}
      >
        {averages ? (
          <SeasonAverages averages={averages} ranks={ranks} />
        ) : (
          <p className="text-sm text-muted">
            No ha jugado partidos de temporada regular{season ? ` en ${season}` : ""}.
          </p>
        )}
      </Section>

      {gameLog.map((group) => {
        const sectionId = `partidos-${group.label.toLowerCase().replaceAll(" ", "-")}`;
        return (
          <Section
            key={group.label}
            id={sectionId}
            title={`Partidos · ${group.label}`}
            meta={formatGameCount(group.games.length)}
          >
            <PlayerGameLog
              games={group.games}
              caption={`Partidos de ${bio.name} en ${group.label.toLowerCase()} ${season ?? ""}`}
            />
          </Section>
        );
      })}
      {gameLog.length === 0 && (
        <Section id="partidos" title="Partidos">
          <p className="text-sm text-muted">Sin partidos esta temporada.</p>
        </Section>
      )}

      <Section
        id="temporadas"
        title="Por temporada"
        meta={career ? `Carrera: ${formatStat(career.gamesPlayed)} partidos` : undefined}
      >
        {seasons.length > 0 ? (
          <PlayerSeasonsTable seasons={seasons} career={career} />
        ) : (
          <p className="text-sm text-muted">Todavía no ha jugado en la NBA.</p>
        )}
      </Section>
    </div>
  );
}

function PlayerSkeleton() {
  return (
    <div aria-busy aria-label="Cargando jugador" className="flex flex-col gap-8">
      <div className="flex items-end gap-4 border-b border-line pb-3">
        <div className="hidden h-[76px] w-[104px] rounded-sm bg-surface sm:block" />
        <div className="flex flex-col gap-2">
          <span className="h-8 w-56 rounded-sm bg-surface" />
          <span className="h-4 w-40 rounded-sm bg-surface" />
          <span className="h-3 w-72 rounded-sm bg-surface" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <span className="h-3 w-8 rounded-sm bg-surface" />
            <span className="h-9 w-14 rounded-sm bg-surface" />
          </div>
        ))}
      </div>
      <div className="flex flex-col">
        <SectionHeading title="Partidos" />
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex h-9 items-center gap-3 border-b border-line px-2">
            <span className="h-3 w-20 rounded-sm bg-surface" />
            <span className="h-3 w-14 rounded-sm bg-surface" />
            <span className="ml-auto h-3 w-48 rounded-sm bg-surface sm:w-96" />
          </div>
        ))}
      </div>
    </div>
  );
}
