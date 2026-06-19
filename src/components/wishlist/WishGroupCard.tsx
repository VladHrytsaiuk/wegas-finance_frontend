import * as Icons from "react-icons/hi2";
import { useTranslation } from "react-i18next";

import Modal from "../ui/Modal";
import ConfirmDelete from "../ui/ConfirmDelete";
import EditGroupModal from "./EditGroupModal";
import * as S from "../../pages/wishlist/Wishlist.styles";

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
      visibility: any,
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
  const IconComponent = (Icons as any)[group.icon] || Icons.HiFolder;

  return (
    <S.FolderCard $color={group.color} onClick={onClick}>
      <S.FolderHeader>
        <S.FolderIconWrapper $color={group.color}>
          <IconComponent />
        </S.FolderIconWrapper>

        {isOwner && (
          <S.FolderActions
            className="folder-actions"
            onClick={(e) => e.stopPropagation()}
          >
            <Modal>
              <Modal.Open opens={`edit-${group.id}`}>
                <S.FolderActionBtn $variant="edit">
                  <Icons.HiPencil size={16} />
                </S.FolderActionBtn>
              </Modal.Open>
              <Modal.Window name={`edit-${group.id}`} padding="0" mobileBottomSheet>
                <EditGroupModal
                  initialData={group as any}
                  onUpdate={(id, name, color, icon, visibility, hiddenFrom) =>
                    handlers.updateGroup(
                      id,
                      name,
                      color,
                      icon,
                      visibility as any,
                      hiddenFrom,
                    )
                  }
                />
              </Modal.Window>

              <Modal.Open opens={`delete-${group.id}`}>
                <S.FolderActionBtn $variant="delete">
                  <Icons.HiTrash size={16} />
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
