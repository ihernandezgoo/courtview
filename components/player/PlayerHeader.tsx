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
      className="flex items-end gap-4 overflow-hidden rounded-card border-t-4 bg-chrome px-4 pt-5 text-chrome-foreground sm:gap-6 sm:px-6"
      style={{ borderTopColor: bio.team?.color ? `#${bio.team.color}` : "var(--accent)" }}
    >
      {bio.headshot && (
        <Image
          src={bio.headshot}
          alt=""
          width={208}
          height={152}
          priority
          className="hidden h-[152px] w-[208px] shrink-0 object-cover object-top sm:block"
        />
      )}
      <div className="flex min-w-0 flex-col gap-2 pb-5">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] font-bold uppercase tracking-wider">
          {bio.team ? (
            <span className="flex items-center gap-2">
              <TeamMark team={bio.team} onChrome />
              <span className="hidden text-chrome-muted sm:inline">{bio.team.displayName}</span>
            </span>
          ) : (
            <span className="text-chrome-muted">Sin equipo</span>
          )}
          {bio.jersey && <span className="tabular-nums text-accent">#{bio.jersey}</span>}
          {position && (
            <abbr title={bio.position ?? undefined} className="no-underline">
              {position}
            </abbr>
          )}
        </p>
        <h1 className="font-display text-4xl font-extrabold uppercase leading-[0.95] tracking-tight sm:text-5xl">
          {bio.name}
        </h1>
        {facts.length > 0 && (
          <p className="text-xs text-chrome-muted tabular-nums">{facts.join(" · ")}</p>
        )}
      </div>
    </header>
  );
}
