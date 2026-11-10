import type { IconType } from "react-icons";
import {
  HiOutlineComputerDesktop,
  HiOutlineCube,
  HiOutlineHome,
  HiOutlineTruck,
} from "react-icons/hi2";
import { MdOutlineChair } from "react-icons/md";
import { format } from "date-fns";

import type { Asset } from "../../../types";

// Логіка активів без розмітки: типи, пошук, сортування, гарантія, дати.

export const ASSET_TYPES: { value: string; label: string; Icon: IconType }[] = [
  { value: "electronics", label: "Електроніка", Icon: HiOutlineComputerDesktop },
  { value: "furniture", label: "Меблі", Icon: MdOutlineChair },
  { value: "real_estate", label: "Нерухомість", Icon: HiOutlineHome },
  { value: "car", label: "Транспорт", Icon: HiOutlineTruck },
  { value: "other", label: "Інше", Icon: HiOutlineCube },
];

export const assetType = (type?: string) =>
  ASSET_TYPES.find((t) => t.value === type) ?? {
    value: type ?? "other",
    label: type || "Інше",
    Icon: HiOutlineCube,
  };

export const isCar = (type?: string) => type === "car";
export const isRealEstate = (type?: string) =>
  ["real_estate", "apartment", "house"].includes(type ?? "");
/** Серійний номер і гарантія мають сенс лише для речей. */
export const isThing = (type?: string) => !isCar(type) && !isRealEstate(type);

export type AssetSort =
  | "purchase_date-desc"
  | "purchase_date-asc"
  | "price-desc"
  | "price-asc"
  | "name-asc";

export const ASSET_SORTS: { value: AssetSort; label: string }[] = [
  { value: "purchase_date-desc", label: "Нові покупки" },
  { value: "purchase_date-asc", label: "Старі покупки" },
  { value: "price-desc", label: "Найдорожчі" },
  { value: "price-asc", label: "Найдешевші" },
  { value: "name-asc", label: "Назва (А–Я)" },
];

export function filterAssets(assets: Asset[], query: string, sort: AssetSort): Asset[] {
  const q = query.trim().toLowerCase();
  return assets
    .filter((a) => !q || a.name.toLowerCase().includes(q))
    .sort((a, b) => {
      switch (sort) {
        case "name-asc":
          return a.name.localeCompare(b.name, "uk");
        case "price-desc":
          return (b.price || 0) - (a.price || 0);
        case "price-asc":
          return (a.price || 0) - (b.price || 0);
        case "purchase_date-asc":
          return (a.purchase_date || 0) - (b.purchase_date || 0);
        default:
          return (b.purchase_date || 0) - (a.purchase_date || 0);
      }
    });
}

export interface Warranty {
  percent: number;
  expired: boolean;
  daysLeft: number;
  expiring: boolean;
}

/** Прогрес гарантії від дати покупки до кінця (як calculateWarranty старої сторінки). */
export function warranty(start: number, end: number | undefined, now: number): Warranty | null {
  if (!end || !start) return null;
  const total = end - start;
  const percent = total > 0 ? Math.max(0, Math.min(100, ((now - start) / total) * 100)) : 0;
  const expired = now > end;
  return {
    percent,
    expired,
    daysLeft: Math.max(0, Math.ceil((end - now) / 86_400_000)),
    expiring: !expired && percent > 85,
  };
}

export const dateLabel = (ms?: number | null) =>
  ms ? format(new Date(ms), "dd.MM.yyyy") : "—";

/** Дата для поля type=date: за місцевим часом, без зсуву на добу. */
export const toDateInput = (ms?: number | null) =>
  ms ? format(new Date(ms), "yyyy-MM-dd") : "";

/** Із поля type=date у мілісекунди (полудень — щоб часовий пояс не зсував день). */
export const fromDateInput = (value: string) =>
  value ? new Date(`${value}T12:00:00`).getTime() : 0;

export const assetPhotos = (asset: Asset): { id?: string; path: string }[] => {
  const list: { id?: string; path: string }[] = [...(asset.photos ?? [])];
  if (asset.photo && !list.some((p) => p.path === asset.photo)) {
    list.unshift({ path: asset.photo });
  }
  return list;
};
