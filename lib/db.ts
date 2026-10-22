import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Falta DATABASE_URL en .env");
  const { hostname, port, username, password, pathname } = new URL(url);
  const adapter = new PrismaMariaDb({
    host: hostname,
    port: port ? Number(port) : 3306,
    user: decodeURIComponent(username),
    password: decodeURIComponent(password),
    database: pathname.slice(1),
    connectionLimit: 5,
  });
  return new PrismaClient({ adapter });
}

// En desarrollo el hot reload reevalúa los módulos: reutilizamos el cliente
// para no abrir un pool de conexiones nuevo en cada cambio.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
