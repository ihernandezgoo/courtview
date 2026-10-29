import { TeamMark } from "@/components/TeamMark";
import { formatPeriodName, formatPeriodShort, formatScore } from "@/lib/format";
import type { GameDetail } from "@/types/boxscore";

const TH = "h-8 px-2 text-right text-[11px] font-semibold uppercase tracking-wide text-muted";
const TD = "h-9 px-2 text-right tabular-nums";

export function LineScore({ game }: { game: GameDetail }) {
  const periods = Math.max(game.linescores.away.length, game.linescores.home.length);
  const decided = game.status.state === "final";
  const rows = [
    { team: game.away, scores: game.linescores.away, rival: game.linescores.home },
    { team: game.home, scores: game.linescores.home, rival: game.linescores.away },
  ];

  return (
    <div className="panel overflow-x-auto">
      <table className="w-full text-[13px]">
        <caption className="sr-only">Puntos por cuarto</caption>
        <thead>
          <tr className="border-b border-line">
            <th scope="col" className={`${TH} text-left`}>
              Equipo
            </th>
            {Array.from({ length: periods }, (_, i) => (
              <th key={i} scope="col" title={formatPeriodName(i + 1)} className={TH}>
                {formatPeriodShort(i + 1)}
              </th>
            ))}
            <th scope="col" title="Total" className={`${TH} text-foreground`}>
              T
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ team, scores, rival }) => {
            const lost = decided && !team.winner;
            return (
              <tr key={team.id} className={`border-b border-line ${lost ? "text-muted" : ""}`}>
                <th scope="row" className="h-9 px-2 text-left font-medium">
                  <TeamMark team={team} />
                </th>
                {Array.from({ length: periods }, (_, i) => {
                  const won = scores[i] !== undefined && scores[i] > (rival[i] ?? Infinity);
                  return (
                    <td key={i} className={`${TD} ${won ? "font-semibold" : ""}`}>
                      {formatScore(scores[i] ?? null)}
                    </td>
                  );
                })}
                <td
                  className={`${TD} font-display text-lg leading-none ${
                    lost ? "font-medium" : "font-bold"
                  }`}
                >
                  {formatScore(team.score)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
