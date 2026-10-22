import { TeamMark } from "@/components/TeamMark";
import { formatInteger } from "@/lib/format";
import type { GameDetail } from "@/types/boxscore";

/** Pabellón, asistencia, árbitros, televisión y serie. Solo lo que ESPN da. */
export function GameFacts({ game }: { game: GameDetail }) {
  const facts = [
    game.venue && {
      label: "Pabellón",
      value: game.venue.city ? `${game.venue.name}, ${game.venue.city}` : game.venue.name,
    },
    game.attendance && { label: "Asistencia", value: formatInteger(game.attendance) },
    game.officials.length > 0 && { label: "Árbitros", value: game.officials.join(", ") },
    game.broadcasts.length > 0 && { label: "Televisión", value: game.broadcasts.join(", ") },
    game.seasonSeries && { label: "Serie de temporada", value: game.seasonSeries },
  ].filter((fact): fact is { label: string; value: string } => Boolean(fact));

  if (facts.length === 0) return null;

  return (
    <dl className="text-[13px]">
      {facts.map((fact) => (
        <div
          key={fact.label}
          className="grid grid-cols-[8.5rem_minmax(0,1fr)] gap-2 border-t border-line py-2 first:border-t-0"
        >
          <dt className="text-muted">{fact.label}</dt>
          <dd className="tabular-nums">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function GameInjuries({ game }: { game: GameDetail }) {
  const teams = [game.away, game.home]
    .map((team) => ({
      team,
      injuries: game.injuries.find((entry) => entry.teamId === team.id)?.injuries ?? [],
    }))
    .filter((entry) => entry.injuries.length > 0);

  if (teams.length === 0) {
    return <p className="py-2 text-sm text-muted">Ningún equipo tiene bajas comunicadas.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {teams.map(({ team, injuries }) => (
        <div key={team.id}>
          <h3 className="mb-1 text-[13px] font-semibold">
            <TeamMark team={team} />
          </h3>
          <ul className="text-[13px]">
            {injuries.map((injury) => (
              <li
                key={injury.athlete}
                className="flex items-baseline gap-2 border-t border-line py-1.5"
              >
                <span className="font-medium">{injury.athlete}</span>
                {injury.position && (
                  <span className="text-[11px] text-subtle">{injury.position}</span>
                )}
                <span className="ml-auto text-right text-muted">
                  {injury.status}
                  {injury.detail && ` · ${injury.detail}`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
