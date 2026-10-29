import Link from "next/link";
import { TeamMark } from "@/components/TeamMark";
import { formatPct, formatSigned, formatStat, parseMadeAttempted } from "@/lib/format";
import type { BoxScorePlayer, StatLine, TeamBoxScore } from "@/types/boxscore";
import type { GameTeam } from "@/types/game";

const FG = "fieldGoalsMade-fieldGoalsAttempted";
const THREE = "threePointFieldGoalsMade-threePointFieldGoalsAttempted";
const FT = "freeThrowsMade-freeThrowsAttempted";

type Column = {
  label: string;
  title: string;
  format: (stats: StatLine) => string;
  /** Si se da, se resalta el máximo de la columna. */
  rank?: (stats: StatLine) => number | null;
  /** Línea a la izquierda para separar bloques (tiro, rebote). */
  divider?: boolean;
};

const num = (key: string) => (stats: StatLine) => {
  const value = stats[key];
  return value === null || value === undefined ? null : Number(value);
};
const made = (key: string) => (stats: StatLine) => parseMadeAttempted(stats[key])?.[0] ?? null;

const COLUMNS: Column[] = [
  { label: "MIN", title: "Minutos", format: (s) => formatStat(s.minutes) },
  { label: "PTS", title: "Puntos", format: (s) => formatStat(s.points), rank: num("points") },
  { label: "REB", title: "Rebotes", format: (s) => formatStat(s.rebounds), rank: num("rebounds") },
  { label: "AST", title: "Asistencias", format: (s) => formatStat(s.assists), rank: num("assists") },
  { label: "STL", title: "Robos", format: (s) => formatStat(s.steals), rank: num("steals") },
  { label: "BLK", title: "Tapones", format: (s) => formatStat(s.blocks), rank: num("blocks") },
  { label: "TO", title: "Pérdidas", format: (s) => formatStat(s.turnovers) },
  { label: "FG", title: "Tiros de campo (anotados-intentados)", format: (s) => formatStat(s[FG]), rank: made(FG), divider: true },
  { label: "FG%", title: "Porcentaje de tiros de campo", format: (s) => formatPct(s[FG]) },
  { label: "3P", title: "Triples (anotados-intentados)", format: (s) => formatStat(s[THREE]), rank: made(THREE) },
  { label: "3P%", title: "Porcentaje de triples", format: (s) => formatPct(s[THREE]) },
  { label: "FT", title: "Tiros libres (anotados-intentados)", format: (s) => formatStat(s[FT]), rank: made(FT) },
  { label: "FT%", title: "Porcentaje de tiros libres", format: (s) => formatPct(s[FT]) },
  { label: "OREB", title: "Rebotes ofensivos", format: (s) => formatStat(s.offensiveRebounds), rank: num("offensiveRebounds"), divider: true },
  { label: "DREB", title: "Rebotes defensivos", format: (s) => formatStat(s.defensiveRebounds), rank: num("defensiveRebounds") },
  { label: "PF", title: "Faltas personales", format: (s) => formatStat(s.fouls) },
  { label: "+/-", title: "Más/menos: diferencia de puntos con el jugador en pista", format: (s) => formatSigned(s.plusMinus), rank: num("plusMinus") },
];

const STICKY = "sticky left-0 z-10 bg-card";
const CELL = "h-9 px-2 text-right tabular-nums whitespace-nowrap";

/** Máximo de cada columna entre los que han jugado; `null` si no hay nada que destacar. */
function columnMaxima(players: BoxScorePlayer[]) {
  return COLUMNS.map((column) => {
    if (!column.rank) return null;
    const values = players
      .map((p) => column.rank!(p.stats))
      .filter((v): v is number => v !== null && !Number.isNaN(v));
    const max = Math.max(...values);
    return values.length && max > 0 ? max : null;
  });
}

