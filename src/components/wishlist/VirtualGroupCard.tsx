import { HiUser, HiUsers } from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import * as S from "../../pages/wishlist/Wishlist.styles";

interface VirtualGroupCardProps {
  variant: "my" | "shared";
  itemsCount: number;
  onClick: () => void;
}

export default function VirtualGroupCard({
  variant,
  itemsCount,
  onClick,
}: VirtualGroupCardProps) {
  const { t } = useTranslation();

  const isMy = variant === "my";
  const color = isMy ? "var(--color-blue-500)" : "var(--color-purple-500)";
  const title = isMy
    ? t("shopping_wishlist:wishlist.my_wishes", "Мої бажання")
    : t("shopping_wishlist:wishlist.shared_wishes", "Спільні");

  return (
    <S.FolderCard $color={color} onClick={onClick}>
      <S.FolderHeader>
        <S.FolderIconWrapper $color={color}>
          {isMy ? <HiUser /> : <HiUsers />}
        </S.FolderIconWrapper>
      </S.FolderHeader>

      <S.FolderInfo>
        <S.FolderTitle>{title}</S.FolderTitle>
        <S.FolderDescription>
          {itemsCount} {t("shopping_wishlist:wishlist.items_count", "бажань")}
        </S.FolderDescription>
      </S.FolderInfo>
    </S.FolderCard>
  );
}
