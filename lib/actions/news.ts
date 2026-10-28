"use server";

import { updateTag } from "next/cache";
import { NEWS_CACHE_TAG } from "@/lib/news";

export type RefreshNewsResult = { ok: true } | { ok: false; error: string };

/** Botón "Actualizar": descarta la caché para que la próxima carga pida a ESPN. */
export async function refreshNews(): Promise<RefreshNewsResult> {
  try {
    updateTag(NEWS_CACHE_TAG);
  } catch {
    return { ok: false, error: "No se ha podido actualizar" };
  }
  return { ok: true };
}
