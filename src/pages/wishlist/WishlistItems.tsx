import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HiPlus, HiArrowLeft, HiGift } from "react-icons/hi2";
import { useQuery } from "@tanstack/react-query";

import { Button } from "../../components/ui/Button";
import Modal, { useModal } from "../../components/ui/Modal";
import { TableToolbar } from "../../components/shared/TableToolbar/TableToolbar";
import { EmptyState } from "../../components/ui/EmptyState";
import { CenteredSpinner } from "../../components/ui/CenteredSpinner";
import { FAB } from "../../components/ui/FAB";

import CreateWishModal from "../../components/wishlist/CreateWishModal";
import WishItemCard from "../../components/wishlist/WishItemCard";
import { useWishlist } from "../../hooks/Wishlist/useWishlist";
import { useWishlistFilters } from "../../hooks/Wishlist/useWishlistFilters";
import { getMeApi, getFamilyMembers } from "../../services/apiUsers";
import { useHeader } from "../../context/HeaderContext";
import { useIsMobile } from "../../hooks/useIsMobile";
import MobilePageHeader from "../../components/mobile/MobilePageHeader";
import * as S from "./Wishlist.styles";

export default function WishlistItems() {
  return (
    <Modal>
      <WishlistItemsContent />
    </Modal>
  );
}

function WishlistItemsContent() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { items, groups, isLoading, handlers, t } = useWishlist();
  const { open } = useModal();
  const { setPageTitle, resetPageTitle } = useHeader();
  const isMobile = useIsMobile();

  const { data: user } = useQuery({ queryKey: ["me"], queryFn: getMeApi });
  const { data: familyMembers } = useQuery({
    queryKey: ["familyMembers"],
    queryFn: getFamilyMembers,
  });

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const groupItems = items.filter((i) => {
    if (groupId === "virtual-my") return !i.group_id && i.user_id === user?.id;
    if (groupId === "virtual-shared")
      return !i.group_id && i.user_id !== user?.id;
    return i.group_id === groupId;
  });

  const {
    searchQuery,
    setSearchQuery,
    filters,
    sortBy,
    setSortBy,
    filteredItems,
    filtersConfig,
    sortOptions,
    handleFilterChange,
    handleClearAll,
  } = useWishlistFilters(groupItems, groups);

  let groupName = t("shopping_wishlist:wishlist.group_unknown", "Папка");
  if (groupId === "virtual-my") {
    groupName = t("shopping_wishlist:wishlist.my_wishes", "Мої бажання");
  } else if (groupId === "virtual-shared") {
    groupName = t("shopping_wishlist:wishlist.shared_wishes", "Спільні бажання");
  } else {
    const group = groups.find((g) => g.id === groupId);
    if (group) groupName = group.name;
  }

  useEffect(() => {
    setPageTitle(groupName, "Додайте власне бажання");
    return () => resetPageTitle();
  }, [groupName, setPageTitle, resetPageTitle]);

  if (isLoading) return <CenteredSpinner isContainer />;

  return (
    <>
      {isMobile && <MobilePageHeader title={groupName} onBack={() => navigate("/wishlist")} />}
      <S.PageContainer onClick={() => setOpenMenuId(null)}>
        {!isMobile && (
          <S.HeaderSection>
            <S.BackButton onClick={() => navigate("/wishlist")}>
              <HiArrowLeft size={18} /> {t("common:common.return", "Назад")}
            </S.BackButton>
          </S.HeaderSection>
        )}

      <TableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={t(
          "shopping_wishlist:wishlist.search_placeholder",
          "Пошук бажань...",
        )}
        filtersConfig={filtersConfig}
        filterValues={filters}
        onFilterChange={handleFilterChange}
        sortOptions={sortOptions}
        sortValue={sortBy}
        onSortChange={setSortBy}
        onClearAll={handleClearAll}
      >
        {!isMobile && (
          <Modal.Open opens="create-wish">
            <Button variation="primary" icon={<HiPlus />}>
              {t("shopping_wishlist:wishlist.btn_add_item", "Додати")}
            </Button>
          </Modal.Open>
        )}
      </TableToolbar>

      {filteredItems.length > 0 ? (
        <S.Grid>
          {filteredItems.map((item) => (
            <WishItemCard
              key={item.id}
              item={item}
              user={user}
              familyMembers={familyMembers}
              groups={groups}
              handlers={handlers}
              isOpen={openMenuId === item.id}
              onToggleMenu={() =>
                setOpenMenuId(openMenuId === item.id ? null : item.id)
              }
              onCloseMenu={() => setOpenMenuId(null)}
            />
          ))}
        </S.Grid>
      ) : (
        <EmptyState
          icon={<HiGift />}
          title={
            searchQuery
              ? t("common:common.no_results")
              : t("shopping_wishlist:wishlist.empty_title")
          }
          action={
            !searchQuery && (
              <Modal.Open opens="create-wish-empty">
                <Button variation="primary" icon={<HiPlus />}>
                  {t("shopping_wishlist:wishlist.btn_add_item", "Додати")}
                </Button>
              </Modal.Open>
            )
          }
        />
      )}

      {/* MODAL WINDOWS */}
      <Modal.Window name="create-wish" padding="0">
        <CreateWishModal
          groups={groups}
          onCreate={handlers.createItem}
          defaultGroupId={
            groupId !== "virtual-my" && groupId !== "virtual-shared"
              ? groupId
              : undefined
          }
        />
      </Modal.Window>
      <Modal.Window name="create-wish-empty" padding="0">
        <CreateWishModal
          groups={groups}
          onCreate={handlers.createItem}
          defaultGroupId={
            groupId !== "virtual-my" && groupId !== "virtual-shared"
              ? groupId
              : undefined
          }
        />
      </Modal.Window>

      {isMobile && (
        <FAB onClick={() => open("create-wish")} />
      )}
    </S.PageContainer>
  </>
  );
}
