import Link from "next/link";

type SectionId = "partidos" | "clasificacion" | "lideres" | "noticias";

type Section = { id: SectionId; label: string; href: string };

const sections: Section[] = [
  { id: "partidos", label: "Partidos", href: "/partidos" },
  { id: "clasificacion", label: "Clasificación", href: "/clasificacion" },
  { id: "lideres", label: "Líderes", href: "/lideres" },
  { id: "noticias", label: "Noticias", href: "/" },
];

function NavItem({
  section,
  current,
  compact,
}: {
  section: Section;
  current: boolean;
  compact?: boolean;
}) {
  const base = compact
    ? "flex h-14 items-center justify-center px-1 text-[11px] font-medium"
    : "flex h-14 items-center px-3 text-sm font-medium";

  return (
    <Link
      href={section.href}
      aria-current={current ? "page" : undefined}
      className={
        current
          ? `${base} relative text-foreground after:absolute after:inset-x-3 after:h-0.5 after:bg-accent ${
              compact ? "after:top-0" : "after:bottom-0"
            }`
          : `${base} text-muted hover:text-foreground`
      }
    >
      {section.label}
    </Link>
  );
}

type Props = {
  /** Sección activa; sin ella no se marca ninguna (p. ej. en la ficha de un jugador). */
  current?: SectionId;
};

export function SiteHeader({ current }: Props) {
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-line bg-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-10 px-4">
          <div className="flex items-baseline gap-3">
            <Link
              href="/"
              className="font-score text-2xl font-bold uppercase leading-none tracking-wide"
            >
              Court<span className="text-accent">View</span>
            </Link>
            <span className="border-l border-line pl-3 font-score text-xl font-medium uppercase leading-none tracking-wide text-muted">
              NBA
            </span>
          </div>
          <nav aria-label="Secciones" className="hidden md:block">
            <ul className="flex">
              {sections.map((section) => (
                <li key={section.id}>
                  <NavItem section={section} current={section.id === current} />
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <nav
        aria-label="Secciones"
        className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-background md:hidden"
      >
        <ul className="grid auto-cols-fr grid-flow-col">
          {sections.map((section) => (
            <li key={section.id}>
              <NavItem section={section} current={section.id === current} compact />
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
