import { useState } from "react";
import { HiOutlineArrowTopRightOnSquare, HiOutlineGift } from "react-icons/hi2";
import styled from "styled-components";

import type { WishlistGroup, WishlistItem } from "../../../types";
import { useSettings } from "../../../context/SettingsContext";
import { formatMoney, getUploadedFileUrl } from "../../../utils/helpers";
import { openExternalUrl, safeExternalUrl } from "../../../utils/safeUrl";
import { ConfirmSheet } from "../../../mobile/ui/ConfirmSheet";
import { Group, Meta, Row } from "../../../mobile/ui/Group";
import { PhotoViewer } from "../../../mobile/ui/PhotoViewer";
import { PrimaryButton, Sheet } from "../../../mobile/ui/Sheet";
import { priorityLabel } from "./wishlist";
import { useWishlistActions } from "./useWishlistActions";
import { WishFormSheet } from "./WishFormSheet";

// Бажання: фото, ціна, посилання в магазин. Своє — купити/повернути в плани,
// змінити, видалити; чуже — резерв «Я хочу подарувати» (власник його не бачить).

const Photo = styled.button`
  display: block;
  width: 100%;
  padding: 0;
  border: none;
  border-radius: var(--m-radius-group);
  overflow: hidden;
  background: var(--m-fill);
  cursor: pointer;

  img {
    display: block;
    width: 100%;
    max-height: 260px;
    object-fit: cover;
  }
`;

const NoPhoto = styled.div`
  display: grid;
  place-items: center;
  height: 120px;
  border-radius: var(--m-radius-group);
  background: var(--m-fill);
  color: var(--m-label-3);
`;

const Title = styled.h2<{ $done: boolean }>`
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.01em;
  text-decoration: ${(p) => (p.$done ? "line-through" : "none")};
  color: ${(p) => (p.$done ? "var(--m-label-2)" : "var(--m-label)")};
`;

const Secondary = styled.button<{ $danger?: boolean }>`
  width: 100%;
  height: 50px;
  border: none;
  border-radius: var(--m-radius-group);
  font: inherit;
  font-size: 17px;
  font-weight: 600;
  color: ${(p) => (p.$danger ? "#ff3b30" : "var(--m-accent)")};
  background: var(--m-surface);
  cursor: pointer;
`;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: WishlistItem;
  groups: WishlistGroup[];
  me?: string;
  authorName: string;
}

export function WishDetailSheet({ open, onOpenChange, item, groups, me, authorName }: Props) {
  const { language } = useSettings();
  const { updateItem, deleteItem, toggleReservation } = useWishlistActions();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [viewer, setViewer] = useState(false);

  const isMine = item.user_id === me;
  const bought = item.status === "bought";
  const byMe = item.reserved_by === me;
  const byOther = !!item.reserved_by && !byMe;
  const photo = getUploadedFileUrl(item.photo_url);
  const link = safeExternalUrl(item.url);
  const group = groups.find((g) => g.id === item.group_id);

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Бажання"
      hideCancel
      footer={
        isMine ? (
          <PrimaryButton
            type="button"
            disabled={updateItem.isPending}
            onClick={async () => {
              // Статус міняємо окремо від форми: решта полів лишається як є.
              await updateItem.mutateAsync({
                id: item.id,
                status: bought ? "planning" : "bought",
              });
              onOpenChange(false);
            }}
          >
            {bought ? "Повернути в плани" : "Позначити купленим"}
          </PrimaryButton>
        ) : !bought ? (
          <PrimaryButton
            type="button"
            disabled={byOther || toggleReservation.isPending}
            onClick={async () => {
              await toggleReservation.mutateAsync(item.id).catch(() => undefined);
            }}
          >
            {byMe ? "Зняти резерв" : byOther ? "Уже зарезервовано" : "Я хочу подарувати"}
          </PrimaryButton>
        ) : undefined
      }
    >
      {photo ? (
        <Photo type="button" aria-label="Відкрити фото" onClick={() => setViewer(true)}>
          <img src={photo} alt="" />
        </Photo>
      ) : (
        <NoPhoto aria-hidden="true">
          <HiOutlineGift size={40} />
        </NoPhoto>
      )}
      <Title $done={bought}>{item.name}</Title>

      <Group>
        <Row
          title="Ціна"
          trailing={item.price ? formatMoney(item.price, item.currency || "UAH", language) : "—"}
        />
        <Row title="Пріоритет" trailing={priorityLabel(item.priority)} />
        <Row title="Статус" trailing={bought ? "Придбано" : "В планах"} />
        <Row title="Автор" trailing={isMine ? "Моє" : authorName} />
        {group && <Row title="Група" trailing={group.name} />}
        {!isMine && item.reserved_by && (
          <Row title="Резерв" trailing={<Meta>{byMe ? "Ви купуєте" : "Хтось із сім'ї"}</Meta>} />
        )}
      </Group>

      {link && (
        <Secondary type="button" onClick={() => openExternalUrl(item.url)}>
          <HiOutlineArrowTopRightOnSquare size={18} style={{ verticalAlign: "-3px" }} />{" "}
          Відкрити в магазині
        </Secondary>
      )}
      {isMine && (
        <>
          <Secondary type="button" onClick={() => setEditing(true)}>
            Змінити
          </Secondary>
          <Secondary type="button" $danger onClick={() => setConfirmDelete(true)}>
            Видалити
          </Secondary>
        </>
      )}

      {editing && (
        <WishFormSheet
          open={editing}
          onOpenChange={(next) => !next && setEditing(false)}
          groups={groups}
          item={item}
        />
      )}
      <ConfirmSheet
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        message={`Видалити «${item.name}»?`}
        actions={[
          {
            label: "Видалити",
            destructive: true,
            onSelect: () =>
              deleteItem.mutateAsync(item.id).then(() => onOpenChange(false)).catch(() => undefined),
          },
        ]}
      />
      {photo && viewer && (
        <PhotoViewer urls={[photo]} startIndex={0} onClose={() => setViewer(false)} />
      )}
    </Sheet>
  );
}
