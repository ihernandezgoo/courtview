import { addDays, differenceInHours, differenceInMinutes } from "date-fns";
import { es } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";
import type { GameStatus } from "@/types/game";

export const DEFAULT_TIME_ZONE = "Europe/Madrid";

/** La NBA fecha sus jornadas en hora de la costa este. */
const NBA_TIME_ZONE = "America/New_York";

/** Jornada NBA de `now` desplazada `offsetDays`, en formato `YYYYMMDD`. */
export function toNbaDate(now: Date, offsetDays = 0) {
  return formatInTimeZone(addDays(now, offsetDays), NBA_TIME_ZONE, "yyyyMMdd");
}

/** Igual que `toNbaDate`, pero `YYYY-MM-DD` (el formato de las URLs). */
export function toNbaDay(now: Date, offsetDays = 0) {
  return formatInTimeZone(addDays(now, offsetDays), NBA_TIME_ZONE, "yyyy-MM-dd");
}

/** Jornada NBA (`YYYY-MM-DD`) a la que pertenece un partido que empieza en `iso`. */
export function nbaDayOf(iso: string) {
  return formatInTimeZone(iso, NBA_TIME_ZONE, "yyyy-MM-dd");
}

/** "lun", "mié"… a partir de `YYYY-MM-DD`. */
export function formatWeekday(day: string) {
  return formatInTimeZone(`${day}T12:00:00Z`, "UTC", "EEE", { locale: es });
}

/** "octubre 2026" a partir de `YYYY-MM`. */
export function formatMonth(month: string) {
  return formatInTimeZone(`${month}-15T12:00:00Z`, "UTC", "LLLL yyyy", { locale: es });
}

/** "jueves 23 oct, 01:00" en la zona del usuario. */
export function formatDateTime(iso: string, timeZone = DEFAULT_TIME_ZONE) {
  return formatInTimeZone(iso, timeZone, "EEEE d MMM, HH:mm", { locale: es });
}

/** "mié 22 oct" a partir de la fecha de la jornada (`YYYY-MM-DD`). */
export function formatShortDay(usDay: string) {
  return formatInTimeZone(`${usDay}T12:00:00Z`, "UTC", "EEE d MMM", {
    locale: es,
  });
}

export const EMPTY_VALUE = "—";

/** Hora local del usuario: `02:30`. */
export function formatTime(iso: string, timeZone = DEFAULT_TIME_ZONE) {
  return formatInTimeZone(iso, timeZone, "HH:mm");
}

/**
 * Las jornadas de la NBA se juegan de noche en Europa. A partir de la fecha
 * de la jornada en EE. UU. devuelve "Noche del martes 21 al miércoles 22 oct".
 */
export function formatGameNight(usDay: string) {
  const night = new Date(`${usDay}T12:00:00Z`);
  const morning = addDays(night, 1);
  const from = formatInTimeZone(night, "UTC", "EEEE d", { locale: es });
  const to = formatInTimeZone(morning, "UTC", "EEEE d MMM", { locale: es });
  return `Noche del ${from} al ${to}`;
}

/** "viernes 24 oct" en la zona del usuario. */
export function formatDay(iso: string, timeZone = DEFAULT_TIME_ZONE) {
  return formatInTimeZone(iso, timeZone, "EEEE d MMM", { locale: es });
}

/** Fecha local del usuario como `YYYY-MM-DD`, para agrupar por día. */
export function toLocalDayKey(iso: string, timeZone = DEFAULT_TIME_ZONE) {
  return formatInTimeZone(iso, timeZone, "yyyy-MM-dd");
}

/** "hace 5 min", "hace 2 h", "hace 3 d". */
export function formatRelative(iso: string, now: Date) {
  const minutes = differenceInMinutes(now, new Date(iso));
  if (minutes < 1) return "ahora";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = differenceInHours(now, new Date(iso));
  if (hours < 24) return `hace ${hours} h`;
  return `hace ${Math.floor(hours / 24)} d`;
}

export function formatScore(score: number | null) {
  return score === null ? EMPTY_VALUE : String(score);
}

export function formatRecord(record: string | null) {
  return record ?? EMPTY_VALUE;
}

function formatPeriod(period: number) {
  if (period <= 4) return `Q${period}`;
  const overtime = period - 4;
  return overtime === 1 ? "PR" : `${overtime}PR`;
}

/** Cabecera de columna de parciales: `1`, `2`, `3`, `4`, `PR`, `2PR`. */
export function formatPeriodShort(period: number) {
  return period <= 4 ? String(period) : formatPeriod(period);
}

/** "1.er cuarto", "4.º cuarto", "Prórroga", "2.ª prórroga". */
export function formatPeriodName(period: number) {
  const quarters = ["1.er", "2.º", "3.er", "4.º"];
  if (period <= 4) return `${quarters[period - 1]} cuarto`;
  const overtime = period - 4;
  return overtime === 1 ? "Prórroga" : `${overtime}.ª prórroga`;
}

/** Valor de estadística tal cual, o la raya si no hay. */
export function formatStat(value: string | null | undefined) {
  return value ?? EMPTY_VALUE;
}

/** "38-92" → `[38, 92]`. */
export function parseMadeAttempted(value: string | null | undefined): [number, number] | null {
  const match = value?.match(/^(\d+)-(\d+)$/);
  return match ? [Number(match[1]), Number(match[2])] : null;
}

/** Porcentaje con 1 decimal a partir de "38-92": `41.3%`. Sin intentos, raya. */
export function formatPct(madeAttempted: string | null | undefined) {
  const parsed = parseMadeAttempted(madeAttempted);
  if (!parsed || parsed[1] === 0) return EMPTY_VALUE;
  return `${((parsed[0] / parsed[1]) * 100).toFixed(1)}%`;
}

/** Diferencia con signo: `+8`, `-3`, `0`. */
export function formatSigned(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return EMPTY_VALUE;
  const n = Number(value);
  if (Number.isNaN(n)) return EMPTY_VALUE;
  return n > 0 ? `+${n}` : String(n);
}

/** Enteros grandes con separador de miles: `19.057`. */
export function formatInteger(value: number | null) {
  return value === null ? EMPTY_VALUE : value.toLocaleString("es-ES");
}

/** `Final`, `Final/PR`, `Q3 4:21`, `Descanso`, `02:30`, `Aplazado`. */
export function formatGameStatus(
  status: GameStatus,
  startsAt: string,
  timeZone = DEFAULT_TIME_ZONE,
) {
  switch (status.state) {
    case "scheduled":
      return formatTime(startsAt, timeZone);
    case "live":
      if (status.halftime) return "Descanso";
      return `${formatPeriod(status.period)} ${status.clock}`;
    case "final":
      return status.period > 4 ? `Final/${formatPeriod(status.period)}` : "Final";
    case "postponed":
      return "Aplazado";
  }
}
