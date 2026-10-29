import { TeamMark } from "@/components/TeamMark";
import { formatPct, formatStat, parseMadeAttempted } from "@/lib/format";
import type { GameDetail, StatLine } from "@/types/boxscore";

const FG = "fieldGoalsMade-fieldGoalsAttempted";
const THREE = "threePointFieldGoalsMade-threePointFieldGoalsAttempted";
const FT = "freeThrowsMade-freeThrowsAttempted";

type Row = {
  label: string;
  format: (stats: StatLine) => string;
  /** Valor para decidir quién es mejor; `lowerIsBetter` para pérdidas y faltas. */
  compare?: (stats: StatLine) => number | null;
  lowerIsBetter?: boolean;
  /** Empieza bloque nuevo (línea más marcada encima). */
  group?: boolean;
};

const num = (key: string) => (stats: StatLine) =>
  stats[key] === null || stats[key] === undefined ? null : Number(stats[key]);
const pct = (key: string) => (stats: StatLine) => {
  const parsed = parseMadeAttempted(stats[key]);
  return parsed && parsed[1] > 0 ? parsed[0] / parsed[1] : null;
};
const plain = (key: string) => (stats: StatLine) => formatStat(stats[key]);

const ROWS: Row[] = [
  { label: "Tiros de campo", format: plain(FG), group: true },
  { label: "% tiros de campo", format: (s) => formatPct(s[FG]), compare: pct(FG) },
  { label: "Triples", format: plain(THREE) },
  { label: "% triples", format: (s) => formatPct(s[THREE]), compare: pct(THREE) },
  { label: "Tiros libres", format: plain(FT) },
  { label: "% tiros libres", format: (s) => formatPct(s[FT]), compare: pct(FT) },
  { label: "Rebotes", format: plain("totalRebounds"), compare: num("totalRebounds"), group: true },
  { label: "Ofensivos", format: plain("offensiveRebounds"), compare: num("offensiveRebounds") },
  { label: "Defensivos", format: plain("defensiveRebounds"), compare: num("defensiveRebounds") },
  { label: "Asistencias", format: plain("assists"), compare: num("assists"), group: true },
  { label: "Robos", format: plain("steals"), compare: num("steals") },
  { label: "Tapones", format: plain("blocks"), compare: num("blocks") },
  { label: "Pérdidas", format: plain("totalTurnovers"), compare: num("totalTurnovers"), lowerIsBetter: true },
  { label: "Faltas", format: plain("fouls"), compare: num("fouls"), lowerIsBetter: true },
  { label: "Puntos en la zona", format: plain("pointsInPaint"), compare: num("pointsInPaint"), group: true },
  { label: "Puntos al contraataque", format: plain("fastBreakPoints"), compare: num("fastBreakPoints") },
  { label: "Máxima ventaja", format: plain("largestLead"), compare: num("largestLead") },
];

export function TeamStatsTable({ game }: { game: GameDetail }) {
  const away = game.teamStats.find((t) => t.teamId === game.away.id)?.stats;
  const home = game.teamStats.find((t) => t.teamId === game.home.id)?.stats;
  if (!away || !home) return null;

  return (
    <table className="w-full text-[13px]">
      <caption className="sr-only">Estadísticas de equipo</caption>
      <thead>
        <tr className="border-b border-line">
          <th scope="col" className="h-8 text-left">
            <span className="sr-only">Estadística</span>
          </th>
          <th scope="col" className="h-8 w-20 px-2 text-right font-normal">
            <span className="inline-flex justify-end"><TeamMark team={game.away} /></span>
          </th>
          <th scope="col" className="h-8 w-20 px-2 text-right font-normal">
            <span className="inline-flex justify-end"><TeamMark team={game.home} /></span>
          </th>
        </tr>
      </thead>
      <tbody>
        {ROWS.map((row) => {
          const a = row.compare?.(away) ?? null;
          const h = row.compare?.(home) ?? null;
          const better = (mine: number | null, theirs: number | null) =>
            mine !== null && theirs !== null && mine !== theirs &&
            (row.lowerIsBetter ? mine < theirs : mine > theirs);
          return (
            <tr
              key={row.label}
              className={row.group ? "border-t-2 border-line" : "border-t border-line"}
            >
              <th scope="row" className="h-8 pr-2 text-left font-normal text-muted">
                {row.label}
              </th>
              <td className={`px-2 text-right tabular-nums ${better(a, h) ? "font-semibold" : ""}`}>
                {row.format(away)}
              </td>
              <td className={`px-2 text-right tabular-nums ${better(h, a) ? "font-semibold" : ""}`}>
                {row.format(home)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
