import { useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { groupTransactionsByDate } from "../../utils/helpers";

interface UseTransactionsTableProps {
  transactions: any[];
  sortValue: string;
  language: string;
}

export const useTransactionsTable = ({
  transactions,
  sortValue,
  language,
}: UseTransactionsTableProps) => {
  const { t } = useTranslation();

  // Завжди групуємо по датах
  const shouldGroup = true;

  const dataToRender = useMemo(() => {
    // 🔥 Передаємо sortValue третім параметром!
    return groupTransactionsByDate(transactions, language, sortValue);
  }, [transactions, language, sortValue]);

  const translateDateLabel = useCallback(
    (label: string) => {
      const upperLabel = label.toUpperCase();

      if (upperLabel === "ВЧОРА" || upperLabel === "YESTERDAY")
        return t("legacy:filters.periods.yesterday");
      if (upperLabel === "СЬОГОДНІ" || upperLabel === "TODAY")
        return t("legacy:filters.periods.today");

      if (language === "en") {
        return label
          .replace(/СІЧНЯ/gi, "January")
          .replace(/ЛЮТОГО/gi, "February")
          .replace(/БЕРЕЗНЯ/gi, "March")
          .replace(/КВІТНЯ/gi, "April")
          .replace(/ТРАВНЯ/gi, "May")
          .replace(/ЧЕРВНЯ/gi, "June")
          .replace(/ЛИПНЯ/gi, "July")
          .replace(/СЕРПНЯ/gi, "August")
          .replace(/ВЕРЕСНЯ/gi, "September")
          .replace(/ЖОВТНЯ/gi, "October")
          .replace(/ЛИСТОПАДА/gi, "November")
          .replace(/ГРУДНЯ/gi, "December");
      }

      return label;
    },
    [language, t],
  );

  return {
    dataToRender,
    shouldGroup,
    translateDateLabel,
    isEmpty: transactions.length === 0,
  };
};
