import Image from "next/image";
import type { GameTeam } from "@/types/game";

type Team = Pick<GameTeam, "abbreviation" | "displayName" | "color" | "logo" | "logoDark">;

type LogoProps = {
  team: Team;
  /** Lado en px. */
  size?: number;
  /** Sobre la cabecera o el carrusel, que son oscuros también en modo claro. */
  onChrome?: boolean;
};

/**
 * Logo del equipo. Si no hay logo, cae a la barra con el color del equipo.
 */
export function TeamLogo({ team, size = 20, onChrome = false }: LogoProps) {
  if (!team.logo) {
    return (
      <span
        aria-hidden
        className="w-1 shrink-0 rounded-[1px] bg-line"
        style={{ height: size * 0.8, ...(team.color ? { backgroundColor: `#${team.color}` } : {}) }}
      />
    );
  }

  if (onChrome) {
    return (
      <Image
        src={team.logoDark ?? team.logo}
        alt=""
        width={size}
        height={size}
        className="shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span className="relative shrink-0" style={{ width: size, height: size }}>
      <Image
        src={team.logo}
        alt=""
        width={size}
        height={size}
        className={team.logoDark ? "dark:hidden" : undefined}
      />
      {team.logoDark && (
        <Image
          src={team.logoDark}
          alt=""
          width={size}
          height={size}
          className="absolute inset-0 hidden dark:block"
        />
      )}
    </span>
  );
}

type Props = {
  team: Team;
  onChrome?: boolean;
};

/** Logo + abreviatura del equipo. */
export function TeamMark({ team, onChrome }: Props) {
  return (
    <span className="flex items-center gap-2" title={team.displayName}>
      <TeamLogo team={team} onChrome={onChrome} />
      <span className="min-w-10">{team.abbreviation}</span>
    </span>
  );
}
