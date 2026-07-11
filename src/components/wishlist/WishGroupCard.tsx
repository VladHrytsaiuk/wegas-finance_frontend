import { HiArchiveBox, HiPencil, HiTrash } from "react-icons/hi2";
import { useTranslation } from "react-i18next";

import Modal from "../ui/Modal";
import ConfirmDelete from "../ui/ConfirmDelete";
import EditGroupModal from "./EditGroupModal";
import * as S from "../../pages/wishlist/Wishlist.styles";
import { CategoryIcon } from "../../utils/IconMap";

import type { WishlistGroup } from "../../types";

interface WishGroupCardProps {
  group: WishlistGroup & { itemsCount: number };
  isOwner: boolean;
  onClick: () => void;
  handlers: {
    updateGroup: (
      id: string,
      name: string,
      color: string,
      icon: string,
      visibility: WishlistGroup["visibility"],
      hiddenFrom: string,
    ) => void;
    deleteGroup: (id: string) => void;
  };
}

export default function WishGroupCard({
  group,
  isOwner,
  onClick,
  handlers,
}: WishGroupCardProps) {
  const { t } = useTranslation();

  return (
    <S.FolderCard $color={group.color} onClick={onClick}>
      <S.FolderHeader>
        <S.FolderIconWrapper $color={group.color}>
          {group.icon ? <CategoryIcon name={group.icon} /> : <HiArchiveBox />}
        </S.FolderIconWrapper>

        {isOwner && (
          <S.FolderActions
            className="folder-actions"
            onClick={(e) => e.stopPropagation()}
          >
            <Modal>
              <Modal.Open opens={`edit-${group.id}`}>
                <S.FolderActionBtn $variant="edit">
                  <HiPencil size={16} />
                </S.FolderActionBtn>
              </Modal.Open>
              <Modal.Window name={`edit-${group.id}`} padding="0" mobileBottomSheet>
                <EditGroupModal
                  initialData={group}
                  onUpdate={(id, name, color, icon, visibility, hiddenFrom) =>
                    handlers.updateGroup(
                      id,
                      name,
                      color,
                      icon,
                      visibility,
                      hiddenFrom,
                    )
                  }
                />
              </Modal.Window>

              <Modal.Open opens={`delete-${group.id}`}>
                <S.FolderActionBtn $variant="delete">
                  <HiTrash size={16} />
                </S.FolderActionBtn>
              </Modal.Open>
              <Modal.Window name={`delete-${group.id}`}>
                <ConfirmDelete
                  resourceName={group.name}
                  onConfirm={() => handlers.deleteGroup(group.id)}
                />
              </Modal.Window>
            </Modal>
          </S.FolderActions>
        )}
      </S.FolderHeader>

      <S.FolderInfo>
        <S.FolderTitle>{group.name}</S.FolderTitle>
        <S.FolderDescription>
          {group.itemsCount} {t("shopping_wishlist:wishlist.items_count", "бажань")}
        </S.FolderDescription>
      </S.FolderInfo>
    </S.FolderCard>
  );
}
