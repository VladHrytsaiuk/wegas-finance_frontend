import { useMemo } from "react";

// Components
import { BaseSelect } from "../ui/Select/BaseSelect";
import { CategoryTree } from "./CategoryTree";
import { CategoryIcon } from "../../utils/IconMap";

// Logic & Styles
import {
  useCategorySelect,
  type Category,
} from "../../hooks/Categories/useCategorySelect";
import * as S from "./CategorySelect.styles";

interface CategorySelectProps {
  categories: Category[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  hasError?: boolean;
  dropdownWidth?: string;
  size?: "small" | "medium";
}

// --- HELPER FUNCTION ---
// Рекурсивно збирає всі ID з відфільтрованого дерева
const getAllRecursiveIds = (nodes: Category[]): string[] => {
  return nodes.reduce((acc, node) => {
    acc.push(node.id);
    if (node.children && node.children.length > 0) {
      acc.push(...getAllRecursiveIds(node.children));
    }
    return acc;
  }, [] as string[]);
};

export function CategorySelect(props: CategorySelectProps) {
  const {
    searchQuery,
    setSearchQuery,
    treeData,
    selectedCategory,
    finalPlaceholder,
    handleSelect,
    handleClear,
    t,
  } = useCategorySelect(props);

  // Обчислюємо список ID для автоматичного розкриття
  const expandedIds = useMemo(() => {
    // Якщо є пошуковий запит -> розкриваємо ВСЕ, що знайшли (включно з дітьми)
    // Якщо пошуку немає -> не форсуємо розкриття (або можна передати дефолтні, якщо треба)
    return searchQuery ? getAllRecursiveIds(treeData) : [];
  }, [searchQuery, treeData]);

  const triggerLabel = selectedCategory ? (
    <S.TriggerContent>
      <S.IconWrapper
        $color={selectedCategory.color}
        style={props.size === "small" ? { fontSize: "0.9rem" } : {}}
      >
        <CategoryIcon name={selectedCategory.icon || "HiTag"} />
      </S.IconWrapper>
      <S.LabelText>{selectedCategory.name}</S.LabelText>
    </S.TriggerContent>
  ) : null;

  return (
    <BaseSelect
      triggerLabel={triggerLabel}
      placeholder={finalPlaceholder}
      onClear={props.value ? handleClear : undefined}
      hasError={props.hasError}
      menuWidth={props.dropdownWidth}
      size={props.size}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
    >
      <S.DropdownContentWrapper>
        <S.ScrollArea>
          {treeData.length > 0 ? (
            <CategoryTree
              categories={treeData}
              selectedId={props.value}
              onSelect={handleSelect}
              // Залишаємо true, щоб користувач міг згорнути вручну, якщо захоче
              collapsible={true}
              // Передаємо повний список ID для розкриття
              defaultExpandedIds={expandedIds}
            />
          ) : (
            <S.EmptyState>{t("categories:categorySelect.status_not_found")}</S.EmptyState>
          )}
        </S.ScrollArea>
      </S.DropdownContentWrapper>
    </BaseSelect>
  );
}
