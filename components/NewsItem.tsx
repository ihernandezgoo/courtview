import Image from "next/image";
import { formatRelative } from "@/lib/format";
import type { NewsArticle } from "@/types/news";

type Props = {
  article: NewsArticle;
  now: Date;
  lead?: boolean;
};

function NewsMeta({ article, now }: Omit<Props, "lead">) {
  return (
    <p className="text-xs text-muted">
      {article.byline ?? "ESPN"} · {formatRelative(article.publishedAt, now)}
    </p>
  );
}

function NewsImage({ article, lead }: Omit<Props, "now">) {
  return (
    <div className="relative aspect-video overflow-hidden rounded-sm bg-surface">
      {article.image && (
        <Image
          src={article.image.url}
          alt={article.image.alt}
          fill
          preload={lead}
          sizes={
            lead
              ? "(min-width: 1024px) 660px, 100vw"
              : "(min-width: 1024px) 270px, (min-width: 640px) 50vw, 100vw"
          }
          className="object-cover"
        />
      )}
    </div>
  );
}

export function NewsItem({ article, now, lead }: Props) {
  if (lead) {
    return (
      <article className="group grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-8">
        <a href={article.url} target="_blank" rel="noopener noreferrer" tabIndex={-1} aria-hidden>
          <NewsImage article={article} lead />
        </a>
        <div className="flex flex-col justify-center gap-3">
          <h2 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group-hover:text-accent"
            >
              {article.headline}
            </a>
          </h2>
          {article.description && (
            <p className="text-sm leading-relaxed text-muted">{article.description}</p>
          )}
          <NewsMeta article={article} now={now} />
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col gap-2">
      <a href={article.url} target="_blank" rel="noopener noreferrer" tabIndex={-1} aria-hidden>
        <NewsImage article={article} />
      </a>
      <h3 className="text-sm font-semibold leading-snug">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group-hover:text-accent"
        >
          {article.headline}
        </a>
      </h3>
      <NewsMeta article={article} now={now} />
    </article>
  );
}
