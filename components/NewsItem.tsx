import Image from "next/image";
import { formatRelative } from "@/lib/format";
import type { NewsArticle } from "@/types/news";

type Props = {
  article: NewsArticle;
  now: Date;
  lead?: boolean;
};

function NewsMeta({ article, now, onImage }: Omit<Props, "lead"> & { onImage?: boolean }) {
  return (
    <p
      className={`text-[11px] font-bold uppercase tracking-wider ${
        onImage ? "text-white/80" : "text-muted"
      }`}
    >
      {article.byline ?? "ESPN"} · {formatRelative(article.publishedAt, now)}
    </p>
  );
}

function NewsImage({ article, lead }: Omit<Props, "now">) {
  return (
    <div className={`relative overflow-hidden bg-surface ${lead ? "aspect-[4/3] sm:aspect-[21/9]" : "aspect-video"}`}>
      {article.image && (
        <Image
          src={article.image.url}
          alt={article.image.alt}
          fill
          preload={lead}
          sizes={
            lead
              ? "(min-width: 1152px) 1120px, 100vw"
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
    // Titular sobre la foto, con un velo negro para que se lea.
    return (
      <article className="group relative overflow-hidden rounded-card bg-chrome">
        <NewsImage article={article} lead />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"
        />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-4 text-white sm:max-w-3xl sm:p-6">
          <span className="self-start rounded-sm bg-accent px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-accent-foreground">
            Destacado
          </span>
          <h2 className="font-display text-2xl font-extrabold leading-[1.05] tracking-tight sm:text-4xl">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="after:absolute after:inset-0 group-hover:underline group-hover:decoration-accent group-hover:decoration-2 group-hover:underline-offset-4"
            >
              {article.headline}
            </a>
          </h2>
          {article.description && (
            <p className="hidden text-sm leading-relaxed text-white/80 sm:line-clamp-2">
              {article.description}
            </p>
          )}
          <NewsMeta article={article} now={now} onImage />
        </div>
      </article>
    );
  }

  return (
    <article className="panel group relative flex flex-col overflow-hidden hover:border-subtle">
      <NewsImage article={article} />
      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="text-[15px] font-bold leading-snug">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="after:absolute after:inset-0 group-hover:text-accent"
          >
            {article.headline}
          </a>
        </h3>
        <div className="mt-auto">
          <NewsMeta article={article} now={now} />
        </div>
      </div>
    </article>
  );
}
