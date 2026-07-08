import { useMemo, useState } from "react";
import { HiChevronDown, HiCheck } from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import type { Account } from "../../services/apiAccounts";
import type { UserProfile } from "../../services/apiUsers";

// Імпорт стилів
import * as S from "./AccountTree.styles";

// Імпорт хука та типів
import {
  useAccountTree,
  type AccountTreeNode,
} from "../../hooks/Accounts/useAccountTree";
import { SmartIcon } from "../../utils/IconMap";

// --- HELPERS (Логіка виділення) ---

// Отримати всі ID кінцевих елементів (рахунків) у гілці
function getAllLeafIds(node: AccountTreeNode): string[] {
  if (node.type === "account") return [node.id];
  return node.children.flatMap(getAllLeafIds);
}

// Чи вибраний вузол повністю?
function isNodeSelected(node: AccountTreeNode, selectedIds: string[]): boolean {
  if (node.type === "account") return selectedIds.includes(node.id);
  const leaves = getAllLeafIds(node);
  // Вузол вибраний, якщо вибрані ВСІ його діти
  return leaves.length > 0 && leaves.every((id) => selectedIds.includes(id));
}

// Чи вибраний вузол частково?
function isNodePartiallySelected(
  node: AccountTreeNode,
  selectedIds: string[],
): boolean {
  if (node.type === "account") return false;
  const leaves = getAllLeafIds(node);
  const selectedCount = leaves.filter((id) => selectedIds.includes(id)).length;
  return selectedCount > 0 && selectedCount < leaves.length;
}

// --- КОМПОНЕНТ ВУЗЛА (Рекурсивний) ---

interface TreeNodeProps {
  node: AccountTreeNode;
  level: number;
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
  selectedIds: string[];
  onNodeClick: (node: AccountTreeNode) => void;
}

const TreeNode = ({
  node,
  level,
  expandedIds,
  toggleExpand,
  selectedIds,
  onNodeClick,
}: TreeNodeProps) => {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);

  const isSelected = isNodeSelected(node, selectedIds);
  const isPartiallySelected =
    !isSelected && isNodePartiallySelected(node, selectedIds);

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleExpand(node.id);
  };

  return (
    <>
      <S.TreeItemWrapper $level={level}>
        <S.TreeItem
          $selected={isSelected}
          $hasChildren={hasChildren}
          $isSelectable={true}
          onClick={() => onNodeClick(node)}
        >
          <S.LeftSide>
            {hasChildren ? (
              <S.ExpandButton
                type="button"
                onClick={handleExpandClick}
                $expanded={isExpanded}
              >
                <HiChevronDown />
              </S.ExpandButton>
            ) : (
              <div style={{ width: "24px", flexShrink: 0 }} />
            )}

            <S.Checkbox $checked={isSelected || isPartiallySelected}>
              {isSelected && <HiCheck />}
              {isPartiallySelected && (
                <div
                  style={{
                    width: 8,
                    height: 2,
                    background: "white",
                    borderRadius: 1,
                  }}
                />
              )}
            </S.Checkbox>

            <S.Info>
              <S.IconWrapper
                $color={node.color}
                // 🔥 ВИПРАВЛЕНО: Додаємо перевірку, що це саме рахунок (account),
                // а не група чи користувач, і у нього є логотип
                $hasImage={
                  node.type === "account" && node.icon?.startsWith("icon_")
                }
              >
                <SmartIcon
                  logo={
                    node.type === "account" && node.icon?.startsWith("icon_")
                      ? node.icon
                      : undefined
                  }
                  iconName={
                    !(node.type === "account" && node.icon?.startsWith("icon_"))
                      ? node.icon
                      : "HiCreditCard"
                  }
                  color={node.color}
                  // Логотип на весь блок (28), іконки — менші з фоном (16)
                  size={
                    node.type === "account" && node.icon?.startsWith("icon_")
                      ? 28
                      : 16
                  }
                />
              </S.IconWrapper>
              <S.Label title={node.label}>{node.label}</S.Label>

              {/* Показуємо останні цифри тільки для карток */}
              {node.type === "account" && node.data?.card_number && (
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--color-text-tertiary)",
                    marginLeft: "auto",
                  }}
                >
                  •• {node.data.card_number}
                </span>
              )}
            </S.Info>
          </S.LeftSide>
        </S.TreeItem>
      </S.TreeItemWrapper>

      {/* Рендеримо дітей, якщо розгорнуто */}
      {hasChildren && isExpanded && (
        <>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
              selectedIds={selectedIds}
              onNodeClick={onNodeClick}
            />
          ))}
        </>
      )}
    </>
  );
};

// --- ГОЛОВНИЙ КОМПОНЕНТ ---

interface AccountTreeProps {
  accounts: Account[];
  users: UserProfile[];
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
  searchQuery?: string;
}

export const AccountTree = ({
  accounts,
  users,
  selectedIds,
  onSelect,
  searchQuery,
}: AccountTreeProps) => {
  const { t } = useTranslation();

  // Використовуємо наш новий хук
  const treeData = useAccountTree({ accounts, users, searchQuery });

  const [manualExpandedIds, setManualExpandedIds] = useState<Set<string>>(
    new Set(),
  );

  const rootExpandedIds = useMemo(
    () => new Set(treeData.map((node) => node.id)),
    [treeData],
  );

  const searchExpandedIds = useMemo(() => {
    const allIds = new Set<string>();
    const traverse = (nodes: AccountTreeNode[]) => {
      nodes.forEach((node) => {
        allIds.add(node.id);
        if (node.children.length > 0) traverse(node.children);
      });
    };

    traverse(treeData);
    return allIds;
  }, [treeData]);

  const expandedIds = searchQuery
    ? searchExpandedIds
    : manualExpandedIds.size > 0
      ? manualExpandedIds
      : rootExpandedIds;

  const toggleExpand = (id: string) => {
    setManualExpandedIds(() => {
      const next = new Set(expandedIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleNodeClick = (node: AccountTreeNode) => {
    const nodeLeafIds = getAllLeafIds(node);
    const isFullySelected = isNodeSelected(node, selectedIds);

    let newSelectedIds: string[];

    if (isFullySelected) {
      // Якщо вибрано повністю -> знімаємо вибір з усіх дітей
      newSelectedIds = selectedIds.filter((id) => !nodeLeafIds.includes(id));
    } else {
      // Якщо не вибрано або частково -> вибираємо всіх дітей
      newSelectedIds = Array.from(new Set([...selectedIds, ...nodeLeafIds]));
    }

    onSelect(newSelectedIds);
  };

  if (treeData.length === 0) {
    return (
      <div style={{ padding: "1rem", textAlign: "center", color: "gray" }}>
        {t("common:ui.search_placeholder_default", "Нічого не знайдено")}
      </div>
    );
  }

  return (
    <S.TreeWrapper>
      {treeData.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          level={0}
          expandedIds={expandedIds}
          toggleExpand={toggleExpand}
          selectedIds={selectedIds}
          onNodeClick={handleNodeClick}
        />
      ))}
    </S.TreeWrapper>
  );
};
