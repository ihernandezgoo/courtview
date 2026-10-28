import { cacheLife, cacheTag } from "next/cache";
import { fetchNews } from "@/lib/nba";

export const NEWS_CACHE_TAG = "news";

/** Lo máximo que devuelve ESPN en una petición. */
const ESPN_NEWS_LIMIT = 50;

/**
 * Últimas noticias de ESPN, cacheadas unos minutos. Las que no tienen foto
 * no se muestran.
 *
 * `fetchedAt`: cuándo se pidieron a ESPN (ISO), para el "Actualizado hace X".
 */
async function getAllNews() {
  "use cache";
  cacheLife("minutes");
  cacheTag(NEWS_CACHE_TAG);

  const articles = await fetchNews(ESPN_NEWS_LIMIT);
  return {
    articles: articles
      .filter((article) => article.image)
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)),
    fetchedAt: new Date().toISOString(),
  };
}

export async function getLatestNews(limit = 13) {
  const { articles, fetchedAt } = await getAllNews();
  return { articles: articles.slice(0, limit), fetchedAt };
}

export async function getNewsArchive() {
  return getAllNews();
}
