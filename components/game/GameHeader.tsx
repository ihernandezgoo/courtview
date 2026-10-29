import { TeamLogo } from "@/components/TeamMark";
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
      className={`flex items-center gap-3 sm:gap-5 ${home ? "flex-row-reverse text-right" : ""} ${
        lost ? "text-chrome-muted" : ""
      }`}
    >
      <div className={`flex min-w-0 flex-col items-center gap-2 sm:flex-row sm:gap-4 ${home ? "sm:flex-row-reverse" : ""}`}>
        <span className="sm:hidden">
          <TeamLogo team={team} size={40} onChrome />
        </span>
        <span className="hidden sm:block">
          <TeamLogo team={team} size={64} onChrome />
        </span>
        <div className={`min-w-0 text-center ${home ? "sm:text-right" : "sm:text-left"}`}>
          <p className="font-display text-base font-extrabold uppercase sm:hidden">{team.abbreviation}</p>
          <p className="font-display hidden truncate text-xl font-extrabold uppercase leading-tight tracking-tight sm:block">
            {team.displayName}
          </p>
          <p className="text-[11px] tabular-nums text-chrome-muted">
            {formatRecord(team.record)}
            {home ? " · Local" : " · Visitante"}
          </p>
        </div>
      </div>
      <p
        className={`font-display text-5xl tabular-nums leading-none sm:text-7xl ${
          home ? "mr-auto" : "ml-auto"
        } ${lost ? "font-semibold" : "font-extrabold"}`}
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
    <header className="overflow-hidden rounded-card bg-chrome text-chrome-foreground">
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 px-4 py-5 sm:gap-8 sm:px-8 sm:py-8">
        <TeamSide team={game.away} side="away" game={game} />
        <p
          className={`flex flex-col items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-center text-[11px] font-bold uppercase tracking-wider tabular-nums ${
            live ? "bg-live text-white" : "bg-chrome-raised text-chrome-muted"
          }`}
        >
          {live && <span>En directo</span>}
          {formatGameStatus(game.status, game.startsAt)}
        </p>
        <TeamSide team={game.home} side="home" game={game} />
      </div>
      <p className="border-t border-chrome-line px-4 py-2.5 text-center text-xs text-chrome-muted first-letter:uppercase sm:px-8">
        {formatDateTime(game.startsAt)}
        {game.venue && ` · ${game.venue.name}`}
        {game.venue?.city && `, ${game.venue.city}`}
      </p>
    </header>
  );
}
