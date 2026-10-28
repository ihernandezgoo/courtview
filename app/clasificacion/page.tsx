import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { RetryButton } from "@/components/RetryButton";
import { SectionHeading } from "@/components/SectionHeading";
import { SiteHeader } from "@/components/SiteHeader";
import { CutoffLegend, StandingsTable } from "@/components/StandingsTable";
import { CONFERENCES, DIVISIONS, getStandings, sortByRecord, sortBySeed } from "@/lib/standings";
import type { Standing } from "@/types/standings";

export const metadata: Metadata = {
  title: "Clasificación · CourtView",
};

const VIEWS = [
  { id: "conferencia", label: "Conferencia" },
  { id: "division", label: "División" },
  { id: "general", label: "General" },
] as const;

type View = (typeof VIEWS)[number]["id"];

function parseView(value: string | string[] | undefined): View {
  const view = Array.isArray(value) ? value[0] : value;
  return VIEWS.find((v) => v.id === view)?.id ?? "conferencia";
}

export default function StandingsPage({ searchParams }: PageProps<"/clasificacion">) {
  return (
    <>
      <SiteHeader current="clasificacion" />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-20 md:pb-10">
        <Suspense fallback={<StandingsSkeleton />}>
          <StandingsView searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}

async function StandingsView({ searchParams }: Pick<PageProps<"/clasificacion">, "searchParams">) {
  const view = parseView((await searchParams).vista);

  let data;
  try {
    data = await getStandings();
  } catch {
    return (
      <>
        <Title season={null} view={view} />
        <p className="py-3 text-sm text-muted">
          No se ha podido cargar la clasificación de ESPN. <RetryButton />
        </p>
      </>
    );
  }

  const { season, standings } = data;

  return (
    <>
      <Title season={season} view={view} />
      {standings.length === 0 ? (
        <p className="py-3 text-sm text-muted">ESPN todavía no tiene clasificación de esta temporada.</p>
      ) : view === "general" ? (
        <section aria-labelledby="general" className="flex flex-col">
          <SectionHeading id="general" title="Liga" meta={`${standings.length} equipos`} />
          <StandingsTable rows={sortByRecord(standings)} caption="Clasificación general de la NBA" />
        </section>
      ) : view === "division" ? (
        <DivisionView standings={standings} />
      ) : (
        <ConferenceView standings={standings} />
      )}
    </>
  );
}

function Title({ season, view }: { season: string | null; view: View }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <h1 className="text-2xl font-semibold tracking-tight">
        Clasificación{" "}
        {season && <span className="font-normal text-muted tabular-nums">{season}</span>}
      </h1>
      <nav aria-label="Agrupar por">
        <ul className="flex border-b border-line">
          {VIEWS.map((v) => (
            <li key={v.id}>
              <Link
                href={v.id === "conferencia" ? "/clasificacion" : `/clasificacion?vista=${v.id}`}
                aria-current={v.id === view ? "page" : undefined}
                className={
                  v.id === view
                    ? "relative flex h-9 items-center px-3 text-sm font-medium text-foreground after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:bg-accent"
                    : "flex h-9 items-center px-3 text-sm font-medium text-muted hover:text-foreground"
                }
              >
                {v.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

function ConferenceView({ standings }: { standings: Standing[] }) {
  return (
    <div className="flex flex-col gap-10">
      {CONFERENCES.map((conference) => (
        <section key={conference.id} aria-labelledby={conference.id} className="flex flex-col">
          <SectionHeading id={conference.id} title={conference.label} />
          <StandingsTable
            rows={sortBySeed(standings.filter((s) => s.conference === conference.id))}
            caption={`Clasificación de la ${conference.label}`}
            cutoffs
          />
        </section>
      ))}
      <CutoffLegend />
    </div>
  );
}

function DivisionView({ standings }: { standings: Standing[] }) {
  return (
    <div className="flex flex-col gap-12">
      {CONFERENCES.map((conference) => (
        <div key={conference.id} className="flex flex-col gap-6">
          <h2 className="text-lg font-semibold tracking-tight">{conference.label}</h2>
          {DIVISIONS[conference.id].map((division) => {
            const rows = standings.filter((s) => s.division === division);
            if (rows.length === 0) return null;
            const id = `division-${division.toLowerCase()}`;
            return (
              <section key={division} aria-labelledby={id} className="flex flex-col">
                <SectionHeading id={id} title={division} />
                <StandingsTable rows={sortBySeed(rows)} caption={`División ${division}`} />
              </section>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function StandingsSkeleton() {
  return (
    <div aria-busy aria-label="Cargando clasificación" className="flex flex-col">
      <div className="mb-6 h-8 w-56 rounded-sm bg-surface" />
      <SectionHeading title="Conferencia Este" />
      {Array.from({ length: 15 }, (_, i) => (
        <div key={i} className="flex h-9 items-center gap-3 border-b border-line px-2">
          <span className="h-3 w-4 rounded-sm bg-surface" />
          <span className="size-5 rounded-sm bg-surface" />
          <span className="h-3 w-10 rounded-sm bg-surface" />
          <span className="ml-auto h-3 w-48 rounded-sm bg-surface sm:w-96" />
        </div>
      ))}
    </div>
  );
}
