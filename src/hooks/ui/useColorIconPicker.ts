import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import * as Icons from "react-icons/hi2";

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

interface UseColorIconPickerProps {
  icon: string;
}

export const useColorIconPicker = ({ icon }: UseColorIconPickerProps) => {
  const { t } = useTranslation();

  const [isColorOpen, setIsColorOpen] = useState(false);
  const [isIconOpen, setIsIconOpen] = useState(false);

  const colorRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  // Динамічний вибір компонента іконки
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SelectedIconComponent = (Icons as any)[icon] || (Icons as any)["HiTag"];

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
    t,
  };
};
