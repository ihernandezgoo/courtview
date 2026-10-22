import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { RefreshNewsButton } from "@/components/RefreshNewsButton";
import { RetryButton } from "@/components/RetryButton";
import { SectionHeading } from "@/components/SectionHeading";
import { SiteHeader } from "@/components/SiteHeader";
import { formatDay, formatTime, toLocalDayKey } from "@/lib/format";
import { getNewsArchive } from "@/lib/news";
import type { NewsArticle } from "@/types/news";

export const metadata: Metadata = {
  title: "Archivo de noticias · CourtView",
};

export default function NewsArchivePage({ searchParams }: PageProps<"/noticias">) {
  return (
    <>
      <SiteHeader current="noticias" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-6 pb-20 md:pb-10">
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">Archivo de noticias</h1>
          <div className="flex items-baseline gap-4">
            <RefreshNewsButton />
            <Link href="/" className="text-sm text-accent hover:underline">
              Volver a portada
            </Link>
          </div>
        </div>
        <Suspense fallback={<ArchiveSkeleton />}>
          <Archive searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}

function parsePage(value: string | string[] | undefined) {
  const page = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

async function Archive({ searchParams }: Pick<PageProps<"/noticias">, "searchParams">) {
  const page = parsePage((await searchParams).pagina);

  let archive;
  try {
    archive = await getNewsArchive(page);
  } catch {
    return (
      <p className="py-3 text-sm text-muted">
        No se ha podido leer el archivo de noticias. <RetryButton />
      </p>
    );
  }

  const { articles, total, pageCount } = archive;

  if (total === 0) {
    return (
      <p className="py-3 text-sm text-muted">
        Todavía no hay noticias guardadas. Se sincronizan con ESPN cada 5 minutos.
      </p>
    );
  }

  if (articles.length === 0) {
    return (
      <p className="py-3 text-sm text-muted">
        La página {page} no existe; el archivo tiene {pageCount}.{" "}
        <Link href="/noticias" className="text-accent hover:underline">
          Ir a la primera
        </Link>
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {groupByDay(articles).map(({ day, items }) => (
        <section key={day} aria-labelledby={`dia-${day}`} className="flex flex-col">
          <SectionHeading
            id={`dia-${day}`}
            title={formatDay(items[0].publishedAt)}
            meta={`${items.length} ${items.length === 1 ? "noticia" : "noticias"}`}
          />
          <ol className="divide-y divide-line">
            {items.map((article) => (
              <ArchiveRow key={article.id} article={article} />
            ))}
          </ol>
        </section>
      ))}
      <Pagination page={page} pageCount={pageCount} total={total} />
    </div>
  );
}

function groupByDay(articles: NewsArticle[]) {
  const groups: { day: string; items: NewsArticle[] }[] = [];
  for (const article of articles) {
    const day = toLocalDayKey(article.publishedAt);
    const last = groups.at(-1);
    if (last?.day === day) last.items.push(article);
    else groups.push({ day, items: [article] });
  }
  return groups;
}

function ArchiveRow({ article }: { article: NewsArticle }) {
  return (
    <li className="grid grid-cols-[3rem_minmax(0,1fr)] gap-3 py-2.5">
      <time
        dateTime={article.publishedAt}
        className="pt-px text-xs text-muted tabular-nums"
      >
        {formatTime(article.publishedAt)}
      </time>
      <div className="flex flex-col gap-0.5">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium leading-snug hover:text-accent"
        >
          {article.headline}
        </a>
        <span className="text-xs text-muted">{article.byline ?? "ESPN"}</span>
      </div>
    </li>
  );
}

function Pagination({ page, pageCount, total }: { page: number; pageCount: number; total: number }) {
  return (
    <nav
      aria-label="Páginas del archivo"
      className="flex items-center justify-between gap-4 border-t border-line pt-3 text-sm"
    >
      {page > 1 ? (
        <Link href={`/noticias?pagina=${page - 1}`} className="text-accent hover:underline">
          Más recientes
        </Link>
      ) : (
        <span />
      )}
      <span className="text-xs text-muted tabular-nums">
        Página {page} de {pageCount} · {total} noticias
      </span>
      {page < pageCount ? (
        <Link href={`/noticias?pagina=${page + 1}`} className="text-accent hover:underline">
          Anteriores
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

function ArchiveSkeleton() {
  return (
    <div aria-busy aria-label="Cargando archivo" className="flex flex-col">
      <SectionHeading title="Cargando" />
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i} className="grid grid-cols-[3rem_minmax(0,1fr)] gap-3 border-b border-line py-2.5">
          <span className="h-3 w-9 rounded-sm bg-surface" />
          <div className="flex flex-col gap-1.5">
            <span className="h-3.5 w-full rounded-sm bg-surface" />
            <span className="h-3 w-24 rounded-sm bg-surface" />
          </div>
        </div>
      ))}
    </div>
  );
}
