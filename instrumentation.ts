export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { syncNews, NEWS_SYNC_INTERVAL_MS } = await import("@/lib/news");

  const run = async () => {
    try {
      const count = await syncNews();
      if (count !== null) console.log(`[noticias] sincronizadas ${count} noticias de ESPN`);
    } catch (error) {
      console.error("[noticias] fallo al sincronizar con ESPN", error);
    }
  };

  // La primera se espera para que la BD tenga noticias antes de la primera
  // petición; después, cada 5 minutos mientras el servidor esté levantado.
  await run();
  setInterval(run, NEWS_SYNC_INTERVAL_MS).unref();
}
