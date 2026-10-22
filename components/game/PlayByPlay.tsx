import { formatPeriodName } from "@/lib/format";
import type { GameDetail, Play } from "@/types/boxscore";

export function PlayByPlay({ game }: { game: GameDetail }) {
  const periods = [...new Set(game.plays.map((play) => play.period))];
  const lastPeriod = periods.at(-1);
  const teamOf = (teamId: string | null) =>
    teamId === game.away.id ? game.away : teamId === game.home.id ? game.home : null;

  return (
    <div className="flex flex-col">
      {periods.map((period) => {
        const plays = game.plays.filter((play) => play.period === period);
        const end = plays.at(-1);
        return (
          <details
            key={period}
            open={period === lastPeriod}
            className="border-b border-line [&[open]>summary]:border-b [&[open]>summary]:border-line"
          >
            <summary className="flex cursor-pointer items-baseline justify-between gap-4 py-2 text-sm font-semibold">
              {formatPeriodName(period)}
              {end && (
                <span className="text-xs font-normal tabular-nums text-muted">
                  {game.away.abbreviation} {end.awayScore} – {end.homeScore} {game.home.abbreviation}
                </span>
              )}
            </summary>
            <ol className="text-[13px]">
              {plays.map((play, i) => (
                <PlayRow
                  key={play.id}
                  play={play}
                  team={teamOf(play.teamId)}
                  previous={plays[i - 1]}
                />
              ))}
            </ol>
          </details>
        );
      })}
    </div>
  );
}

function PlayRow({
  play,
  team,
  previous,
}: {
  play: Play;
  team: GameDetail["away"] | null;
  previous: Play | undefined;
}) {
  // Solo enseñamos el marcador cuando cambia, para no repetir cifras en cada fila.
  const scoreChanged =
    !previous ||
    previous.awayScore !== play.awayScore ||
    previous.homeScore !== play.homeScore;

  return (
    <li
      className={`grid grid-cols-[3rem_2.75rem_minmax(0,1fr)_4.5rem] items-baseline gap-2 border-t border-line py-1.5 first:border-t-0 ${
        play.scoring ? "font-medium" : "text-muted"
      }`}
    >
      <span className="tabular-nums">{play.clock}</span>
      <span className="flex items-center gap-1.5 text-xs font-semibold">
        {team && (
          <>
            <span
              aria-hidden
              className="h-3 w-0.5 rounded-[1px] bg-line"
              style={team.color ? { backgroundColor: `#${team.color}` } : undefined}
            />
            <span title={team.displayName}>{team.abbreviation}</span>
          </>
        )}
      </span>
      <span className={play.scoring ? "text-foreground" : ""}>{play.text}</span>
      <span
        className={`text-right tabular-nums ${play.scoring ? "font-semibold text-foreground" : ""}`}
      >
        {scoreChanged ? `${play.awayScore}-${play.homeScore}` : ""}
      </span>
    </li>
  );
}
