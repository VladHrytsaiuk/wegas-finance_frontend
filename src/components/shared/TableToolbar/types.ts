import React from "react";

export interface FilterOption {
  value: string;
  label: string;
  icon?: string | React.ReactNode;
  logo?: string;
  color?: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: "toggle" | "multi-select" | "range" | "select";

  // Налаштування для дерев
  treeType?: "categories" | "counterparties" | "accounts";
  rawData?: unknown[]; // Основні дані (категорії або контрагенти)
  relatedData?: unknown[]; // ✅ НОВЕ ПОЛЕ: Додаткові дані (наприклад, категорії для контрагентів)

  options?: FilterOption[]; // Для звичайних списків
}
