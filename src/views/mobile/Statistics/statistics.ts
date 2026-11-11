import {
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfDay,
  endOfMonth,
  format,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
} from "date-fns";
import { uk } from "date-fns/locale";

import type { TopStat, TrendStat } from "../../../services/apiStats";
import type { Category, Counterparty } from "../../../types";
import { categoryLabel } from "../../../mobile/categoryLabel";

// Логіка статистики без розмітки: періоди, точки графіка, рядки з відсотками.

export type PeriodKey =
  | "today"
  | "yesterday"
  | "7d"
  | "month"
  | "last_month"
  | "30d"
  | "year"
  | "all"
  | "custom";

export const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: "today", label: "Сьогодні" },
  { key: "yesterday", label: "Вчора" },
  { key: "7d", label: "Останні 7 днів" },
  { key: "month", label: "Цей місяць" },
  { key: "last_month", label: "Минулий місяць" },
  { key: "30d", label: "Останні 30 днів" },
  { key: "year", label: "Цей рік" },
  { key: "all", label: "Весь час" },
];

export interface CustomRange {
  from: string; // yyyy-MM-dd
  to: string;
}

export interface Range {
  from: number;
  to: number;
}

const parseDay = (value: string) => new Date(`${value}T12:00:00`);

export function periodRange(key: PeriodKey, custom: CustomRange, now = new Date()): Range {
  const end = endOfDay(now).getTime();
  switch (key) {
    case "today":
      return { from: startOfDay(now).getTime(), to: end };
    case "yesterday": {
      const y = subDays(now, 1);
      return { from: startOfDay(y).getTime(), to: endOfDay(y).getTime() };
    }
    case "7d":
      return { from: startOfDay(subDays(now, 6)).getTime(), to: end };
    case "month":
      return { from: startOfMonth(now).getTime(), to: endOfMonth(now).getTime() };
    case "last_month": {
      const m = subMonths(now, 1);
      return { from: startOfMonth(m).getTime(), to: endOfMonth(m).getTime() };
    }
    case "year":
      return { from: startOfYear(now).getTime(), to: end };
    case "all":
      return { from: 0, to: end };
    case "custom": {
      const from = custom.from ? parseDay(custom.from) : subDays(now, 29);
      const to = custom.to ? parseDay(custom.to) : now;
      const [a, b] = from <= to ? [from, to] : [to, from];
      return { from: startOfDay(a).getTime(), to: endOfDay(b).getTime() };
    }
    default:
      return { from: startOfDay(subDays(now, 29)).getTime(), to: end };
  }
}

const shortDate = (d: Date) => format(d, "d MMM", { locale: uk });

export function periodLabel(key: PeriodKey, range: Range): string {
  if (key === "custom") {
    const from = new Date(range.from);
    const to = new Date(range.to);
    return from.getTime() === startOfDay(to).getTime()
      ? shortDate(from)
      : `${shortDate(from)} – ${shortDate(to)}`;
  }
  return PERIODS.find((p) => p.key === key)?.label ?? "Останні 30 днів";
}

export interface TrendPoint {
  date: number;
  total: number; // копійки
}

/** Крапки графіка: дні (або місяці для довгих періодів), прогалини — нулі. */
export function trendPoints(
  data: TrendStat[],
  range: Range,
): { points: TrendPoint[]; monthly: boolean } {
  if (!data.length) return { points: [], monthly: false };
  const monthly = data[0].date.length === 7;
  const byKey = new Map(data.map((d) => [d.date, d.total]));
  const first = parseISO(data[0].date);
  const last = parseISO(data[data.length - 1].date);
  // Початок — межа періоду (для «Всього часу» — перша операція), кінець — не пізніше сьогодні.
  const start = range.from >= new Date(2000, 0, 1).getTime() ? new Date(range.from) : first;
  const end = new Date(Math.max(Math.min(range.to, Date.now()), last.getTime()));

  try {
    const ticks = monthly
      ? eachMonthOfInterval({ start, end })
      : eachDayOfInterval({ start, end });
    return {
      monthly,
      points: ticks.map((tick) => ({
        date: tick.getTime(),
        total: byKey.get(format(tick, monthly ? "yyyy-MM" : "yyyy-MM-dd")) ?? 0,
      })),
    };
  } catch {
    return { points: [], monthly };
  }
}

export const pointLabel = (ms: number, monthly: boolean) =>
  format(new Date(ms), monthly ? "LLLL yyyy" : "d MMMM yyyy", { locale: uk });

export type StatTab = "category" | "counterparty" | "tag";

export const STAT_TABS: { value: StatTab; label: string }[] = [
  { value: "category", label: "Категорії" },
  { value: "counterparty", label: "Контрагенти" },
  { value: "tag", label: "Теги" },
];

export const stringToColor = (str: string) => {
  if (!str) return "#9ca3af";
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash % 360)}, 65%, 45%)`;
};

export interface StatRow {
  key: string;
  name: string;
  total: number;
  percent: number;
  color: string;
  iconName?: string;
  logo?: string | null;
}

/** Рядки списку з кольором, іконкою й часткою від загальної суми. */
export function buildRows(
  tab: StatTab,
  top: TopStat[],
  categories: Category[],
  counterparties: Counterparty[],
): { rows: StatRow[]; total: number } {
  const total = top.reduce((sum, item) => sum + item.total, 0);
  const rows = top
    .filter((item) => item.total > 0)
    .map((item, index): StatRow => {
      let name = item.name;
      let color = "";
      let iconName: string | undefined;
      let logo: string | null | undefined;

      if (tab === "category") {
        const found = categories.find((c) => (item.id ? c.id === item.id : c.name === item.name));
        if (found) {
          name = categoryLabel(categories, found.id) ?? found.name;
          color = found.color;
          iconName = found.icon;
        }
        color = color || (/^#/.test(item.metadata) ? item.metadata : "");
      } else if (tab === "counterparty") {
        const found = counterparties.find((c) => (item.id ? c.id === item.id : c.name === item.name));
        const parent = found?.category ?? categories.find((c) => c.id === found?.category_id);
        color = parent?.color || "";
        iconName = found?.icon || parent?.icon || item.metadata || undefined;
        logo = found?.logo;
      } else {
        color = /^#/.test(item.metadata) ? item.metadata : "";
        iconName = "HiHashtag";
      }

      return {
        key: item.id || `${item.name}-${index}`,
        name: name || "Без назви",
        total: item.total,
        percent: total > 0 ? (item.total / total) * 100 : 0,
        color: color || stringToColor(item.name),
        iconName,
        logo,
      };
    })
    .sort((a, b) => b.total - a.total);

  return { rows, total };
}

export const percentLabel = (percent: number) =>
  `${percent.toLocaleString("uk-UA", { maximumFractionDigits: 1, minimumFractionDigits: percent < 10 ? 1 : 0 })}%`;

export interface DonutSlice {
  color: string;
  percent: number;
}

/** Для кільця: найбільші частки окремо, решта — одним сірим сектором. */
export function donutSlices(rows: StatRow[], max = 6): DonutSlice[] {
  const head = rows.slice(0, max).map((r) => ({ color: r.color, percent: r.percent }));
  const rest = rows.slice(max).reduce((sum, r) => sum + r.percent, 0);
  return rest > 0.05 ? [...head, { color: "#c7c7cc", percent: rest }] : head;
}
