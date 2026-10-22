import { TeamMark } from "@/components/TeamMark";
import { EMPTY_VALUE } from "@/lib/format";
import type { GameDetail, GameLeader } from "@/types/boxscore";

const CATEGORY_LABELS: Record<string, string> = {
  points: "Puntos",
  rebounds: "Rebotes",
  assists: "Asistencias",
  pointsPerGame: "Puntos por partido",
  reboundsPerGame: "Rebotes por partido",
  assistsPerGame: "Asistencias por partido",
};

function LeaderCell({ leader }: { leader: GameLeader | undefined }) {
  if (!leader) return <td className="py-2 pr-3 align-top text-muted">{EMPTY_VALUE}</td>;
  return (
    <td className="py-2 pr-3 align-top">
      <div className="flex items-baseline gap-2">
        <span className="font-score text-2xl font-bold tabular-nums leading-none">
          {leader.value}
        </span>
        <span className="min-w-0 truncate text-[13px] font-medium">{leader.athlete}</span>
      </div>
      {leader.detail && (
        <p className="mt-0.5 text-xs tabular-nums text-muted">{leader.detail}</p>
      )}
    </td>
  );
}

export function GameLeaders({ game }: { game: GameDetail }) {
  const byTeam = (teamId: string) =>
    game.leaders.find((entry) => entry.teamId === teamId)?.leaders ?? [];
  const away = byTeam(game.away.id);
  const home = byTeam(game.home.id);
  const categories = [...new Set([...away, ...home].map((leader) => leader.category))];

  if (categories.length === 0) {
    return <p className="py-3 text-sm text-muted">ESPN no tiene líderes para este partido.</p>;
  }

  return (
    <table className="w-full table-fixed">
      <caption className="sr-only">Líderes de cada equipo</caption>
      <thead>
        <tr className="border-b border-line">
          <th scope="col" className="h-8 text-left">
            <TeamMark team={game.away} />
          </th>
          <th scope="col" className="h-8 text-left">
            <TeamMark team={game.home} />
          </th>
        </tr>
      </thead>
      <tbody>
        {categories.flatMap((category) => [
          <tr key={`${category}-label`}>
            <th
              colSpan={2}
              scope="colgroup"
              className="pt-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted"
            >
              {CATEGORY_LABELS[category] ?? category}
            </th>
          </tr>,
          <tr key={category} className="border-b border-line">
            <LeaderCell leader={away.find((l) => l.category === category)} />
            <LeaderCell leader={home.find((l) => l.category === category)} />
          </tr>,
        ])}
      </tbody>
    </table>
  );
}