function PlayerName({ player }: { player: BoxScorePlayer }) {
  return (
    <span className="flex items-baseline gap-1.5" title={player.name}>
      <Link href={`/jugadores/${player.id}`} className="font-medium hover:text-accent hover:underline">
        <span className="md:hidden">{player.shortName}</span>
        <span className="hidden md:inline">{player.name}</span>
      </Link>
      {player.position && <span className="text-[11px] text-subtle">{player.position}</span>}
      {player.ejected && (
        <abbr title="Expulsado" className="text-[11px] font-semibold text-loss no-underline">
          EXP
        </abbr>
      )}
    </span>
  );
}

function PlayerRow({
  player,
  maxima,
  divider,
}: {
  player: BoxScorePlayer;
  maxima: (number | null)[];
  divider: boolean;
}) {
  const rowBorder = divider ? "border-t border-t-foreground/40" : "border-t border-line";

  if (player.didNotPlay) {
    return (
      <tr className={`${rowBorder} text-muted`}>
        <th scope="row" className={`${STICKY} h-9 pr-3 pl-2 text-left font-normal whitespace-nowrap`}>
          <PlayerName player={player} />
        </th>
        <td colSpan={COLUMNS.length} className="px-2 text-left text-xs">
          No jugó{player.reason && ` · ${player.reason}`}
        </td>
      </tr>
    );
  }

  return (
    <tr className={`${rowBorder} group hover:bg-surface`}>
      <th
        scope="row"
        className={`${STICKY} h-9 pr-3 pl-2 text-left font-normal whitespace-nowrap group-hover:bg-surface`}
      >
        <PlayerName player={player} />
      </th>
      {COLUMNS.map((column, i) => {
        const value = column.rank?.(player.stats);
        const leader = maxima[i] !== null && value === maxima[i];
        return (
          <td
            key={column.label}
            className={`${CELL} ${column.divider ? "border-l border-line" : ""} ${
              leader ? "bg-leader font-semibold" : ""
            }`}
          >
            {column.format(player.stats)}
          </td>
        );
      })}
    </tr>
  );
}

export function BoxScoreTable({ team, box }: { team: GameTeam; box: TeamBoxScore }) {
  const starters = box.players.filter((p) => p.starter);
  const bench = box.players.filter((p) => !p.starter && !p.didNotPlay);
  const dnp = box.players.filter((p) => !p.starter && p.didNotPlay);
  const maxima = columnMaxima(box.players.filter((p) => !p.didNotPlay));

  return (
    <div
      className="panel overflow-x-auto"
      style={{ borderTopWidth: 4, ...(team.color ? { borderTopColor: `#${team.color}` } : {}) }}
    >
      <table className="w-full text-[13px]">
        <caption className="sr-only">Estadísticas de los jugadores de {team.displayName}</caption>
        <thead>
          <tr className="border-b border-line">
            <th scope="col" className={`${STICKY} h-10 pr-3 pl-2 text-left font-bold`}>
              <TeamMark team={team} />
            </th>
            {COLUMNS.map((column) => (
              <th
                key={column.label}
                scope="col"
                className={`h-8 px-2 text-right text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap text-muted ${
                  column.divider ? "border-l border-line" : ""
                }`}
              >
                <abbr title={column.title} className="no-underline">
                  {column.label}
                </abbr>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {starters.map((player) => (
            <PlayerRow key={player.id} player={player} maxima={maxima} divider={false} />
          ))}
          {bench.map((player, i) => (
            <PlayerRow key={player.id} player={player} maxima={maxima} divider={i === 0} />
          ))}
          {dnp.map((player, i) => (
            <PlayerRow
              key={player.id}
              player={player}
              maxima={maxima}
              divider={i === 0 && bench.length === 0}
            />
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-line font-bold">
            <th scope="row" className={`${STICKY} h-9 pr-3 pl-2 text-left`}>
              Totales
            </th>
            {COLUMNS.map((column) => (
              <td
                key={column.label}
                className={`${CELL} ${column.divider ? "border-l border-line" : ""}`}
              >
                {column.format(box.totals)}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
