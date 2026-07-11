import { useState, useRef, useEffect } from "react";
import type { IconType } from "react-icons";
import {
  HiAcademicCap,
  HiBanknotes,
  HiBolt,
  HiBriefcase,
  HiBuildingStorefront,
  HiCloud,
  HiComputerDesktop,
  HiFire,
  HiGift,
  HiGlobeAlt,
  HiHeart,
  HiHome,
  HiLightBulb,
  HiMapPin,
  HiMoon,
  HiPhone,
  HiShoppingBag,
  HiShoppingCart,
  HiStar,
  HiSun,
  HiTag,
  HiTicket,
  HiTruck,
  HiUser,
  HiUsers,
  HiWifi,
  HiWrench,
} from "react-icons/hi2";

// Constants
export const PRESET_ICONS = [
  "HiShoppingBag",
  "HiShoppingCart",
  "HiBuildingStorefront",
  "HiTag",
  "HiCreditCard",
  "HiBanknotes",
  "HiUser",
  "HiUsers",
  "HiHome",
  "HiTruck",
  "HiWrench",
  "HiLightBulb",
  "HiWifi",
  "HiFire",
  "HiHeart",
  "HiAcademicCap",
  "HiBriefcase",
  "HiGlobeAlt",
  "HiGift",
  "HiTicket",
  "HiMapPin",
  "HiPhone",
  "HiComputerDesktop",
  "HiStar",
  "HiSun",
  "HiMoon",
  "HiCloud",
  "HiBolt",
];

export const PRESET_COLORS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
  "#64748b",
  "#6b7280",
  "#71717a",
  "#000000",
];

const PRESET_ICON_MAP: Record<string, IconType> = {
  HiShoppingBag,
  HiShoppingCart,
  HiBuildingStorefront,
  HiTag,
  HiBanknotes,
  HiUser,
  HiUsers,
  HiHome,
  HiTruck,
  HiWrench,
  HiLightBulb,
  HiWifi,
  HiFire,
  HiHeart,
  HiAcademicCap,
  HiBriefcase,
  HiGlobeAlt,
  HiGift,
  HiTicket,
  HiMapPin,
  HiPhone,
  HiComputerDesktop,
  HiStar,
  HiSun,
  HiMoon,
  HiCloud,
  HiBolt,
};

interface UseColorIconPickerProps {
  icon: string;
}

export const useColorIconPicker = ({ icon }: UseColorIconPickerProps) => {
  const [isColorOpen, setIsColorOpen] = useState(false);
  const [isIconOpen, setIsIconOpen] = useState(false);

  const colorRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  const SelectedIconComponent = PRESET_ICON_MAP[icon] || HiTag;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        colorRef.current &&
        !colorRef.current.contains(event.target as Node)
      ) {
        setIsColorOpen(false);
      }
      if (iconRef.current && !iconRef.current.contains(event.target as Node)) {
        setIsIconOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleColor = () => {
    setIsColorOpen(!isColorOpen);
    setIsIconOpen(false);
  };

  const toggleIcon = () => {
    setIsIconOpen(!isIconOpen);
    setIsColorOpen(false);
  };

  return {
    state: {
      isColorOpen,
      isIconOpen,
      SelectedIconComponent,
      presetIcons: PRESET_ICONS,
      presetColors: PRESET_COLORS,
      presetIconMap: PRESET_ICON_MAP,
    },
    refs: {
      colorRef,
      iconRef,
    },
    actions: {
      setIsColorOpen,
      setIsIconOpen,
      toggleColor,
      toggleIcon,
    },
  };
};
