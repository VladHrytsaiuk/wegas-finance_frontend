import { memo, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom"; // 🔥 Додано імпорт
import {
  HiPencil,
  HiTrash,
  HiPhoto,
  HiPaperClip,
  HiEllipsisVertical,
} from "react-icons/hi2";

import Modal from "../ui/Modal";
import Table from "../ui/Table";
import * as S from "../../pages/assets/Assets.styles";

export const AssetTableRow = memo(({ item, helpers, actions, t }) => {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, right: 0 });

  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      // Закриваємо меню, якщо клік був не по кнопці і не по самому меню
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    // Закриваємо меню при скролі сторінки або таблиці
    const handleScroll = () => setOpen(false);

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      // true вказує на фазу захоплення (capture phase), щоб ловити скрол у будь-якому контейнері
      window.addEventListener("scroll", handleScroll, true);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open]);

  const handleToggle = (e) => {
    e.stopPropagation();
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 4, // 4 пікселі відступ знизу від кнопки
        right: window.innerWidth - rect.right, // Вирівнюємо по правому краю кнопки
      });
    }
    setOpen((v) => !v);
  };

  const images = helpers.getAssetImages(item);
  const hasPhoto = images.length > 0;

  return (
    <Table.Row onClick={() => actions.handleNavigateToDetails(item.id)}>
      <Table.Cell>
        <S.InfoWrapper>
          <S.AssetAvatar>{item.name.charAt(0)}</S.AssetAvatar>
          <div>
            <S.AssetName>
              {item.name}
              {hasPhoto && (
                <HiPaperClip
                  size={14}
                  style={{
                    marginLeft: "6px",
                    color: "var(--color-text-secondary)",
                    flexShrink: 0,
                  }}
                  title={t("assetsPage.has_photo")}
                />
              )}
            </S.AssetName>
            <S.AssetType>{item.type}</S.AssetType>
          </div>
        </S.InfoWrapper>
      </Table.Cell>

      <Table.Cell>{helpers.formatPrice(item.price, item.currency)}</Table.Cell>
      <Table.Cell>{helpers.formatDate(item.purchase_date)}</Table.Cell>

      <Table.Cell>
        <S.Badge
          $color={
            helpers.isWarrantyExpired(item.warranty_end) ? "red" : "green"
          }
        >
          {helpers.formatDate(item.warranty_end)}
        </S.Badge>
      </Table.Cell>

      <Table.Cell>
        {item.is_sold ? (
          <S.Badge $color="gray">{t("assetsPage.badge_sold")}</S.Badge>
        ) : (
          <S.Badge $color="blue">{t("assetsPage.badge_active")}</S.Badge>
        )}
      </Table.Cell>

      <Table.Cell>
        {/* --- DESKTOP ACTIONS --- */}
        <S.DesktopActions onClick={(e) => e.stopPropagation()}>
          <Modal.Open opens={`view-photo-${item.id}`}>
            <button
              title={t("assetsPage.tooltip_photo")}
              disabled={!hasPhoto}
              style={{ opacity: hasPhoto ? 1 : 0.3 }}
            >
              <HiPhoto size={18} />
            </button>
          </Modal.Open>

          <Modal.Open opens={`edit-asset-${item.id}`}>
            <button title={t("assetsPage.tooltip_edit")}>
              <HiPencil size={18} />
            </button>
          </Modal.Open>

          <Modal.Open opens={`delete-asset-${item.id}`}>
            <button className="delete" title={t("assetsPage.tooltip_delete")}>
              <HiTrash size={18} />
            </button>
          </Modal.Open>
        </S.DesktopActions>

        {/* --- MOBILE ACTIONS --- */}
        <S.MobileActions onClick={(e) => e.stopPropagation()}>
          <S.MenuToggle ref={buttonRef} onClick={handleToggle}>
            <HiEllipsisVertical size={20} />
          </S.MenuToggle>

          {/* 🔥 Використовуємо createPortal для меню */}
          {open &&
            createPortal(
              <S.MenuDropdown
                ref={menuRef}
                onClick={() => setOpen(false)}
                style={{ top: `${coords.top}px`, right: `${coords.right}px` }}
              >
                <Modal.Open opens={`view-photo-${item.id}`}>
                  <S.MenuItemButton
                    disabled={!hasPhoto}
                    style={{ opacity: hasPhoto ? 1 : 0.3 }}
                  >
                    <HiPhoto size={16} />{" "}
                    {t("assetsPage.tooltip_photo" || "Фото")}
                  </S.MenuItemButton>
                </Modal.Open>

                <Modal.Open opens={`edit-asset-${item.id}`}>
                  <S.MenuItemButton>
                    <HiPencil size={16} /> {t("common.edit" || "Редагувати")}
                  </S.MenuItemButton>
                </Modal.Open>

                <Modal.Open opens={`delete-asset-${item.id}`}>
                  <S.MenuItemButton $variant="delete">
                    <HiTrash size={16} /> {t("common.delete" || "Видалити")}
                  </S.MenuItemButton>
                </Modal.Open>
              </S.MenuDropdown>,
              document.body, // Рендеримо меню безпосередньо в body
            )}
        </S.MobileActions>
      </Table.Cell>
    </Table.Row>
  );
});

AssetTableRow.displayName = "AssetTableRow";
