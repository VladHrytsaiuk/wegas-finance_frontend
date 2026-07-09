import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  format,
  endOfDay,
  startOfDay,
  subDays,
  endOfMonth,
  startOfMonth,
  subMonths,
  startOfYear,
} from "date-fns";
import { uk, enUS } from "date-fns/locale";
import { type DateRange } from "react-day-picker";
import { useQuery } from "@tanstack/react-query";

import { getAccountsApi } from "../../services/apiAccounts";
import { type StatsFilter } from "../../services/apiStats";
import { getUsersApi } from "../../services/apiUsers";
import { useDropdownPosition } from "../useDropdownPosition";

interface UseWidgetControlsProps {
  onFilterChange: (filter: Partial<StatsFilter>) => void;
  currentLabel?: string;
  currentAccountIds?: string[];
  currentFrom?: number;
  currentTo?: number;
  hidePeriod?: boolean;
  restrictedAccountIds?: string[];
}

export const useWidgetControls = ({
  onFilterChange,
  currentLabel,
  currentAccountIds = [],
  currentFrom,
  currentTo,
  hidePeriod = false,
  restrictedAccountIds = [],
}: UseWidgetControlsProps) => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [tempRange, setTempRange] = useState<DateRange | undefined>();
  const [searchTerm, setSearchTerm] = useState("");

  const dropdownWidth = hidePeriod ? 280 : 520;
  const dateLocale = i18n.language === "uk" ? uk : enUS;

  const finalCurrentLabel = currentLabel || t("legacy:filters.period_label");

  // Dropdown positioning
  const { triggerRef, menuRef, style } = useDropdownPosition(
    isOpen,
    () => setIsOpen(false),
    "right",
    dropdownWidth,
  );

  // Queries
  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccountsApi,
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: getUsersApi,
  });

  // Helpers
  const isActivePeriod = (labelToCheck: string) =>
    finalCurrentLabel === labelToCheck;

  const getButtonText = () => {
    const isMyAccounts =
      restrictedAccountIds.length > 0 &&
      currentAccountIds.length === restrictedAccountIds.length &&
      restrictedAccountIds.every((id) => currentAccountIds.includes(id));

    const accountsText =
      currentAccountIds.length === 0
        ? t("legacy:filters.all_accounts")
        : isMyAccounts
        ? t("accounts:accountForm.owner_me", "Мої рахунки")
        : t("legacy:filters.accounts_selected", {
            count: currentAccountIds.length,
          });

    if (hidePeriod) return accountsText;
    return `${finalCurrentLabel} • ${accountsText}`;
  };

  // Handlers
  const handlePeriod = (type: string, label: string) => {
    const now = new Date();
    let from = now.getTime();
    let to = endOfDay(now).getTime();

    switch (type) {
      case "today":
        from = startOfDay(now).getTime();
        break;
      case "yesterday":
        {
        const yest = subDays(now, 1);
        from = startOfDay(yest).getTime();
        to = endOfDay(yest).getTime();
        break;
        }
      case "7_days":
        from = subDays(now, 6).getTime();
        break;
      case "this_month":
        from = startOfMonth(now).getTime();
        to = endOfMonth(now).getTime();
        break;
      case "last_month":
        {
        const lastMonth = subMonths(now, 1);
        from = startOfMonth(lastMonth).getTime();
        to = endOfMonth(lastMonth).getTime();
        label = t("legacy:filters.periods.last_month");
        break;
        }
      case "last_30_days":
        from = subDays(now, 30).getTime();
        to = now.getTime();
        label = t("legacy:filters.periods.last_30_days");
        break;
      case "this_year":
        from = startOfYear(now).getTime();
        break;
      case "all_time":
        from = 0;
        break;
      case "custom":
        setIsOpen(false);
        setTempRange(
          currentFrom && currentTo
            ? { from: new Date(currentFrom), to: new Date(currentTo) }
            : undefined,
        );
        setIsCalendarOpen(true);
        return;
    }
    onFilterChange({ from, to, label });
  };

  const handleApplyCalendar = () => {
    if (tempRange?.from) {
      const from = startOfDay(tempRange.from).getTime();
      const toDate = tempRange.to || tempRange.from;
      const to = endOfDay(toDate).getTime();
      const label = `${format(tempRange.from, "d MMM", {
        locale: dateLocale,
      })} - ${format(toDate, "d MMM", { locale: dateLocale })}`;
      onFilterChange({ from, to, label });
    }
    setIsCalendarOpen(false);
  };

  const handleReset = () => {
    const updates: Partial<StatsFilter> = { accountIds: [] };
    if (!hidePeriod) {
      const now = new Date();
      updates.from = startOfDay(subDays(now, 30)).getTime();
      updates.to = endOfDay(now).getTime();
      updates.label = t("legacy:filters.periods.last_30_days");
    }
    onFilterChange(updates);
    setSearchTerm("");
    setIsOpen(false);
  };

  return {
    state: {
      isOpen,
      isCalendarOpen,
      tempRange,
      searchTerm,
      accounts,
      users,
      dropdownWidth,
      dateLocale,
      style,
    },
    refs: {
      triggerRef,
      menuRef,
    },
    handlers: {
      setIsOpen,
      setIsCalendarOpen,
      setTempRange,
      setSearchTerm,
      handlePeriod,
      handleApplyCalendar,
      handleReset,
      getButtonText,
      isActivePeriod,
    },
    t,
  };
};
