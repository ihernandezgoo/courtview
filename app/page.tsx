import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { NewsItem } from "@/components/NewsItem";
import { RefreshNewsButton } from "@/components/RefreshNewsButton";
import { RetryButton } from "@/components/RetryButton";
import { SectionHeading } from "@/components/SectionHeading";
import { ScoreStrip, ScoreStripSkeleton } from "@/components/ScoreStrip";
import { SiteHeader } from "@/components/SiteHeader";
import Link from "next/link";
import { formatRelative } from "@/lib/format";
import { getLatestNews } from "@/lib/news";

export const metadata: Metadata = {
  title: "NBA · CourtView",
};

export default function NbaHome() {
  return (
    <>
      <Suspense fallback={<ScoreStripSkeleton />}>
        <ScoreStrip />
      </Suspense>
      <SiteHeader current="noticias" />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-20 md:pb-10">
        <h1 className="sr-only">Noticias de la NBA</h1>
        <Suspense fallback={<NewsSkeleton />}>
          <News />
        </Suspense>
      </main>
    </>
  );
}

async function News() {
  let news;
  try {
    news = await getLatestNews();
  } catch {
    return (
      <>
        <SectionHeading title="Noticias" />
        <p className="py-3 text-sm text-muted">
          No se han podido cargar las noticias. <RetryButton />
        </p>
      </>
    );
  }

  await connection();
  const now = new Date();
  const [lead, ...rest] = news.articles;

  if (!lead) {
    return (
      <>
        <SectionHeading title="Noticias" action={<RefreshNewsButton />} />
        <p className="py-3 text-sm text-muted">ESPN no tiene ahora mismo noticias de la NBA.</p>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <NewsItem article={lead} now={now} lead />
      <section aria-labelledby="ultimas" className="flex flex-col gap-4">
        <SectionHeading
          id="ultimas"
          title="Últimas noticias"
          meta={`Actualizado ${formatRelative(news.fetchedAt, now)}`}
          action={<RefreshNewsButton />}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {rest.map((article) => (
            <NewsItem key={article.id} article={article} now={now} />
          ))}
        </div>
        <Link
          href="/noticias"
          className="self-start rounded-sm bg-accent px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-accent-foreground hover:opacity-90"
        >
          Ver todas las noticias
        </Link>
      </section>
    </div>
  );
}

function NewsSkeleton() {
  return (
    <div aria-busy aria-label="Cargando noticias" className="flex flex-col gap-8">
      <div className="aspect-[4/3] rounded-card bg-surface sm:aspect-[21/9]" />
      <div className="flex flex-col gap-4">
        <SectionHeading title="Últimas noticias" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="panel flex flex-col gap-2 overflow-hidden pb-3">
              <div className="aspect-video bg-surface" />
              <span className="mx-3 h-3.5 rounded-sm bg-surface" />
              <span className="mx-3 h-3.5 w-2/3 rounded-sm bg-surface" />
              <span className="mx-3 h-3 w-24 rounded-sm bg-surface" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
