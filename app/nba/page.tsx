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

export default function Home() {
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
      <footer className="border-t border-line pb-14 md:pb-0">
        <p className="mx-auto max-w-6xl px-4 py-3 text-xs text-muted">
          Resultados, noticias, equipos y jugadores de la NBA. Noticias de ESPN.
        </p>
      </footer>
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
        <p className="py-3 text-sm text-muted">Todavía no hay noticias de la NBA guardadas.</p>
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
          meta={news.syncedAt ? `Actualizado ${formatRelative(news.syncedAt, now)}` : undefined}
          action={<RefreshNewsButton />}
        />
        <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {rest.map((article) => (
            <NewsItem key={article.id} article={article} now={now} />
          ))}
        </div>
        <Link
          href="/noticias"
          className="self-start border-t border-line pt-3 text-sm font-medium text-accent hover:underline"
        >
          Ver todas las noticias guardadas
        </Link>
      </section>
    </div>
  );
}

function NewsSkeleton() {
  return (
    <div aria-busy aria-label="Cargando noticias" className="flex flex-col gap-8">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-8">
        <div className="aspect-video rounded-sm bg-surface" />
        <div className="flex flex-col justify-center gap-3">
          <span className="h-7 w-full rounded-sm bg-surface" />
          <span className="h-7 w-3/4 rounded-sm bg-surface" />
          <span className="h-3 w-32 rounded-sm bg-surface" />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <SectionHeading title="Últimas noticias" />
        <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="aspect-video rounded-sm bg-surface" />
              <span className="h-3.5 w-full rounded-sm bg-surface" />
              <span className="h-3.5 w-2/3 rounded-sm bg-surface" />
              <span className="h-3 w-24 rounded-sm bg-surface" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
