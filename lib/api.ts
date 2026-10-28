import "server-only";

/**
 * La raíz de la API viene de `ESPN_API_URL` (ver `.env.example`). Al no
 * llevar `NEXT_PUBLIC_`, nunca llega al navegador; `server-only` hace que el
 * build falle si algún componente de cliente importa este módulo.
 */
function apiRoot() {
  const url = process.env.ESPN_API_URL;
  if (!url) throw new Error("Falta ESPN_API_URL en las variables de entorno (ver .env.example)");
  return url.replace(/\/+$/, "");
}

const NBA_PATH = "basketball/nba";

/** Endpoints de ESPN de la NBA. Función y no constante: la variable de entorno se lee al hacer la petición. */
export function nbaApi() {
  const root = apiRoot();
  const site = `${root}/site/v2/sports/${NBA_PATH}`;
  const athlete = (id: string) => `${root}/common/v3/sports/${NBA_PATH}/athletes/${encodeURIComponent(id)}`;
  return {
    scoreboard: `${site}/scoreboard`,
    news: `${site}/news`,
    summary: (gameId: string) => `${site}/summary?event=${encodeURIComponent(gameId)}`,
    /** Con `level=3` agrupa por conferencia y división. */
    standings: `${root}/v2/sports/${NBA_PATH}/standings?level=3`,
    leaders: `${root}/site/v3/sports/${NBA_PATH}/leaders`,
    /** Ficha: datos personales, equipo y resumen de la temporada. */
    athlete,
    /** Partidos de la temporada actual. */
    athleteGameLog: (id: string) => `${athlete(id)}/gamelog`,
    /** Promedios y totales por temporada. */
    athleteStats: (id: string) => `${athlete(id)}/stats`,
  } as const;
}
