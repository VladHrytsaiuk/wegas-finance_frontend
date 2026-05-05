import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { startOfMonth, endOfMonth, startOfYear, subMonths } from "date-fns";
import { DateRange } from "../../components/stats/widgets/WidgetMenu"; // Або винести тип в types.ts

interface UseWidgetMenuProps {
  onRangeChange: (range: DateRange) => void;
}

export const useWidgetMenu = ({ onRangeChange }: UseWidgetMenuProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Click Outside Logic
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Selection Logic
  const handleSelect = (type: "thisMonth" | "lastMonth" | "year") => {
    const now = new Date();
    let from, to, label;

    switch (type) {
      case "lastMonth":
        const last = subMonths(now, 1);
        from = startOfMonth(last).getTime();
        to = endOfMonth(last).getTime();
        label = t("filters.periods.last_month");
        break;
      case "year":
        from = startOfYear(now).getTime();
        to = endOfMonth(now).getTime();
        label = t("filters.periods.this_year");
        break;
      case "thisMonth":
      default:
        from = startOfMonth(now).getTime();
        to = endOfMonth(now).getTime();
        label = t("filters.periods.this_month");
        break;
    }

    onRangeChange({ from, to, label });
    setIsOpen(false);
  };

  return {
    isOpen,
    setIsOpen,
    menuRef,
    handleSelect,
    t,
  };
};
