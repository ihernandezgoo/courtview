import Link from "next/link";
import { TeamLogo } from "@/components/TeamMark";
import {
  formatGameStatus,
  formatRecord,
  formatScore,
} from "@/lib/format";
import type { Game, GameTeam } from "@/types/game";

function TeamLine({ team, game }: { team: GameTeam; game: Game }) {
  const decided = game.status.state === "final";
  const lost = decided && !team.winner;
  const won = decided && team.winner;

  return (
    <div className={`flex h-10 items-center gap-3 ${lost ? "text-muted" : ""}`}>
      <TeamLogo team={team} size={28} />
      <div className="flex min-w-0 flex-col leading-tight">
        <span className={`truncate text-[15px] ${won ? "font-bold" : "font-semibold"}`} title={team.displayName}>
          {team.displayName}
        </span>
        <span className="text-[11px] tabular-nums text-subtle">
          {team.abbreviation} · {formatRecord(team.record)}
        </span>
      </div>
      <span
        className={`font-display ml-auto text-[28px] tabular-nums leading-none ${
          lost ? "font-semibold" : "font-extrabold"
        }`}
      >
        {formatScore(team.score)}
        {won && <span className="sr-only"> (ganador)</span>}
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
  const className = `panel flex flex-col gap-1 px-4 pt-3 pb-2 ${live ? "ring-1 ring-live/60" : ""}`;

  const content = (
    <>
      <div
        className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider tabular-nums ${
          live ? "text-live" : "text-muted"
        }`}
      >
        {live && (
          <span
            aria-hidden
            className="size-1.5 rounded-full bg-live motion-safe:animate-pulse"
          />
        )}
        {live && <span>En directo ·</span>}
        {formatGameStatus(game.status, game.startsAt)}
      </div>
      <TeamLine team={game.away} game={game} />
      <TeamLine team={game.home} game={game} />
    </>
  );

  return (
    <li>
      {href ? (
        <Link href={href} aria-label={label} className={`${className} hover:border-subtle`}>
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
