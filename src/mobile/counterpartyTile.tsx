import {
  HiOutlineBuildingOffice2,
  HiOutlineBuildingStorefront,
  HiOutlineUser,
} from "react-icons/hi2";

import type { Counterparty, CounterpartyCategory } from "../types";
import { ICON_MAP } from "../utils/IconConstants";
import { normalizeIconName } from "../utils/iconName";
import { Tile } from "./ui/Tile";

// Плитка контрагента: логотип або власна іконка, інакше іконка його категорії,
// інакше — за типом (магазин, людина, інше). Невідома назва іконки дала б «?».

const knownIcon = (name?: string | null) => {
  const key = normalizeIconName(name);
  return key && key in ICON_MAP ? key : undefined;
};

const fallbackIcon = (type: string | undefined, size: number) => {
  const px = Math.round(size * 0.57);
  if (type === "shop") return <HiOutlineBuildingStorefront size={px} />;
  if (type === "person") return <HiOutlineUser size={px} />;
  return <HiOutlineBuildingOffice2 size={px} />;
};

interface CounterpartyTileProps {
  cp: Pick<Counterparty, "logo" | "icon" | "type">;
  category?: Pick<CounterpartyCategory, "icon" | "color">;
  size?: number;
}

export function CounterpartyTile({
  cp,
  category,
  size = 30,
}: CounterpartyTileProps) {
  const icon = knownIcon(cp.icon);
  if (cp.logo || icon) {
    return (
      <Tile
        logo={cp.logo}
        iconName={icon}
        color={category?.color}
        size={size}
      />
    );
  }
  const categoryIcon = knownIcon(category?.icon);
  if (categoryIcon) {
    return <Tile iconName={categoryIcon} color={category?.color} size={size} />;
  }
  return <Tile icon={fallbackIcon(cp.type, size)} size={size} />;
}
