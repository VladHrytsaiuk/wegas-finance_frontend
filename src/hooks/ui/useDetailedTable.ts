import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export interface DataItem {
  id?: string;
  name: string;
  total: number;
  color?: string;
  icon?: string;
  logo?: string;
  [key: string]: any;
}

interface UseDetailedTableProps {
  data: DataItem[];
  totalSum: number;
  type?: "category" | "counterparty" | "tag";
}

// Helper function
const normalizeIconName = (name?: string) => {
  if (!name) return undefined;
  if (name.startsWith("Hi")) return name;
  return `Hi${name.charAt(0).toUpperCase() + name.slice(1)}`;
};

export const useDetailedTable = ({
  data,
  totalSum,
  type = "category",
}: UseDetailedTableProps) => {
  const { t } = useTranslation();

  const processedData = useMemo(() => {
    if (!data) return [];

    // 1. Sort
    const sorted = [...data].sort((a, b) => b.total - a.total);

    // 2. Enrich with display properties
    return sorted.map((item) => {
      const percent = totalSum > 0 ? (item.total / totalSum) * 100 : 0;
      const baseColor = item.color || "#9ca3af";

      // Icon Logic
      let displayIcon = normalizeIconName(item.icon);
      if (!displayIcon) {
        if (type === "tag") displayIcon = "HiHashtag";
        else if (type === "counterparty") displayIcon = "HiBuildingStorefront";
        else displayIcon = "HiTag";
      }

      // Color Logic
      const finalColor =
        type === "tag" && !item.color ? "var(--color-brand-500)" : baseColor;

      return {
        ...item,
        percent,
        displayIcon,
        finalColor,
      };
    });
  }, [data, totalSum, type]);

  return {
    rows: processedData,
    t,
  };
};
