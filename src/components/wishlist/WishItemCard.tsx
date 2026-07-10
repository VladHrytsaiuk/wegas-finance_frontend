import {
  HiTrash,
  HiPencil,
  HiCheck,
  HiGift,
  HiEllipsisHorizontal,
  HiHandRaised,
  HiLockClosed,
  HiUserCircle,
  HiArrowTopRightOnSquare,
} from "react-icons/hi2";
import { useTranslation } from "react-i18next";

import Modal from "../ui/Modal";
import ConfirmDelete from "../ui/ConfirmDelete";
import EditWishModal from "./EditWishModal";
import { formatMoney, getUploadedFileUrl } from "../../utils/helpers";
import * as S from "../../pages/wishlist/Wishlist.styles";
import type { WishlistItemFormData } from "../../hooks/Wishlist/useWishlistForms";

import type { WishlistItem, WishlistGroup, User } from "../../types";

interface WishItemCardProps {
  item: WishlistItem;
  user: User | null | undefined; // Твій тип користувача
  familyMembers: User[] | undefined;
  groups: WishlistGroup[];
  handlers: {
    updateItem: (data: WishlistItemFormData) => void;
    deleteItem: (id: string) => void;
    toggleReservation: (id: string) => void;
  };
  isOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
}

export default function WishItemCard({
  item,
  user,
  familyMembers,
  groups,
  handlers,
  isOpen,
  onToggleMenu,
  onCloseMenu,
}: WishItemCardProps) {
  const { t } = useTranslation();

  const isBought = item.status === "bought";
  const isMine = item.user_id === user?.id;
  const isReservedByMe = item.reserved_by === user?.id;
  const isReservedByOther = item.reserved_by && !isReservedByMe;
  const isReserved = !!item.reserved_by;

  const hasMenuActions = isMine;

  const author = familyMembers?.find((m) => m.id === item.user_id);
  const authorName = isMine
    ? t("shopping_wishlist:wishlist.label_mine", "Моє")
    : author
      ? author.name
      : t("shopping_wishlist:wishlist.label_unknown", "Невідомо");

  return (
    <S.WishCard $isBought={isBought}>
      <Modal>
        {/* MENU TRIGGER */}
        {hasMenuActions && (
          <S.MenuTriggerContainer onClick={(e) => e.stopPropagation()}>
            <S.MenuButton onClick={onToggleMenu}>
              <HiEllipsisHorizontal size={20} />
            </S.MenuButton>

            {isOpen && (
              <S.DropdownMenu>
                {/* 1. ПОЗНАЧИТИ КУПЛЕНИМ */}
                <S.MenuItem
                  $variant="check"
                  onClick={() => {
                    handlers.updateItem({
                      id: item.id,
                      status: isBought ? "planning" : "bought",
                    });
                    onCloseMenu();
                  }}
                >
                  <HiCheck />{" "}
                  {isBought
                    ? t("shopping_wishlist:wishlist.mark_planning", "Повернути в плани")
                    : t("shopping_wishlist:wishlist.mark_bought", "Позначити купленим")}
                </S.MenuItem>

                {/* 2. РЕДАГУВАТИ */}
                <Modal.Open opens={`edit-${item.id}`}>
                  <S.MenuItem onClick={onCloseMenu}>
                    <HiPencil /> {t("common:common.edit", "Редагувати")}
                  </S.MenuItem>
                </Modal.Open>

                {/* 3. ВИДАЛИТИ */}
                <div
                  style={{
                    borderTop: "1px solid var(--color-border)",
                    margin: "4px 0",
                  }}
                ></div>
                <Modal.Open opens={`delete-${item.id}`}>
                  <S.MenuItem $variant="delete" onClick={onCloseMenu}>
                    <HiTrash /> {t("common:common.delete", "Видалити")}
                  </S.MenuItem>
                </Modal.Open>
              </S.DropdownMenu>
            )}
          </S.MenuTriggerContainer>
        )}

        <Modal.Window name={`edit-${item.id}`} padding="0" mobileBottomSheet>
          <EditWishModal
            initialData={item}
            groups={groups}
            onSave={handlers.updateItem}
          />
        </Modal.Window>
        <Modal.Window name={`delete-${item.id}`} mobileBottomSheet>
          <ConfirmDelete
            resourceName={item.name}
            onConfirm={() => handlers.deleteItem(item.id)}
          />
        </Modal.Window>
      </Modal>

      {/* IMAGE */}
      <S.CardImage $src={getUploadedFileUrl(item.photo_url)}>
        {!item.photo_url && (
          <HiGift
            size={48}
            style={{
              opacity: 0.2,
              color: "var(--color-text-tertiary)",
            }}
          />
        )}

        {/* Бейджі резерву */}
        {!isMine && isReserved && (
          <S.StatusBadge $isMine={isReservedByMe}>
            {isReservedByMe ? (
              <>
                <HiCheck size={14} />
                {t("shopping_wishlist:wishlist.reserve_status_buying", "Ви купуєте")}
              </>
            ) : (
              <>
                <HiLockClosed size={12} />
                {t("shopping_wishlist:wishlist.reserve_status_locked", "Резерв")}
              </>
            )}
          </S.StatusBadge>
        )}
      </S.CardImage>

      {/* BODY */}
      <S.CardBody>
        <div>
          <S.Title $isBought={isBought}>{item.name}</S.Title>

          <S.MetaRow>
            <S.AuthorInfo title={`${t("common:common.created", "Створено")}: ${authorName}`}>
              <HiUserCircle size={16} />
              {authorName}
            </S.AuthorInfo>

            <S.PriorityBadge $priority={item.priority || 1}>
              {item.priority === 3 ? (
                <>🔥 {t("shopping_wishlist:wishlist.priority_high", "Високий")}</>
              ) : item.priority === 2 ? (
                <>⚡ {t("shopping_wishlist:wishlist.priority_medium", "Середній")}</>
              ) : (
                t("shopping_wishlist:wishlist.priority_low", "Низький")
              )}
            </S.PriorityBadge>
          </S.MetaRow>
        </div>

        {/* ПОСИЛАННЯ ТА ЦІНА */}
        <S.PriceRow>
          <S.PriceText>
            {item.price ? formatMoney(item.price, item.currency || "UAH") : "—"}
          </S.PriceText>

          {item.url && (
            <S.LinkBtn
              onClick={() => window.open(item.url, "_blank")}
              title={t("common:common.open_link", "Відкрити в магазині")}
            >
              <HiArrowTopRightOnSquare size={18} />
            </S.LinkBtn>
          )}
        </S.PriceRow>

        {/* ACTION BUTTON */}
        {!isMine && !isBought && (
          <S.ReserveBtn
            $isActive={isReservedByMe}
            $isLocked={!!isReservedByOther}
            onClick={(e) => {
              if (isReservedByOther) return;
              e.stopPropagation();
              handlers.toggleReservation(item.id);
            }}
          >
            {isReservedByMe ? (
              <>
                <HiCheck size={18} />{" "}
                {t("shopping_wishlist:wishlist.reserve_btn_cancel", "Зняти резерв")}
              </>
            ) : isReservedByOther ? (
              <>
                <HiLockClosed size={16} />{" "}
                {t("shopping_wishlist:wishlist.reserve_btn_locked", "Зарезервовано")}
              </>
            ) : (
              <>
                <HiHandRaised size={18} />{" "}
                {t("shopping_wishlist:wishlist.reserve_btn_action", "Я хочу подарувати")}
              </>
            )}
          </S.ReserveBtn>
        )}
      </S.CardBody>
    </S.WishCard>
  );
}
