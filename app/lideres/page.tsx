import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { RetryButton } from "@/components/RetryButton";
import { SectionHeading } from "@/components/SectionHeading";
import { SiteHeader } from "@/components/SiteHeader";
import { TeamMark } from "@/components/TeamMark";
import { formatLeaderValue } from "@/lib/format";
import { getLeaders } from "@/lib/leaders";
import type { LeaderCategory } from "@/types/leaders";

export const metadata: Metadata = {
  title: "Líderes · CourtView",
};

export default function LeadersPage() {
  return (
    <>
      <SiteHeader current="lideres" />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-20 md:pb-10">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">Líderes estadísticos</h1>
        <Suspense fallback={<LeadersSkeleton />}>
          <Leaders />
        </Suspense>
      </main>
    </>
  );
}

async function Leaders() {
  let categories;
  try {
    categories = await getLeaders();
  } catch {
    return (
      <p className="py-3 text-sm text-muted">
        No se han podido cargar los líderes de ESPN. <RetryButton />
      </p>
    );
  }

  if (categories.length === 0) {
    return <p className="py-3 text-sm text-muted">ESPN todavía no tiene líderes de esta temporada.</p>;
  }

  return (
    <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <CategoryList key={category.id} category={category} />
      ))}
    </div>
  );
}

function CategoryList({ category }: { category: LeaderCategory }) {
  const id = `lider-${category.id}`;
  return (
    <section aria-labelledby={id} className="flex flex-col">
      <SectionHeading id={id} title={category.label} meta={category.abbreviation} />
      <ol>
        {category.leaders.map((leader, i) => {
          const first = leader.rank === 1;
          return (
            <li
              key={leader.athlete.id}
              className={`grid h-8 grid-cols-[1.5rem_minmax(0,1fr)_auto_3.5rem] items-center gap-2 border-b border-line text-[13px] ${
                first ? "bg-leader" : ""
              }`}
            >
              <span className="pr-0.5 text-right text-muted tabular-nums">
                {i > 0 && category.leaders[i - 1].rank === leader.rank ? "" : leader.rank}
              </span>
              <span className={`truncate ${first ? "font-semibold" : ""}`} title={leader.athlete.name}>
                <Link href={`/jugadores/${leader.athlete.id}`} className="hover:text-accent hover:underline">
                  {leader.athlete.name}
                </Link>
                {leader.athlete.position && (
                  <span className="ml-1.5 text-[11px] font-normal text-subtle">{leader.athlete.position}</span>
                )}
              </span>
              <span className="text-xs text-muted">{leader.team && <TeamMark team={leader.team} />}</span>
              <span className={`pr-2 text-right tabular-nums ${first ? "font-semibold" : ""}`}>
                {formatLeaderValue(leader.value, category.kind)}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function LeadersSkeleton() {
  return (
    <div aria-busy aria-label="Cargando líderes" className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex flex-col">
          <SectionHeading title="Cargando" />
          {Array.from({ length: 10 }, (_, j) => (
            <div key={j} className="flex h-8 items-center gap-3 border-b border-line">
              <span className="h-3 w-4 rounded-sm bg-surface" />
              <span className="h-3 w-32 rounded-sm bg-surface" />
              <span className="ml-auto h-3 w-10 rounded-sm bg-surface" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
