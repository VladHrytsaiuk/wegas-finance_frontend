import type { IconType } from "react-icons";
import {
  HiOutlineBeaker,
  HiOutlineBolt,
  HiOutlineFire,
  HiOutlineHome,
  HiOutlineSun,
  HiOutlineWifi,
} from "react-icons/hi2";
import { format, parse } from "date-fns";
import { uk } from "date-fns/locale";

import type { UtilityMeter, UtilityReading } from "../../../types";

// Логіка комуналки без розмітки: типи послуг, пошук, групування, борг.

export interface ServiceType {
  value: string;
  label: string;
  unit: string;
  color: string;
  Icon: IconType;
}

export const SERVICE_TYPES: ServiceType[] = [
  { value: "electricity", label: "Електроенергія", unit: "kW", color: "#f59e0b", Icon: HiOutlineBolt },
  { value: "water", label: "Водопостачання", unit: "m3", color: "#3b82f6", Icon: HiOutlineBeaker },
  { value: "gas", label: "Газопостачання", unit: "m3", color: "#ef4444", Icon: HiOutlineFire },
  { value: "internet", label: "Інтернет / ТБ", unit: "міс", color: "#10b981", Icon: HiOutlineWifi },
  { value: "rent", label: "Квартплата / Оренда", unit: "міс", color: "#6366f1", Icon: HiOutlineHome },
  { value: "heating", label: "Опалення", unit: "Gcal", color: "#f97316", Icon: HiOutlineSun },
];

const OTHER_TYPE: ServiceType = {
  value: "other",
  label: "Інше",
  unit: "",
  color: "#8b5cf6",
  Icon: HiOutlineBolt,
};

export const serviceType = (value: string): ServiceType =>
  SERVICE_TYPES.find((t) => t.value === value) ?? OTHER_TYPE;

export type MeterGrouping = "asset" | "type" | "name";

export const METER_GROUPINGS: { value: MeterGrouping; label: string }[] = [
  { value: "asset", label: "По нерухомості" },
  { value: "type", label: "По типу послуг" },
  { value: "name", label: "А–Я списком" },
];

export const NO_ASSET_GROUP = "Інше / без прив'язки";
const ALL_GROUP = "Усі";

export function filterMeters(
  meters: UtilityMeter[],
  query: string,
  types: string[],
): UtilityMeter[] {
  const q = query.trim().toLowerCase();
  return meters.filter((m) => {
    if (types.length > 0 && !types.includes(m.type)) return false;
    if (!q) return true;
    return (
      m.name.toLowerCase().includes(q) ||
      !!m.personal_account?.toLowerCase().includes(q) ||
      !!m.asset?.name?.toLowerCase().includes(q)
    );
  });
}

/** Групи у вигляді впорядкованого списку: «Інше» завжди в кінці. */
export function groupMeters(
  meters: UtilityMeter[],
  grouping: MeterGrouping,
): { name: string; meters: UtilityMeter[] }[] {
  if (grouping === "name") {
    return [
      {
        name: ALL_GROUP,
        meters: [...meters].sort((a, b) => a.name.localeCompare(b.name, "uk")),
      },
    ];
  }
  const map = new Map<string, UtilityMeter[]>();
  for (const meter of meters) {
    const key =
      grouping === "asset"
        ? meter.asset?.name || NO_ASSET_GROUP
        : serviceType(meter.type).label;
    map.set(key, [...(map.get(key) ?? []), meter]);
  }
  return [...map.entries()]
    .sort(([a], [b]) =>
      a === NO_ASSET_GROUP ? 1 : b === NO_ASSET_GROUP ? -1 : a.localeCompare(b, "uk"),
    )
    .map(([name, list]) => ({
      name,
      meters: list.sort((a, b) => a.name.localeCompare(b.name, "uk")),
    }));
}

/** Борг перед постачальником у валюті лічильника (мінорні одиниці, ≥ 0). */
export function meterDebt(meter: UtilityMeter): number {
  const balance = meter.counterparty?.balances?.find(
    (b) => b.currency === meter.currency,
  )?.balance;
  return balance && balance < 0 ? Math.abs(balance) : 0;
}

export const unpaidTotal = (readings: UtilityReading[]) =>
  readings
    .filter((r) => !r.is_paid)
    .reduce((sum, r) => sum + r.calculated_cost, 0);

/** Число для показу: без зайвих нулів, до чотирьох знаків. */
export const fmtNumber = (value: number | undefined | null, digits = 2) =>
  value === undefined || value === null
    ? "—"
    : new Intl.NumberFormat("uk-UA", { maximumFractionDigits: digits }).format(value);

/** «2026-03» → «березень 2026». */
export function monthLabel(value: string): string {
  try {
    return format(parse(value, "yyyy-MM", new Date()), "LLLL yyyy", { locale: uk });
  } catch {
    return value;
  }
}

export const dateLabel = (ms?: number | null) =>
  ms ? format(new Date(ms), "dd.MM.yyyy") : "—";
