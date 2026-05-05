export interface FilterOption {
  value: string;
  label: string;
  icon?: string;
  logo?: string;
  color?: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: "toggle" | "multi-select" | "range" | "select";

  // Налаштування для дерев
  treeType?: "categories" | "counterparties";
  rawData?: any[]; // Основні дані (категорії або контрагенти)
  relatedData?: any[]; // ✅ НОВЕ ПОЛЕ: Додаткові дані (наприклад, категорії для контрагентів)

  options?: FilterOption[]; // Для звичайних списків
}
