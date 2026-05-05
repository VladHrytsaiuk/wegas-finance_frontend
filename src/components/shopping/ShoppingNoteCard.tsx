import { useState, useEffect } from "react";
import { HiPlus, HiCheck, HiTrash, HiDocumentText } from "react-icons/hi2";

import Modal from "../ui/Modal";
import ConfirmDelete from "../ui/ConfirmDelete";
import { NoteOptions } from "./NoteOptions";
import { useUsers } from "../../hooks/Settings/useUsers";

import type { ShoppingList, ShoppingItem } from "../../services/apiShopping";
import * as S from "../../pages/Shopping/Shopping.styles"; // Переконайся, що шлях правильний

interface ShoppingNoteCardProps {
  list: ShoppingList;
  handlers: any; // Або заміни на твій конкретний тип з useShopping
  t: any;
}

export default function ShoppingNoteCard({
  list,
  handlers,
  t,
}: ShoppingNoteCardProps) {
  const [newItemName, setNewItemName] = useState("");
  const [title, setTitle] = useState(list.title);
  const { users } = useUsers();

  useEffect(() => {
    setTitle(list.title);
  }, [list.title]);

  const author =
    users?.find((u) => String(u.id) === String(list.user_id))?.name ||
    t("common.me", "Я");

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

  return (
    <S.NoteCard $color={list.color}>
      <S.NoteHeader>
        <S.TitleInput
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          onKeyDown={handleTitleKeyDown}
          placeholder={t("shopping.no_title", "Без назви")}
        />
        {completedItems.length > 0 && (
          <S.ActionButton
            onClick={() => handlers.clearCompleted(list.id)}
            title={t("shopping.clear_completed")}
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
            <span onClick={() => handlers.toggleItem(item.id, !item.is_bought)}>
              {item.name}
            </span>
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
              placeholder={t("shopping.add_item")}
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
            <span onClick={() => handlers.toggleItem(item.id, !item.is_bought)}>
              {item.name}
            </span>
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
              <S.ActionButton className="danger" title={t("common.delete")}>
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
