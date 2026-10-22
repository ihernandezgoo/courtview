export type NewsImage = {
  url: string;
  alt: string;
};

export type NewsArticle = {
  id: string;
  headline: string;
  description: string | null;
  byline: string | null;
  /** ISO 8601 en UTC. */
  publishedAt: string;
  url: string;
  image: NewsImage | null;
};
