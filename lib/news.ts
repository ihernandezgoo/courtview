import { cacheLife, cacheTag } from "next/cache";
import type { NewsArticle as NewsRow } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { fetchNews } from "@/lib/nba";
import type { NewsArticle } from "@/types/news";

export const NEWS_SYNC_INTERVAL_MS = 5 * 60 * 1000;
export const NEWS_CACHE_TAG = "news";

/** Si alguien pulsa "Actualizar" varias veces seguidas, no volvemos a llamar a ESPN. */
const MIN_SYNC_GAP_MS = 30 * 1000;

// Compartido entre la sincronización periódica y el botón (mismo proceso).
const syncState = globalThis as unknown as { newsLastSyncAt?: number };

/**
 * Trae las últimas noticias de ESPN y las guarda. Es un upsert: las que ya
 * teníamos se actualizan (ESPN a veces corrige titulares) y nunca se borra
 * ninguna, así que la tabla acumula el archivo completo.
 *
 * @returns Noticias recibidas, o `null` si se ha saltado por haber sincronizado hace poco.
 */
export async function syncNews() {
  const last = syncState.newsLastSyncAt ?? 0;
  if (Date.now() - last < MIN_SYNC_GAP_MS) return null;
  syncState.newsLastSyncAt = Date.now();

  try {
    return await saveNews();
  } catch (error) {
    // Si ha fallado, que se pueda reintentar enseguida.
    syncState.newsLastSyncAt = last;
    throw error;
  }
}

async function saveNews() {
  const articles = await fetchNews();
  await db.$transaction(
    articles.map((article) => {
      const data = {
        headline: article.headline,
        description: article.description,
        byline: article.byline,
        publishedAt: new Date(article.publishedAt),
        url: article.url,
        imageUrl: article.image?.url ?? null,
        imageAlt: article.image?.alt ?? null,
      };
      return db.newsArticle.upsert({
        where: { id: article.id },
        create: { id: article.id, ...data },
        update: data,
      });
    }),
  );
  return articles.length;
}

function toArticle(row: NewsRow): NewsArticle {
  return {
    id: row.id,
    headline: row.headline,
    description: row.description,
    byline: row.byline,
    publishedAt: row.publishedAt.toISOString(),
    url: row.url,
    image: row.imageUrl ? { url: row.imageUrl, alt: row.imageAlt ?? row.headline } : null,
  };
}

/** Las noticias sin foto se guardan, pero no se muestran. */
const withImage = { imageUrl: { not: null } };

/** `syncedAt`: última vez que se guardó algo de ESPN (ISO), o `null` si la tabla está vacía. */
export async function getLatestNews(limit = 13) {
  "use cache";
  cacheLife("minutes");
  cacheTag(NEWS_CACHE_TAG);

  const [rows, lastSync] = await Promise.all([
    db.newsArticle.findMany({
      where: withImage,
      orderBy: { publishedAt: "desc" },
      take: limit,
    }),
    db.newsArticle.aggregate({ _max: { updatedAt: true } }),
  ]);
  return {
    articles: rows.map(toArticle),
    syncedAt: lastSync._max.updatedAt?.toISOString() ?? null,
  };
}

export const NEWS_ARCHIVE_PAGE_SIZE = 40;

/** @param page Empieza en 1. */
export async function getNewsArchive(page: number) {
  "use cache";
  cacheLife("minutes");
  cacheTag(NEWS_CACHE_TAG);

  const [rows, total] = await Promise.all([
    db.newsArticle.findMany({
      where: withImage,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * NEWS_ARCHIVE_PAGE_SIZE,
      take: NEWS_ARCHIVE_PAGE_SIZE,
    }),
    db.newsArticle.count({ where: withImage }),
  ]);
  return {
    articles: rows.map(toArticle),
    total,
    pageCount: Math.max(1, Math.ceil(total / NEWS_ARCHIVE_PAGE_SIZE)),
  };
}
