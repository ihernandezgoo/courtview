import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

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
    ? "flex h-14 items-center justify-center px-1 text-[11px] font-bold uppercase tracking-wide"
    : "flex h-16 items-center px-3.5 text-[13px] font-bold uppercase tracking-wider";

  return (
    <Link
      href={section.href}
      aria-current={current ? "page" : undefined}
      className={
        current
          ? `${base} relative text-chrome-foreground after:absolute after:inset-x-3 after:h-[3px] after:rounded-full after:bg-accent ${
              compact ? "after:top-0" : "after:bottom-0"
            }`
          : `${base} text-chrome-muted hover:text-chrome-foreground`
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
      <header className="sticky top-0 z-20 border-b border-chrome-line bg-chrome text-chrome-foreground">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-10 px-4">
          <Link href="/" className="flex items-center gap-2.5" aria-label="CourtView NBA, portada">
            <span
              aria-hidden
              className="font-display flex size-8 items-center justify-center rounded-md bg-accent text-lg font-extrabold leading-none text-accent-foreground"
            >
              C
            </span>
            <span className="font-display text-2xl font-extrabold uppercase leading-none tracking-tight">
              CourtView
            </span>
            <span className="rounded-sm border border-chrome-line px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-chrome-muted">
              NBA
            </span>
          </Link>
          <nav aria-label="Secciones" className="hidden md:block">
            <ul className="flex">
              {sections.map((section) => (
                <li key={section.id}>
                  <NavItem section={section} current={section.id === current} />
                </li>
              ))}
            </ul>
          </nav>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <nav
        aria-label="Secciones"
        className="fixed inset-x-0 bottom-0 z-20 border-t border-chrome-line bg-chrome md:hidden"
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
