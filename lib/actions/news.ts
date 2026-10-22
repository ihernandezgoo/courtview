"use server";

import { updateTag } from "next/cache";
import { NEWS_CACHE_TAG, syncNews } from "@/lib/news";

export type RefreshNewsResult = { ok: true } | { ok: false; error: string };

/** Botón "Actualizar": sincroniza con ESPN y muestra el resultado sin esperar a la caché. */
export async function refreshNews(): Promise<RefreshNewsResult> {
  try {
    await syncNews();
  } catch {
    return { ok: false, error: "No se ha podido conectar con ESPN" };
  }
  updateTag(NEWS_CACHE_TAG);
  return { ok: true };
}
