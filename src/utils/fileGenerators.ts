import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { fontBase64 } from "./fonts/roboto";

// Мапер тепер приймає функцію перекладу 't'
const mapTransactionToRow = (tx: any, t: any) => {
  return {
    date: format(new Date(tx.date), "dd.MM.yyyy"),
    type: t(`exportMapping.type_${tx.type}`),
    category: tx.category?.name || t("exportMapping.no_category"),
    amount: (tx.amount / 100).toFixed(2),
    currency: tx.account?.currency || "UAH",
    account: tx.account?.name || "-",
    counterparty: tx.counterparty?.name || "-",
    note: tx.note || "",
  };
};

export const generateXLSX = async (data: any[], fileName: string, t: any) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(t("exportPage.title"));

  worksheet.columns = [
    { header: t("exportMapping.table_date"), key: "date", width: 12 },
    { header: t("exportMapping.table_type"), key: "type", width: 10 },
    { header: t("exportMapping.table_category"), key: "category", width: 20 },
    { header: t("exportMapping.table_amount"), key: "amount", width: 12 },
    { header: t("exportMapping.table_currency"), key: "currency", width: 8 },
    { header: t("exportMapping.table_account"), key: "account", width: 15 },
    {
      header: t("exportMapping.table_counterparty"),
      key: "counterparty",
      width: 20,
    },
    { header: t("exportMapping.table_note"), key: "note", width: 25 },
  ];

  data.forEach((item) => worksheet.addRow(mapTransactionToRow(item, t)));

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `${fileName}.xlsx`);
};

export const generateCSV = (data: any[], fileName: string, t: any) => {
  const mapped = data.map((item) => mapTransactionToRow(item, t));
  if (mapped.length === 0) return;

  const headers = [
    t("exportMapping.table_date"),
    t("exportMapping.table_type"),
    t("exportMapping.table_category"),
    t("exportMapping.table_amount"),
    t("exportMapping.table_currency"),
    t("exportMapping.table_account"),
    t("exportMapping.table_counterparty"),
    t("exportMapping.table_note"),
  ];

  const csvContent = [
    headers.join(","),
    ...mapped.map((row) =>
      Object.values(row)
        .map((v) => `"${v}"`)
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, `${fileName}.csv`);
};

export const generatePDF = (data: any[], fileName: string, t: any) => {
  const doc = new jsPDF();
  const fontName = "Roboto-Regular.ttf";

  doc.addFileToVFS(fontName, fontBase64);
  doc.addFont(fontName, "Roboto", "normal");
  doc.setFont("Roboto");

  doc.setFontSize(18);
  doc.text(t("exportPage.report_header"), 14, 22);

  doc.setFontSize(10);
  doc.text(
    t("exportPage.report_created_at", {
      date: format(new Date(), "dd.MM.yyyy"),
    }),
    14,
    30
  );

  const tableData = data.map((item) => {
    const row = mapTransactionToRow(item, t);
    return [
      row.date,
      row.category,
      `${row.amount} ${row.currency}`,
      row.account,
      row.counterparty,
      row.note,
    ];
  });

  autoTable(doc, {
    head: [
      [
        t("exportMapping.table_date"),
        t("exportMapping.table_category"),
        t("exportMapping.table_amount"),
        t("exportMapping.table_account"),
        t("exportMapping.table_counterparty"),
        t("exportMapping.table_note"),
      ],
    ],
    body: tableData,
    startY: 40,
    theme: "grid",
    styles: { font: "Roboto", fontSize: 9 },
    headStyles: { fillColor: [79, 70, 229] },
  });

  doc.save(`${fileName}.pdf`);
};
