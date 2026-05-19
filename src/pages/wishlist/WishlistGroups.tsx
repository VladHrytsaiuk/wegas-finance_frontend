import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HiPlus, HiFolderPlus } from "react-icons/hi2";

import Spinner from "../../components/ui/Spinner";
import { Button } from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { TableToolbar } from "../../components/shared/TableToolbar/TableToolbar";

import CreateGroupModal from "../../components/wishlist/CreateGroupModal";
import CreateWishModal from "../../components/wishlist/CreateWishModal";
import WishGroupCard from "../../components/wishlist/WishGroupCard";
import VirtualGroupCard from "../../components/wishlist/VirtualGroupCard";

import { useWishlist } from "../../hooks/Wishlist/useWishlist";
import { useWishlistGroupFilters } from "../../hooks/Wishlist/useWishlistGroupFilters";
import { useHeader } from "../../context/HeaderContext";
import * as S from "./Wishlist.styles";

export default function WishlistGroups() {
  const navigate = useNavigate();
  const { items, groups, isLoading, handlers, t } = useWishlist();
  const { setPageTitle, resetPageTitle } = useHeader();

  const {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    filters,
    filtersConfig,
    sortOptions,
    handleFilterChange,
    handleClearAll,
    processedGroups,
    showMyVirtual,
    showSharedVirtual,
    myItemsCount,
    sharedItemsCount,
    userId,
  } = useWishlistGroupFilters(groups, items);

  useEffect(() => {
    setPageTitle(
      t("shopping_wishlist:wishlist.title", "Список бажань"),
      t("shopping_wishlist:wishlist.subtitle", "Створіть власний список бажань"),
    );
    return () => resetPageTitle();
  }, [setPageTitle, resetPageTitle, t]);

  if (isLoading) return <Spinner />;

  return (
    <S.PageContainer>
      <TableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={t("shopping_wishlist:wishlist.search_folders", "Пошук папок...")}
        filtersConfig={filtersConfig}
        filterValues={filters}
        onFilterChange={handleFilterChange}
        sortOptions={sortOptions}
        sortValue={sortBy}
        onSortChange={setSortBy}
        onClearAll={handleClearAll}
      >
        <div style={{ display: "flex", gap: "10px" }}>
          <Modal>
            <Modal.Open opens="create-group">
              <Button variation="secondary" icon={<HiFolderPlus />}>
                {t("shopping_wishlist:wishlist.btn_add_group", "Група")}
              </Button>
            </Modal.Open>
            <Modal.Window name="create-group">
              <CreateGroupModal
                onCreate={(name, color, icon, visibility, hiddenFrom) =>
                  handlers.createGroup(
                    name,
                    color,
                    icon || "HiFolder",
                    visibility as any,
                    hiddenFrom,
                  )
                }
              />
            </Modal.Window>
          </Modal>

          <Modal>
            <Modal.Open opens="create-wish">
              <Button variation="primary" icon={<HiPlus />}>
                {t("shopping_wishlist:wishlist.btn_add_item", "Додати")}
              </Button>
            </Modal.Open>
            <Modal.Window name="create-wish">
              <CreateWishModal groups={groups} onCreate={handlers.createItem} />
            </Modal.Window>
          </Modal>
        </div>
      </TableToolbar>

      <S.Grid>
        {/* VIRTUAL GROUPS */}
        {showMyVirtual && (
          <VirtualGroupCard
            variant="my"
            itemsCount={myItemsCount}
            onClick={() => navigate(`/wishlist/virtual-my`)}
          />
        )}

        {showSharedVirtual && (
          <VirtualGroupCard
            variant="shared"
            itemsCount={sharedItemsCount}
            onClick={() => navigate(`/wishlist/virtual-shared`)}
          />
        )}

        {/* REAL GROUPS */}
        {processedGroups.map((group) => (
          <WishGroupCard
            key={group.id}
            group={group}
            isOwner={userId === group.user_id}
            onClick={() => navigate(`/wishlist/${group.id}`)}
            handlers={handlers}
          />
        ))}
      </S.Grid>

      {/* EMPTY STATE */}
      {processedGroups.length === 0 && !showMyVirtual && !showSharedVirtual && (
        <S.EmptyState>
          <S.EmptyIconWrapper>
            <HiFolderPlus />
          </S.EmptyIconWrapper>
          <h3>
            {searchQuery ||
            filters.author.length > 0 ||
            filters.visibility.length > 0
              ? t("common:common.no_results", "Нічого не знайдено")
              : t("shopping_wishlist:wishlist.empty_folders_title", "Поки що пусто")}
          </h3>
          <p>
            {searchQuery ||
            filters.author.length > 0 ||
            filters.visibility.length > 0
              ? t(
                  "common.try_adjusting_search",
                  "Спробуйте змінити фільтри або пошук",
                )
              : t(
                  "wishlist.empty_folders_desc",
                  "Створіть свою першу папку або додайте бажання, щоб почати.",
                )}
          </p>
          {!searchQuery &&
            filters.author.length === 0 &&
            filters.visibility.length === 0 && (
              <Modal>
                <Modal.Open opens="create-group-empty">
                  <Button variation="secondary" icon={<HiFolderPlus />}>
                    {t("shopping_wishlist:wishlist.btn_add_group", "Створити групу")}
                  </Button>
                </Modal.Open>
                <Modal.Window name="create-group-empty">
                  <CreateGroupModal
                    onCreate={(name, color, icon, visibility, hiddenFrom) =>
                      handlers.createGroup(
                        name,
                        color,
                        icon || "HiFolder",
                        visibility as any,
                        hiddenFrom,
                      )
                    }
                  />
                </Modal.Window>
              </Modal>
            )}
        </S.EmptyState>
      )}
    </S.PageContainer>
  );
}
