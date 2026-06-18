import { useState, useEffect, useRef } from "react";
import { HiPencil, HiTrash, HiChevronDown, HiCheck, HiEllipsisVertical } from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import { SmartIcon } from "../../utils/IconMap";

import {
  isNodeFullySelected,
  isNodePartiallySelected,
} from "../../hooks/Counterparties/useCounterpartyTree";

import * as S from "./CounterpartyTree.styles";

export interface Counterparty {
  id: string;
  name: string;
  type: string;
  subtype?: string;
  icon?: string;
  logo?: string;
  color?: string;
  category_id?: string | number;
  [key: string]: any;
}

export interface TreeNodeData {
  id: string;
  name: string;
  iconName: string;
  logo?: string | null;
  color?: string;
  type: "group" | "subgroup" | "item";
  data?: Counterparty;
  children: TreeNodeData[];
}

interface CounterpartyTreeProps {
  nodes: TreeNodeData[];
  selectedId?: string;
  selectedIds?: string[];
  onSelect?: (cp: Counterparty | any) => void;
  onEdit?: (node: any) => void;
  onDelete?: (id: string, isCat: boolean) => void;
  defaultExpandedIds?: string[];
  withCheckboxes?: boolean;
}

// --- Mobile actions dropdown component ---
function MobileActionsMenu({
  onEdit,
  onDelete,
  t,
}: {
  onEdit?: () => void;
  onDelete?: () => void;
  t: any;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <S.MobileActions ref={menuRef}>
      <S.ActionBtn onClick={() => setIsOpen(!isOpen)} tabIndex={-1}>
        <HiEllipsisVertical />
      </S.ActionBtn>
      {isOpen && (
        <S.DropdownMenu>
          {onEdit && (
            <S.DropdownItem
              onClick={() => {
                setIsOpen(false);
                onEdit();
              }}
            >
              <HiPencil size={16} />
              <span>{t("common:shared.edit", "Редагувати")}</span>
            </S.DropdownItem>
          )}
          {onDelete && (
            <S.DropdownItem
              $isDanger
              onClick={() => {
                setIsOpen(false);
                onDelete();
              }}
            >
              <HiTrash size={16} />
              <span>{t("common:shared.delete", "Видалити")}</span>
            </S.DropdownItem>
          )}
        </S.DropdownMenu>
      )}
    </S.MobileActions>
  );
}

