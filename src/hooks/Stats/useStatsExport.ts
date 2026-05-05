import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next"; // ✅ Додано
import { statsService } from "../../services/apiStats";
import { exportToExcel, type ExportSheet } from "../../utils/excelExport";

interface ExportOptions {
  summary: boolean;
  topTransactions: boolean;
  categories: boolean;
  counterparties: boolean;
  tags: boolean;
}

interface FilterParams {
  from: number;
  to: number;
  accountIds: string[];
}

export const useStatsExport = () => {
  const [loading, setLoading] = useState(false);
  const { t, i18n } = useTranslation(); // ✅ Додано

  const generateReport = async (
    filters: FilterParams,
    options: ExportOptions,
    periodLabel: string
  ) => {
    if (!Object.values(options).some(Boolean)) {
      toast.error(t("export_import:statsExport.toast_select_block"));
      return;
    }

    setLoading(true);
    const toastId = toast.loading(t("export_import:statsExport.toast_collecting"));

    try {
      const apiFilter = {
        from: Math.floor(filters.from / 1000),
        to: Math.floor(filters.to / 1000),
        currency: "UAH",
        accountIds: filters.accountIds || [],
      };

      const sheets: ExportSheet[] = [];
      const safeNum = (v: any) => (isNaN(Number(v)) ? 0 : Number(v));
      const locale = i18n.language === "uk" ? "uk-UA" : "en-US";

      // 1. DASHBOARD
      if (options.summary) {
        const dashboard = await statsService.getDashboard(apiFilter);
        if (dashboard) {
          const inc =
            safeNum(dashboard.total_income || dashboard.monthly_income) / 100;
          const exp =
            safeNum(dashboard.total_expense || dashboard.monthly_expense) / 100;
          const bal = safeNum(dashboard.total_balance) / 100 || inc - exp;

          sheets.push({
            name: t("export_import:statsExport.sheet_summary"),
            data: [
              {
                [t("export_import:statsExport.col_indicator")]: t("export_import:statsExport.col_income"),
                [t("export_import:statsExport.col_value")]: inc,
                [t("export_import:statsExport.col_currency")]: "UAH",
              },
              {
                [t("export_import:statsExport.col_indicator")]: t("export_import:statsExport.col_expense"),
                [t("export_import:statsExport.col_value")]: exp,
                [t("export_import:statsExport.col_currency")]: "UAH",
              },
              {
                [t("export_import:statsExport.col_indicator")]: t("export_import:statsExport.col_balance"),
                [t("export_import:statsExport.col_value")]: bal,
                [t("export_import:statsExport.col_currency")]: "UAH",
              },
              {
                [t("export_import:statsExport.col_indicator")]: t("export_import:statsExport.col_savings"),
                [t("export_import:statsExport.col_value")]:
                  inc > 0 ? ((bal / inc) * 100).toFixed(1) + "%" : "0%",
                [t("export_import:statsExport.col_currency")]: "-",
              },
            ],
          });
        }
      }

      // 2. TOP TRANSACTIONS
      if (options.topTransactions) {
        const recent = await statsService.getRecent(filters.accountIds);
        const top = (recent || [])
          .filter((t: any) => t.type === "expense")
          .sort((a: any, b: any) => safeNum(b.amount) - safeNum(a.amount))
          .slice(0, 15)
          .map((tx: any) => ({
            [t("export_import:statsExport.col_date")]: new Date(tx.date).toLocaleDateString(
              locale
            ),
            [t("export_import:statsExport.col_amount")]: safeNum(tx.amount) / 100,
            [t("export_import:statsExport.col_category")]:
              tx.category?.name || t("export_import:exportMapping.no_category"),
            [t("export_import:statsExport.col_shop")]: tx.counterparty?.name || "-",
            [t("export_import:statsExport.col_comment")]: tx.comment || "",
          }));

        if (top.length)
          sheets.push({ name: t("export_import:statsExport.sheet_top_expenses"), data: top });
      }

      // 3. CATEGORIES
      if (options.categories) {
        const data = await statsService.getTopStats(
          "expense",
          "category",
          apiFilter
        );
        const mapped = (data || []).map((i: any) => ({
          [t("export_import:statsExport.col_category")]: i.name,
          [t("export_import:statsExport.col_amount")]: safeNum(i.total) / 100,
          "%": i.percent ? `${i.percent}%` : "-",
        }));
        if (mapped.length)
          sheets.push({
            name: t("export_import:statsExport.sheet_categories"),
            data: mapped,
          });
      }

      // 4. COUNTERPARTIES
      if (options.counterparties) {
        const data = await statsService.getTopStats(
          "expense",
          "counterparty",
          apiFilter
        );
        const mapped = (data || []).map((i: any) => ({
          [t("export_import:statsExport.col_shop")]: i.name,
          [t("export_import:statsExport.col_amount")]: safeNum(i.total) / 100,
        }));
        if (mapped.length)
          sheets.push({ name: t("export_import:statsExport.sheet_shops"), data: mapped });
      }

      // 5. TAGS
      if (options.tags) {
        const data = await statsService.getTopStats(
          "expense",
          "tag",
          apiFilter
        );
        const mapped = (data || []).map((i: any) => ({
          [t("export_import:statsExport.col_tag")]: i.name,
          [t("export_import:statsExport.col_amount")]: safeNum(i.total) / 100,
        }));
        if (mapped.length)
          sheets.push({ name: t("export_import:statsExport.sheet_tags"), data: mapped });
      }

      if (!sheets.length || sheets.every((s) => s.data.length === 0)) {
        toast.error(t("export_import:statsExport.toast_no_data"), { id: toastId });
        return;
      }

      const fileName = `Finance_Stats_${new Date().toISOString().slice(0, 10)}`;
      await exportToExcel(sheets, fileName, periodLabel, t);

      toast.success(t("export_import:statsExport.toast_success"), { id: toastId });
    } catch (error: any) {
      toast.error(`${t("export_import:statsExport.toast_error")}: ${error.message}`, {
        id: toastId,
      });
    } finally {
      setLoading(false);
    }
  };

  return { generateReport, loading };
};
