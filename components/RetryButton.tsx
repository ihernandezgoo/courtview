"use client";

import { useRouter } from "next/navigation";

export function RetryButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.refresh()}
      className="text-accent underline underline-offset-2"
    >
      Reintentar
    </button>
  );
}
