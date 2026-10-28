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

type Props = {
  game: Game;
  /** Por defecto, la ficha del partido. `null`: sin enlace. */
  href?: string | null;
};

export function ScoreRow({ game, href = `/partidos/${game.id}`}: Props) {
  const live = game.status.state === "live";
  const label = `${game.away.displayName} en ${game.home.displayName}`;
  const className = "-mx-2 flex items-center gap-4 px-2 py-1.5";

  const content = (
    <>
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
    </>
  );

  return (
    <li className="border-b border-line">
      {href ? (
        <Link href={href} aria-label={label} className={`${className} hover:bg-surface`}>
          {content}
        </Link>
      ) : (
        <div aria-label={label} role="group" className={className}>
          {content}
        </div>
      )}
    </li>
  );
}
