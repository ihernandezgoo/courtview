import Image from "next/image";
import { TeamMark } from "@/components/TeamMark";
import {
  formatBirthDate,
  formatDraft,
  formatExperience,
  formatHeight,
  formatPosition,
  formatWeight,
} from "@/lib/format";
import type { PlayerBio } from "@/types/player";

/** Nombre, equipo, posición y dorsal; debajo, los datos físicos y de carrera en una línea densa. */
export function PlayerHeader({ bio }: { bio: PlayerBio }) {
  const position = formatPosition(bio.position);
  const facts = [
    bio.heightInches !== null ? formatHeight(bio.heightInches) : null,
    bio.weightLbs !== null ? formatWeight(bio.weightLbs) : null,
    bio.age !== null
      ? `${bio.age} años${bio.birthDate ? ` (${formatBirthDate(bio.birthDate)})` : ""}`
      : null,
    bio.birthPlace,
    formatDraft(bio.draft),
    bio.experience !== null ? formatExperience(bio.experience) : null,
  ].filter(Boolean);

  return (
    <header
      className="flex items-end gap-4 border-b border-foreground border-l-4 border-l-line pb-3 pl-3"
      style={bio.team?.color ? { borderLeftColor: `#${bio.team.color}` } : undefined}
    >
      {bio.headshot && (
        <Image
          src={bio.headshot}
          alt=""
          width={104}
          height={76}
          priority
          className="hidden h-[76px] w-[104px] shrink-0 object-cover object-top sm:block"
        />
      )}
      <div className="flex min-w-0 flex-col gap-1.5">
        <h1 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">{bio.name}</h1>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          {bio.team ? (
            <span className="flex items-center gap-2 font-medium">
              <TeamMark team={bio.team} />
              <span className="hidden text-muted sm:inline">{bio.team.displayName}</span>
            </span>
          ) : (
            <span className="text-muted">Sin equipo</span>
          )}
          {bio.jersey && <span className="tabular-nums">#{bio.jersey}</span>}
          {position && (
            <abbr title={bio.position ?? undefined} className="no-underline">
              {position}
            </abbr>
          )}
        </p>
        {facts.length > 0 && (
          <p className="text-xs text-muted tabular-nums">{facts.join(" · ")}</p>
        )}
      </div>
    </header>
  );
}
