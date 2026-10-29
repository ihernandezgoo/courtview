import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
});

export const metadata: Metadata = {
  title: "CourtView",
  description: "Resultados, noticias, equipos y jugadores de la NBA.",
};

/**
 * Pone `data-theme` antes del primer pintado para que no parpadee: la
 * preferencia guardada por `ThemeToggle` o, si no hay, la del sistema (y la
 * sigue mientras el usuario no elija).
 */
const themeScript = `(() => {
  const media = matchMedia("(prefers-color-scheme: dark)");
  const stored = () => { try { return localStorage.getItem("theme"); } catch { return null; } };
  const apply = () => {
    const theme = stored();
    document.documentElement.dataset.theme =
      theme === "light" || theme === "dark" ? theme : media.matches ? "dark" : "light";
  };
  apply();
  media.addEventListener("change", apply);
})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // El script cambia `data-theme` antes de hidratar.
    <html lang="es" className={`${bricolage.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        {children}
        <footer className="bg-chrome pb-14 text-chrome-muted md:pb-0">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-xs sm:flex-row sm:items-baseline sm:justify-between">
            <p className="font-display text-base font-extrabold uppercase tracking-tight text-chrome-foreground">
              CourtView
            </p>
            <p>Resultados, noticias, equipos y jugadores de la NBA. Datos y noticias de ESPN.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
