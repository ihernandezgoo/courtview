"use client";

import { Moon, Sun } from "lucide-react";

/**
 * Alterna entre modo claro y oscuro y lo guarda. El tema inicial lo pone el
 * script de `app/layout.tsx`; aquí no hay estado de React, así que los iconos
 * y la etiqueta se eligen con CSS y no hay desajuste al hidratar.
 */
export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Sin almacenamiento (modo privado): el cambio dura hasta recargar.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex size-9 items-center justify-center rounded-sm border border-chrome-line text-chrome-muted hover:border-chrome-muted hover:text-chrome-foreground"
    >
      <Moon size={16} strokeWidth={1.75} aria-hidden className="dark:hidden" />
      <Sun size={16} strokeWidth={1.75} aria-hidden className="hidden dark:block" />
      <span className="sr-only dark:hidden">Activar modo oscuro</span>
      <span className="sr-only hidden dark:inline">Activar modo claro</span>
    </button>
  );
}
