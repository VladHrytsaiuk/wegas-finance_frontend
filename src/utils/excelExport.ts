import type { TFunction } from "i18next";

export interface ExportSheet<T extends Record<string, unknown> = Record<string, unknown>> {
  name: string;
  data: T[];
}

export const exportToExcel = async (
  sheets: ExportSheet[],
  fileName: string,
  periodLabel: string,
  t: TFunction,
) => {
  if (sheets.length === 0) return;

  const [{ default: ExcelJS }, { saveAs }] = await Promise.all([
    import("exceljs"),
    import("file-saver"),
  ]);
  const workbook = new ExcelJS.Workbook();

  sheets.forEach((sheetData) => {
    if (sheetData.data.length === 0) return;

    const worksheet = workbook.addWorksheet(sheetData.name);

    // --- 1. ШАПКА ЗВІТУ ---
    // Використовуємо ключі "exportPage.report_title_prefix" та "exportPage.period_label"
    const titleRow = worksheet.addRow([
      `${t("export_import:exportPage.report_title_prefix")}: ${sheetData.name}`,
    ]);
    titleRow.font = { bold: true, size: 14, color: { argb: "111827" } };

    const periodRow = worksheet.addRow([
      `${t("export_import:exportPage.period_label")}: ${periodLabel}`,
    ]);
    periodRow.font = { italic: true, size: 11, color: { argb: "6B7280" } };

    worksheet.addRow([]); // Пустий рядок

    // --- 2. ЗАГОЛОВКИ ТАБЛИЦІ ---
    const keys = Object.keys(sheetData.data[0]);
    const headerRow = worksheet.addRow(keys);

    headerRow.font = { bold: true, color: { argb: "FFFFFF" } };
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "4F46E5" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // --- 3. ДАНІ ---
    sheetData.data.forEach((item) => {
      const row = worksheet.addRow(Object.values(item));
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };
        if (typeof cell.value === "number" && cell.value % 1 !== 0) {
          cell.numFmt = "#,##0.00";
        }
      });
    });

    // --- 4. АВТО-ШИРИНА КОЛОНОК ---
    worksheet.columns = keys.map(() => ({ width: 15 }));
    keys.forEach((key, colIndex) => {
      let maxLength = key.length;
      sheetData.data.forEach((row) => {
        const val = String(row[key] || "");
        if (val.length > maxLength) maxLength = val.length;
      });
      const finalWidth =
        maxLength < 10 ? 12 : maxLength > 50 ? 50 : maxLength + 2;
      worksheet.getColumn(colIndex + 1).width = finalWidth;
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, `${fileName}.xlsx`);
};

export const exportToCSV = <T extends Record<string, unknown>>(
  data: T[],
  fileName: string,
) => {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((fieldName) => JSON.stringify(row[fieldName as keyof typeof row]))
        .join(",")
    ),
  ].join("\n");

  // Додаємо BOM для коректного відображення кирилиці в Excel при відкритті CSV
  const blob = new Blob(["\ufeff", csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  void import("file-saver").then(({ saveAs }) => {
    saveAs(blob, `${fileName}.csv`);
  });
};
