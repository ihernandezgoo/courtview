import Image from "next/image";
import { formatDateTime, formatGameStatus, formatRecord, formatScore } from "@/lib/format";
import type { GameDetail } from "@/types/boxscore";
import type { GameTeam } from "@/types/game";

function TeamSide({
  team,
  side,
  game,
}: {
  team: GameTeam;
  side: "away" | "home";
  game: GameDetail;
}) {
  const decided = game.status.state === "final";
  const lost = decided && !team.winner;
  const home = side === "home";

  return (
    <div
      className={`flex items-center gap-3 ${home ? "flex-row-reverse text-right" : ""} ${
        lost ? "text-muted" : ""
      }`}
    >
      <span
        aria-hidden
        className="h-12 w-1 shrink-0 rounded-[1px] bg-line"
        style={team.color ? { backgroundColor: `#${team.color}` } : undefined}
      />
      {team.logo && (
        <span className="relative hidden size-12 shrink-0 sm:block">
          <Image src={team.logo} alt="" width={48} height={48} className={team.logoDark ? "dark:hidden" : undefined} />
          {team.logoDark && (
            <Image
              src={team.logoDark}
              alt=""
              width={48}
              height={48}
              className="absolute inset-0 hidden dark:block"
            />
          )}
        </span>
      )}
      <div className="min-w-0">
        <p className="text-base font-semibold sm:hidden">{team.abbreviation}</p>
        <p className="hidden truncate text-lg font-semibold leading-tight sm:block">
          {team.displayName}
        </p>
        <p className="text-xs tabular-nums text-muted">
          {formatRecord(team.record)}
          {home ? " · Local" : " · Visitante"}
        </p>
      </div>
      <p
        className={`font-score text-5xl tabular-nums leading-none sm:text-6xl ${
          home ? "mr-auto" : "ml-auto"
        } ${lost ? "font-medium" : "font-bold"}`}
      >
        {formatScore(team.score)}
        {decided && team.winner && <span className="sr-only"> (ganador)</span>}
      </p>
    </div>
  );
}

export function GameHeader({ game }: { game: GameDetail }) {
  const live = game.status.state === "live";

  return (
    <header className="border-b border-line pb-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 sm:gap-6">
        <TeamSide team={game.away} side="away" game={game} />
        <p
          className={`flex flex-col items-center gap-1 text-center text-xs font-semibold uppercase tracking-wide tabular-nums ${
            live ? "text-live" : "text-muted"
          }`}
        >
          {live && (
            <span aria-hidden className="size-1.5 rounded-full bg-live motion-safe:animate-pulse" />
          )}
          {live && <span className="sr-only">En directo:</span>}
          {formatGameStatus(game.status, game.startsAt)}
        </p>
        <TeamSide team={game.home} side="home" game={game} />
      </div>
      <p className="mt-3 text-xs text-muted first-letter:uppercase">
        {formatDateTime(game.startsAt)}
        {game.venue && ` · ${game.venue.name}`}
        {game.venue?.city && `, ${game.venue.city}`}
      </p>
    </header>
  );
}
