import Link from "next/link";
import { TeamMark } from "@/components/TeamMark";
import {
  formatGameStatus,
  formatRecord,
  formatScore,
} from "@/lib/format";
import type { Game, GameTeam } from "@/types/game";

function TeamLine({ team, game }: { team: GameTeam; game: Game }) {
  const decided = game.status.state === "final";
  const lost = decided && !team.winner;

  return (
    <div
      className={`flex h-8 items-center gap-3 ${lost ? "text-muted" : ""} ${
        decided && team.winner ? "font-semibold" : ""
      }`}
    >
      <TeamMark team={team} />
      <span className="text-xs tabular-nums text-subtle font-normal">
        {formatRecord(team.record)}
      </span>
      <span className="ml-auto font-score text-xl tabular-nums leading-none">
        {formatScore(team.score)}
      </span>
    </div>
  );
}

export function ScoreRow({ game }: { game: Game }) {
  const live = game.status.state === "live";

  return (
    <li className="border-b border-line">
      <Link
        href={`/partidos/${game.id}`}
        aria-label={`${game.away.displayName} en ${game.home.displayName}`}
        className="-mx-2 flex items-center gap-4 px-2 py-1.5 hover:bg-surface"
      >
        <div className="flex-1 text-sm">
          <TeamLine team={game.away} game={game} />
          <TeamLine team={game.home} game={game} />
        </div>
        <div
          className={`flex w-20 items-center justify-end gap-1.5 text-right text-xs tabular-nums ${
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
        </div>
      </Link>
    </li>
  );
}