// --- Recursive Node Component ---
const CPTreeNode: React.FC<{
  node: TreeNodeData;
  level: number;
  expandedIds: Set<string>;
  toggle: (id: string) => void;
  props: Omit<CounterpartyTreeProps, "nodes">;
}> = ({ node, level, expandedIds, toggle, props }) => {
  const { t } = useTranslation();

  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);

  const showCheckbox = props.withCheckboxes;
  const isSelectable = showCheckbox ? true : node.type === "item";

  const currentSelectedIds = props.selectedIds || [];

  const isSelected =
    currentSelectedIds.includes(String(node.id)) ||
    (props.selectedId !== undefined &&
      String(props.selectedId) === String(node.id)) ||
    isNodeFullySelected(node, currentSelectedIds);

  const isPartiallySelected =
    !isSelected && isNodePartiallySelected(node, currentSelectedIds);

  const handleSelect = () => {
    if (isSelectable && props.onSelect) {
      const payload = node.data ? node.data : { ...node, id: node.id };
      props.onSelect(payload);
    } else if (hasChildren) {
      toggle(node.id);
    }
  };

  const handleRowClick = (e: React.MouseEvent) => {
    if (isSelectable) {
      handleSelect();
    } else {
      e.stopPropagation();
      handleSelect();
    }
  };

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggle(node.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSelect();
      if (!isSelectable) {
        e.stopPropagation();
      }
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
          $selected={!!isSelected}
          $hasChildren={hasChildren}
          $isSelectable={isSelectable}
          onClick={handleRowClick}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="button"
          aria-expanded={isExpanded}
          aria-haspopup={hasChildren ? "true" : undefined}
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
              <S.Spacer />
            )}

            {showCheckbox && (
              <S.Checkbox $checked={isSelected || isPartiallySelected}>
                {isSelected && <HiCheck />}
                {isPartiallySelected && <S.PartialCheckBar />}
              </S.Checkbox>
            )}

            <S.Info>
              <S.IconWrapper
                $color={node.color}
                // 🔥 Якщо є лого: прозорий фон, без паддінгів, з бордером
                style={
                  node.logo
                    ? {
                        backgroundColor: "transparent",
                        padding: 0,
                        border: "1px solid rgba(0,0,0,0.1)",
                        overflow: "hidden",
                      }
                    : {}
                }
              >
                <SmartIcon
                  logo={node.logo}
                  iconName={node.iconName}
                  size={16}
                  color={node.color}
                />
              </S.IconWrapper>

              <S.Label>{node.name}</S.Label>
              {node.type === "subgroup" && node.children.length > 0 && (
                <S.Badge>{node.children.length}</S.Badge>
              )}
              {node.type === "item" && node.data?.subtype && level < 2 && (
                <S.Badge>{node.data.subtype}</S.Badge>
              )}
            </S.Info>
          </S.LeftSide>

          {(props.onEdit || props.onDelete) && (
            <S.Actions onClick={(e) => e.stopPropagation()}>
              <S.DesktopActions>
                {props.onEdit && !node.id.startsWith("root_") && (
                  <S.ActionBtn
                    onClick={() => props.onEdit!(node)}
                    tabIndex={-1}
                    title={t("legacy:treeActions.edit")}
                  >
                    <HiPencil />
                  </S.ActionBtn>
                )}
                {props.onDelete && !node.id.startsWith("root_") && (
                  <S.ActionBtn
                    className="delete"
                    onClick={() => props.onDelete!(node.id, node.type !== "item")}
                    tabIndex={-1}
                    title={t("legacy:treeActions.delete")}
                  >
                    <HiTrash />
                  </S.ActionBtn>
                )}
              </S.DesktopActions>

              <S.MobileActions>
                <MobileActionsMenu
                  onEdit={props.onEdit && !node.id.startsWith("root_") ? () => props.onEdit!(node) : undefined}
                  onDelete={props.onDelete && !node.id.startsWith("root_") ? () => props.onDelete!(node.id, node.type !== "item") : undefined}
                  t={t}
                />
              </S.MobileActions>
            </S.Actions>
          )}
        </S.TreeItem>
      </S.TreeItemWrapper>

      {hasChildren && isExpanded && (
        <>
          {node.children.map((child) => (
            <CPTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              expandedIds={expandedIds}
              toggle={toggle}
              props={props}
            />
          ))}
        </>
      )}
    </>
  );
};

// --- Main Component ---
export function CounterpartyTree({
  nodes,
  selectedId,
  selectedIds,
  onSelect,
  onEdit,
  onDelete,
  defaultExpandedIds = ["root_shops", "root_people", "root_other"],
  withCheckboxes = false,
}: CounterpartyTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(defaultExpandedIds),
  );

  // Ref for efficient prop comparison to avoid re-renders
  const prevDefaultIdsRef = useRef(JSON.stringify(defaultExpandedIds));

  useEffect(() => {
    const currentIdsStr = JSON.stringify(defaultExpandedIds);
    if (prevDefaultIdsRef.current !== currentIdsStr) {
      if (defaultExpandedIds.length > 0) {
        setExpandedIds((prev) => {
          const next = new Set(prev);
          defaultExpandedIds.forEach((id) => next.add(id));
          return next;
        });
      }
      prevDefaultIdsRef.current = currentIdsStr;
    }
  }, [defaultExpandedIds]);

  const toggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (!nodes || nodes.length === 0) return null;

  return (
    <S.TreeWrapper>
      {nodes.map((node) => (
        <CPTreeNode
          key={node.id}
          node={node}
          level={0}
          expandedIds={expandedIds}
          toggle={toggle}
          props={{
            selectedId,
            selectedIds,
            onSelect,
            onEdit,
            onDelete,
            withCheckboxes,
          }}
        />
      ))}
    </S.TreeWrapper>
  );
}
