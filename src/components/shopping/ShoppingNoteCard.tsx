import { useState } from "react";
import { HiPlus, HiCheck, HiTrash, HiDocumentText } from "react-icons/hi2";
import type { TFunction } from "i18next";

import Modal from "../ui/Modal";
import ConfirmDelete from "../ui/ConfirmDelete";
import { NoteOptions } from "./NoteOptions";
import { useUsers } from "../../hooks/Settings/useUsers";
import type { ShoppingHandlers } from "../../hooks/Shopping/useShoppingPage";

import type { ShoppingList, ShoppingItem } from "../../services/apiShopping";
import * as S from "../../pages/Shopping/Shopping.styles"; // Переконайся, що шлях правильний

interface ShoppingNoteCardProps {
  list: ShoppingList;
  handlers: ShoppingHandlers;
  t: TFunction;
  isMobileCompact?: boolean;
  isModal?: boolean;
  onClick?: React.MouseEventHandler;
}

export default function ShoppingNoteCard({
  list,
  handlers,
  t,
  isMobileCompact = false,
  isModal = false,
  onClick,
}: ShoppingNoteCardProps) {
  const [newItemName, setNewItemName] = useState("");
  const [title, setTitle] = useState(() => list.title);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editItemName, setEditItemName] = useState("");
  const { users } = useUsers();

  const author =
    users?.find((u) => String(u.id) === String(list.user_id))?.name ||
    t("common:common.me", "Я");

  const dateStr = list.created_at
    ? new Date(Number(list.created_at) * 1000).toLocaleDateString()
    : "";

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemName.trim()) {
      handlers.addItem(list.id, newItemName.trim());
      setNewItemName("");
    }
  };

  const handleTitleBlur = () => {
    if (title.trim() !== list.title)
      handlers.updateListTitle(list.id, title.trim());
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") e.currentTarget.blur();
  };

  const activeItems = list.items?.filter((i) => !i.is_bought) || [];
  const completedItems = list.items?.filter((i) => i.is_bought) || [];

  if (isMobileCompact) {
    const totalItems = list.items?.length || 0;
    const activeItemsCount = activeItems.length;

    return (
      <S.CompactNoteCard $color={list.color} onClick={onClick}>
        <S.CompactTitle>
          {title.trim() || t("shopping_wishlist:shopping.no_title", "Без назви")}
        </S.CompactTitle>
        <S.CompactMeta>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span>{dateStr}</span>
            <span className="author" style={{ fontWeight: 600, color: "var(--color-text-secondary)" }}>{author}</span>
          </div>
          {totalItems > 0 && (
            <S.CompactBadge>
              {activeItemsCount} / {totalItems}
            </S.CompactBadge>
          )}
        </S.CompactMeta>
      </S.CompactNoteCard>
    );
  }

  return (
    <S.NoteCard $color={list.color} $isModal={isModal}>
      <S.NoteHeader $isModal={isModal}>
        <S.TitleInput
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          onKeyDown={handleTitleKeyDown}
          placeholder={t("shopping_wishlist:shopping.no_title", "Без назви")}
        />
        {completedItems.length > 0 && (
          <S.ActionButton
            onClick={() => handlers.clearCompleted(list.id)}
            title={t("shopping_wishlist:shopping.clear_completed")}
            style={{ marginLeft: "8px" }}
          >
            <HiDocumentText size={18} />
          </S.ActionButton>
        )}
      </S.NoteHeader>

      <S.ItemsList>
        {activeItems.map((item: ShoppingItem) => (
          <S.ListItem key={item.id}>
            <S.Checkbox
              onClick={() => handlers.toggleItem(item.id, !item.is_bought)}
            >
              <HiCheck />
            </S.Checkbox>
            {editingItemId === item.id ? (
              <S.AddItemInput
                autoFocus
                value={editItemName}
                onChange={(e) => setEditItemName(e.target.value)}
                onBlur={() => {
                  if (editItemName.trim() && editItemName !== item.name) {
                    handlers.updateItem(item.id, editItemName.trim());
                  }
                  setEditingItemId(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.currentTarget.blur();
                  } else if (e.key === "Escape") {
                    setEditingItemId(null);
                  }
                }}
                style={{ flex: 1, padding: "0" }}
              />
            ) : (
              <span 
                onClick={() => {
                  setEditingItemId(item.id);
                  setEditItemName(item.name);
                }}
                style={{ cursor: "text", flex: 1 }}
              >
                {item.name}
              </span>
            )}
            <S.ItemDeleteBtn
              className="item-delete"
              onClick={() => handlers.deleteItem(item.id)}
            >
              <HiTrash size={16} />
            </S.ItemDeleteBtn>
          </S.ListItem>
        ))}

        <S.ListItem $isInput>
          <S.AddItemForm onSubmit={handleAddItem}>
            <S.Checkbox $isAdd>
              <HiPlus />
            </S.Checkbox>
            <S.AddItemInput
              type="text"
              placeholder={t("shopping_wishlist:shopping.add_item")}
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
            />
          </S.AddItemForm>
        </S.ListItem>

        {completedItems.length > 0 && <S.Divider />}
        {completedItems.map((item: ShoppingItem) => (
          <S.ListItem key={item.id} $isBought>
            <S.Checkbox
              $checked
              onClick={() => handlers.toggleItem(item.id, !item.is_bought)}
            >
              <HiCheck />
            </S.Checkbox>
            {editingItemId === item.id ? (
              <S.AddItemInput
                autoFocus
                value={editItemName}
                onChange={(e) => setEditItemName(e.target.value)}
                onBlur={() => {
                  if (editItemName.trim() && editItemName !== item.name) {
                    handlers.updateItem(item.id, editItemName.trim());
                  }
                  setEditingItemId(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.currentTarget.blur();
                  } else if (e.key === "Escape") {
                    setEditingItemId(null);
                  }
                }}
                style={{ flex: 1, padding: "0" }}
              />
            ) : (
              <span 
                onClick={() => {
                  setEditingItemId(item.id);
                  setEditItemName(item.name);
                }}
                style={{ cursor: "text", flex: 1 }}
              >
                {item.name}
              </span>
            )}
            <S.ItemDeleteBtn
              className="item-delete"
              onClick={() => handlers.deleteItem(item.id)}
            >
              <HiTrash size={16} />
            </S.ItemDeleteBtn>
          </S.ListItem>
        ))}
      </S.ItemsList>

      <S.NoteFooter className="note-footer">
        <S.MetaData>
          <span>{dateStr}</span>
          <span className="author">{author}</span>
        </S.MetaData>
        <S.ActionsGroup>
          <NoteOptions
            color={list.color}
            visibility={list.visibility}
            hiddenFrom={list.hidden_from}
            onChangeColor={(color) => handlers.updateListColor(list.id, color)}
            onChangeVisibility={(vis, hidden) =>
              handlers.updateListVisibility(list.id, vis, hidden)
            }
          />
          <Modal>
            <Modal.Open opens={`delete-list-${list.id}`}>
              <S.ActionButton className="danger" title={t("common:common.delete")}>
                <HiTrash size={18} />
              </S.ActionButton>
            </Modal.Open>
            <Modal.Window name={`delete-list-${list.id}`}>
              <ConfirmDelete
                resourceName={list.title}
                onConfirm={() => handlers.deleteList(list.id)}
              />
            </Modal.Window>
          </Modal>
        </S.ActionsGroup>
      </S.NoteFooter>
    </S.NoteCard>
  );
}
