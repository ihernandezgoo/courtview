import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-10 pb-20">
      <h1 className="text-lg font-semibold">No existe esta página</h1>
      <p className="mt-2 text-sm text-muted">
        Puede que el partido o el enlace ya no estén en ESPN.{" "}
        <Link href="/partidos" className="text-accent hover:underline">
          Ver los partidos de hoy
        </Link>
      </p>
    </main>
  );
}
