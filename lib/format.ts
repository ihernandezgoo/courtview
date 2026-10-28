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

/** "sáb 24 oct" en la zona del usuario. */
export function formatShortDate(iso: string, timeZone = DEFAULT_TIME_ZONE) {
  return formatInTimeZone(iso, timeZone, "EEE d MMM", { locale: es });
}

/** "1 jugada", "6 jugadas". */
export function formatCount(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

/** "1 partido", "14 partidos". */
export function formatGameCount(count: number) {
  return formatCount(count, "partido", "partidos");
}

/** Número con separador de miles y los decimales que traiga: `1.485`, `3,5`. */
export function formatNumber(value: number) {
  return value.toLocaleString("es-ES");
}

/** "3:30" o "27:36" → segundos, para comparar tiempos de posesión. */
export function parseClock(value: string | null | undefined) {
  const match = value?.match(/^(\d+):(\d{2})$/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
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

/** `Q3`, `PR`, `2PR`. */
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
      return status.period > 4
        ? `Final/${formatPeriod(status.period)}`
        : "Final";
    case "postponed":
      return "Aplazado";
  }
}

/** Promedio con 1 decimal: `27.4`. */
export function formatAverage(value: number | null) {
  return value === null ? EMPTY_VALUE : value.toFixed(1);
}

/** Promedio con signo: `+8.3`, `-3.0`. */
export function formatSignedAverage(value: number | null) {
  if (value === null) return EMPTY_VALUE;
  const fixed = Math.abs(value).toFixed(1);
  if (Number(fixed) === 0) return "0.0";
  return value > 0 ? `+${fixed}` : `-${fixed}`;
}

/** Porcentaje de victorias como en las clasificaciones: `.750`, `1.000`. */
export function formatWinPct(value: number) {
  const fixed = value.toFixed(3);
  return fixed.startsWith("0") ? fixed.slice(1) : fixed;
}

/** Partidos de diferencia con el líder: `—` para el propio líder, `3.5`. */
export function formatGamesBehind(value: number) {
  return value === 0 ? EMPTY_VALUE : value.toFixed(1);
}

/** Racha: `V4`, `D2`. */
export function formatStreak(value: number | null) {
  if (!value) return EMPTY_VALUE;
  return value > 0 ? `V${value}` : `D${-value}`;
}

/** Valor de un líder estadístico según su tipo: `36.0`, `47.3%`, `144`. */
export function formatLeaderValue(value: number, kind: "average" | "percent" | "total") {
  switch (kind) {
    case "average":
      return value.toFixed(1);
    case "percent":
      return `${value.toFixed(1)}%`;
    case "total":
      return String(Math.round(value));
  }
}

/** Altura en metros a partir de pulgadas: `2,03 m`. */
export function formatHeight(inches: number | null) {
  if (inches === null) return EMPTY_VALUE;
  return `${((inches * 2.54) / 100).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m`;
}

/** Peso en kilos a partir de libras: `104 kg`. */
export function formatWeight(lbs: number | null) {
  return lbs === null ? EMPTY_VALUE : `${Math.round(lbs * 0.453592)} kg`;
}

/** "28 feb 1999" a partir de `YYYY-MM-DD`. */
export function formatBirthDate(day: string) {
  return formatInTimeZone(`${day}T12:00:00Z`, "UTC", "d MMM yyyy", { locale: es });
}

/** "Draft 2018: 1.ª ronda, n.º 3 (ATL)". */
export function formatDraft(draft: { year: number; round: number; pick: number; team: string | null } | null) {
  if (!draft) return "Sin draft";
  const team = draft.team ? ` (${draft.team})` : "";
  return `Draft ${draft.year}: ${draft.round}.ª ronda, n.º ${draft.pick}${team}`;
}

/** "Novato", "9.ª temporada". */
export function formatExperience(season: number | null) {
  if (season === null) return EMPTY_VALUE;
  return season === 1 ? "Novato" : `${season}.ª temporada`;
}

/**
 * Porcentaje que ESPN ya da sobre 100 (`"48.4"`): `48.4%`. ESPN pone `0.0`
 * también cuando no hubo intentos: si se pasan los anotados-intentados
 * (`"0-0"`, `"0.0-0.0"`), sin intentos sale la raya.
 */
export function formatPctValue(value: string | null | undefined, madeAttempted?: string | null) {
  const attempts = madeAttempted?.match(/-([\d.]+)$/)?.[1];
  if (attempts !== undefined && Number(attempts) === 0) return EMPTY_VALUE;
  const n = value === null || value === undefined ? NaN : Number(value);
  return Number.isNaN(n) ? EMPTY_VALUE : `${n.toFixed(1)}%`;
}

/** Puesto en la liga: "1.º", "52.º (empate)". */
export function formatRank(rank: { rank: number; tied: boolean }) {
  return `${rank.rank}.º${rank.tied ? " (empate)" : ""}`;
}

/** Resultado desde el punto de vista del jugador: `V 136-129`, `D 98-104`. */
export function formatGameResult(won: boolean | null, own: number | null, opponent: number | null) {
  if (won === null || own === null || opponent === null) return EMPTY_VALUE;
  return `${won ? "V" : "D"} ${own}-${opponent}`;
}

const POSITIONS: Record<string, string> = {
  PG: "Base",
  SG: "Escolta",
  SF: "Alero",
  PF: "Ala-pívot",
  C: "Pívot",
  G: "Exterior",
  F: "Alero",
  "G-F": "Escolta-alero",
  "F-G": "Alero-escolta",
  "F-C": "Ala-pívot",
  "C-F": "Pívot",
};

/** Nombre de la posición en español: `PG` → "Base". */
export function formatPosition(abbreviation: string | null) {
  if (!abbreviation) return null;
  return POSITIONS[abbreviation] ?? abbreviation;
}
