import Image from "next/image";
import type { GameTeam } from "@/types/game";

type Props = {
  team: Pick<
    GameTeam,
    "abbreviation" | "displayName" | "color" | "logo" | "logoDark"
  >;
};

/**
 * Logo + abreviatura del equipo. Si no hay logo, cae a la barra con el color
 * del equipo.
 */
export function TeamMark({ team }: Props) {
  return (
    <span className="flex items-center gap-2" title={team.displayName}>
      {team.logo ? (
        <span className="relative size-5 shrink-0">
          <Image
            src={team.logo}
            alt=""
            width={20}
            height={20}
            className={team.logoDark ? "dark:hidden" : undefined}
          />
          {team.logoDark && (
            <Image
              src={team.logoDark}
              alt=""
              width={20}
              height={20}
              className="absolute inset-0 hidden dark:block"
            />
          )}
        </span>
      ) : (
        <span
          aria-hidden
          className="h-4 w-1 shrink-0 rounded-[1px] bg-line"
          style={team.color ? { backgroundColor: `#${team.color}` } : undefined}
        />
      )}
      <span className="min-w-10">{team.abbreviation}</span>
    </span>
  );
}
