import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  startOfDay,
  subDays,
  startOfMonth,
  subMonths,
  startOfYear,
  endOfDay,
  endOfMonth,
} from "date-fns";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/Axios"; // Або імпорт вашого apiAccounts
import { useDropdownPosition } from "../useDropdownPosition";

export interface FilterState {
  from: number;
  to: number;
  label: string;
  accountIds: string[];
}

interface UseFilterMenuProps {
  onFilterChange: (filters: FilterState) => void;
}

export const useFilterMenu = ({ onFilterChange }: UseFilterMenuProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  // 1. Data Fetching
  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => (await api.get<any[]>("/accounts")).data,
    staleTime: 5 * 60 * 1000,
  });

  // 2. State Snapshot (Applied vs Temporary)
  const appliedRef = useRef<FilterState>({
    from: subDays(new Date(), 30).getTime(),
    to: endOfDay(new Date()).getTime(),
    label: t("export_import:importModal.period_30days", "Останні 30 днів"), // Дефолтний лейбл
    accountIds: [],
  });

  const [currentRange, setCurrentRange] = useState(appliedRef.current);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);

  // 3. Handlers
  const handleCancel = () => {
    // Revert to snapshot
    setCurrentRange(appliedRef.current);
    setSelectedAccounts(appliedRef.current.accountIds);
    setIsOpen(false);
  };

  const { triggerRef, menuRef, style } = useDropdownPosition(
    isOpen,
    handleCancel, // Close on outside click acts as cancel
    "right",
    300,
  );

  const openMenu = () => {
    // Sync temp state with snapshot when opening
    setCurrentRange(appliedRef.current);
    setSelectedAccounts(appliedRef.current.accountIds);
    setIsOpen(true);
  };

  const handleApply = () => {
    const next: FilterState = {
      from: currentRange.from,
      to: currentRange.to,
      label: currentRange.label,
      accountIds: selectedAccounts,
    };

    appliedRef.current = next;
    onFilterChange(next);
    setIsOpen(false);
  };

  // 4. Period Logic
  const setPeriod = (type: string) => {
    const now = new Date();
    let from, to, label;

    switch (type) {
      case "7days":
        from = startOfDay(subDays(now, 7));
        to = endOfDay(now);
        label = t("export_import:importModal.period_7days", "Останні 7 днів");
        break;
      case "30days":
        from = startOfDay(subDays(now, 30));
        to = endOfDay(now);
        label = t("export_import:importModal.period_30days", "Останні 30 днів");
        break;
      case "thisMonth":
        from = startOfMonth(now);
        to = endOfDay(now);
        label = t("dashboard:dashboardPage.filter_period_month", "Цей місяць");
        break;
      case "lastMonth":
        const last = subMonths(now, 1);
        from = startOfMonth(last);
        to = endOfMonth(last);
        label = t("export_import:importModal.period_last_month", "Минулий місяць");
        break;
      case "year":
        from = startOfYear(now);
        to = endOfDay(now);
        label = t("export_import:importModal.period_year", "Цей рік");
        break;
      default:
        return;
    }

    setCurrentRange({ from: from.getTime(), to: to.getTime(), label });
  };

  const toggleAccount = (id: string) => {
    setSelectedAccounts((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  };

  return {
    state: {
      isOpen,
      currentRange,
      selectedAccounts,
      accounts,
      style,
    },
    refs: {
      triggerRef,
      menuRef,
    },
    handlers: {
      openMenu,
      handleApply,
      setPeriod,
      toggleAccount,
      setSelectedAccounts,
    },
    t,
  };
};
