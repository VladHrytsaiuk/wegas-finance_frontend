import { HiChevronDown, HiCheck, HiPencil, HiTrash } from "react-icons/hi2";
import { CategoryIcon } from "../../utils/IconMap"; // Використовуємо глобальний маппер

// Logic & Styles
import {
  useCategoryTreeState,
  type CategoryNode,
} from "../../hooks/Categories/useCategoryTreeState";
import * as S from "./CategoryTree.styles";

interface CategoryTreeProps {
  categories: CategoryNode[];
  selectedId?: string;
  selectedIds?: string[];
  onSelect?: (category: CategoryNode) => void;
  onEdit?: (category: CategoryNode) => void;
  onDelete?: (id: string, isCategory?: boolean) => void;
  defaultExpandedIds?: string[];
  collapsible?: boolean;
  withCheckboxes?: boolean;
}

// --- Recursive Node Component ---
interface TreeNodeProps {
  node: CategoryNode;
  level: number;
  expandedIds: Set<string>;
  toggle: (id: string) => void;
  // Передаємо всі колбеки та налаштування через об'єкт contextProps, щоб не дублювати типи
  contextProps: Omit<CategoryTreeProps, "categories"> & {
    t: any;
    getSelectionState: any;
  };
}

const TreeNode = ({
  node,
  level,
  expandedIds,
  toggle,
  contextProps,
}: TreeNodeProps) => {
  const {
    selectedId,
    selectedIds: multiSelectIds,
    onSelect,
    onEdit,
    onDelete,
    collapsible,
    withCheckboxes,
    t,
    getSelectionState,
  } = contextProps;

  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = collapsible === false ? true : expandedIds.has(node.id);

  // Визначення вибору
  const currentSelectedIds = multiSelectIds || (selectedId ? [selectedId] : []);
  const { fully: isSelected, partially: isPartiallySelected } =
    getSelectionState(node, currentSelectedIds);

  const handleSelect = () => {
    if (onSelect) onSelect(node);
  };

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggle(node.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSelect();
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      if (hasChildren && !isExpanded) toggle(node.id);
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (hasChildren && isExpanded) toggle(node.id);
    }
  };

  return (
    <>
      <S.TreeItemWrapper $level={level}>
        <S.TreeItem
          $selected={isSelected}
          $hasChildren={hasChildren}
          $isSelectable={true}
          onClick={handleSelect}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="button"
        >
          <S.LeftSide>
            {hasChildren ? (
              <S.ExpandButton
                type="button"
                onClick={handleExpandClick}
                $expanded={isExpanded}
                tabIndex={-1}
              >
                <HiChevronDown />
              </S.ExpandButton>
            ) : (
              <S.IndentPlaceholder />
            )}

            {withCheckboxes && (
              <S.Checkbox $checked={isSelected || isPartiallySelected}>
                {isSelected && <HiCheck />}
                {isPartiallySelected && <S.PartialDash />}
              </S.Checkbox>
            )}

            <S.Info>
              <S.IconWrapper $color={node.color}>
                <CategoryIcon name={node.icon || "HiTag"} />
              </S.IconWrapper>
              <S.Label>{node.name}</S.Label>

              {node.type === "income" && (
                <S.Badge
                  $bg="var(--color-green-100)"
                  $color="var(--color-brand-600)"
                >
                  {t("categories:categoryForm.type_income_short", "IN")}
                </S.Badge>
              )}
              {node.type === "expense" && (
                <S.Badge
                  $bg="var(--color-red-100)"
                  $color="var(--color-red-700)"
                >
                  {t("categories:categoryForm.type_expense_short", "OUT")}
                </S.Badge>
              )}
            </S.Info>
          </S.LeftSide>

          {(onEdit || onDelete) && !node.id.startsWith("root_") && (
            <S.Actions onClick={(e) => e.stopPropagation()}>
              {onEdit && (
                <S.ActionBtn
                  onClick={() => onEdit(node)}
                  title={t("legacy:treeActions.edit")}
                  tabIndex={-1}
                >
                  <HiPencil />
                </S.ActionBtn>
              )}
              {onDelete && (
                <S.ActionBtn
                  className="delete"
                  onClick={() => onDelete(node.id, true)}
                  title={t("legacy:treeActions.delete")}
                  tabIndex={-1}
                >
                  <HiTrash />
                </S.ActionBtn>
              )}
            </S.Actions>
          )}
        </S.TreeItem>
      </S.TreeItemWrapper>

      {hasChildren && isExpanded && (
        <>
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              expandedIds={expandedIds}
              toggle={toggle}
              contextProps={contextProps}
            />
          ))}
        </>
      )}
    </>
  );
};

// --- Main Component ---
export function CategoryTree(props: CategoryTreeProps) {
  const { expandedIds, toggle, getSelectionState, t } = useCategoryTreeState({
    defaultExpandedIds: props.defaultExpandedIds,
    collapsible: props.collapsible,
  });

  // Об'єднуємо пропси з методами хука для передачі в рекурсивний компонент
  const contextProps = {
    ...props,
    t,
    getSelectionState,
  };

  return (
    <S.TreeWrapper>
      {props.categories.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          level={0}
          expandedIds={expandedIds}
          toggle={toggle}
          contextProps={contextProps}
        />
      ))}
    </S.TreeWrapper>
  );
}
