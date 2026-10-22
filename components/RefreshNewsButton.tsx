"use client";

import { useState, useTransition } from "react";
import { refreshNews } from "@/lib/actions/news";

export function RefreshNewsButton() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <span className="flex items-baseline gap-2 text-xs">
      {error && (
        <span role="alert" className="text-loss">
          {error}
        </span>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await refreshNews();
            setError(result.ok ? null : result.error);
          })
        }
        className="font-medium text-accent hover:underline disabled:text-muted disabled:no-underline"
      >
        {pending ? "Actualizando…" : "Actualizar"}
      </button>
    </span>
  );
}
