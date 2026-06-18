import { useState, useEffect } from "react";
import { usePageTitle } from "../../hooks/usePageTitle";
import { HiPlus, HiPlusCircle } from "react-icons/hi2";

import Spinner from "../../components/ui/Spinner";
import { CenteredSpinner } from "../../components/ui/CenteredSpinner";
import { Button } from "../../components/ui/Button";
import { NoteOptions } from "../../components/shopping/NoteOptions";
import { TableToolbar } from "../../components/shared/TableToolbar/TableToolbar";
import { Pagination } from "../../components/ui/Pagination";
import { EmptyState } from "../../components/ui/EmptyState";
import { HiOutlineQueueList } from "react-icons/hi2";
import ShoppingNoteCard from "../../components/shopping/ShoppingNoteCard"; // Імпорт винесеної карточки
import { DEFAULT_NOTE_COLOR } from "../../utils/constants";

import { useShopping } from "../../hooks/Shopping/useShoppingPage";
import { useShoppingFilters } from "../../hooks/Shopping/useShoppingFilters";
import { useHeader } from "../../context/HeaderContext"; // Імпорт контексту заголовка
import { useIsMobile } from "../../hooks/useIsMobile";
import MobilePageHeader from "../../components/mobile/MobilePageHeader";
import * as S from "./Shopping.styles";
import Modal, { useModal } from "../../components/ui/Modal";
import { FAB } from "../../components/ui/FAB";
import { CreateShoppingListModal } from "../../components/shopping/CreateShoppingListModal";

function Shopping() {
  return (
    <Modal>
      <ShoppingContent />
    </Modal>
  );
}

function ShoppingContent() {
  const { lists, isLoading, handlers, t } = useShopping();
  const { open, close } = useModal();
  const isMobile = useIsMobile();
  usePageTitle(t("navigation:general.shoppingList", "Покупки"));
  const { setPageTitle, resetPageTitle } = useHeader();

  const {
    searchQuery,
    setSearchQuery,
    sortValue,
    setSortValue,
    filterValues,
    handleFilterChange,
    handleClearAll,
    paginatedLists,
    page,
    setPage,
    totalCount,
    pageSize,
    filtersConfig,
    sortOptions,
  } = useShoppingFilters(lists);

  const [newListTitle, setNewListTitle] = useState("");
  const [newListColor, setNewListColor] = useState(DEFAULT_NOTE_COLOR);
  const [newListVisibility, setNewListVisibility] = useState<
    "public" | "private" | "hidden"
  >("public");
  const [newListHiddenFrom, setNewListHiddenFrom] = useState("");

  // Встановлення глобального заголовка
  useEffect(() => {
    setPageTitle(
      t("shopping_wishlist:shopping.title", "Списки покупок"),
      t("shopping_wishlist:shopping.subtitle", "Ваші списки покупок"),
    );

    return () => resetPageTitle();
  }, [setPageTitle, resetPageTitle, t]);

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (newListTitle.trim()) {
      handlers.createList(
        newListTitle.trim(),
        newListColor,
        newListVisibility,
        newListHiddenFrom,
      );
      setNewListTitle("");
      setNewListColor(DEFAULT_NOTE_COLOR);
      setNewListVisibility("public");
      setNewListHiddenFrom("");
    }
  };

  if (isLoading)
    return (
      <CenteredSpinner
        isContainer
        message={t("common:ui.loading_shopping", "Завантаження списків...")}
      />
    );

  return (
    <>
      {isMobile && <MobilePageHeader title={t("shopping_wishlist:shopping.title", "Списки покупок")} />}
      <S.PageContainer>
        <TableToolbar        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={t("shopping_wishlist:shopping.search_placeholder", "Пошук списків...")}
        filtersConfig={filtersConfig as any}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        onClearAll={handleClearAll}
        sortOptions={sortOptions}
        sortValue={sortValue}
        onSortChange={setSortValue}
      />

      {!isMobile && (
        <S.CreateNoteCard onSubmit={handleCreateList} $color={newListColor}>
          <div
            style={{
              display: "flex",
              width: "100%",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <input
              type="text"
              placeholder={t("shopping_wishlist:shopping.new_list", "Створити новий список...")}
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
            />
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <NoteOptions
                color={newListColor}
                visibility={newListVisibility}
                hiddenFrom={newListHiddenFrom}
                onChangeColor={setNewListColor}
                onChangeVisibility={(vis, hidden) => {
                  setNewListVisibility(vis);
                  setNewListHiddenFrom(hidden);
                }}
              />
              <Button
                variation="soft"
                type="submit"
                disabled={!newListTitle.trim()}
                size="small"
                icon={<HiPlusCircle size={18} />}
              />
            </div>
          </div>
        </S.CreateNoteCard>
      )}

      {paginatedLists.length === 0 ? (
        <EmptyState
          icon={<HiOutlineQueueList />}
          title={
            searchQuery
              ? t("common:common.no_results")
              : t("shopping_wishlist:shopping.empty_title")
          }
          description={
            searchQuery
              ? t("common:common.try_adjusting_search")
              : t("shopping_wishlist:shopping.empty_desc")
          }
        />
      ) : (
        <S.MasonryGrid>
          {paginatedLists.map((list) =>
            isMobile ? (
              <div key={list.id}>
                <Modal.Open opens={`edit-list-${list.id}`}>
                  <ShoppingNoteCard
                    list={list}
                    handlers={handlers}
                    t={t}
                    isMobileCompact={true}
                  />
                </Modal.Open>
                <Modal.Window name={`edit-list-${list.id}`} padding="0">
                  <ShoppingNoteCard
                    list={list}
                    handlers={handlers}
                    t={t}
                    isMobileCompact={false}
                    isModal={true}
                  />
                </Modal.Window>
              </div>
            ) : (
              <ShoppingNoteCard
                key={list.id}
                list={list}
                handlers={handlers}
                t={t}
              />
            )
          )}
        </S.MasonryGrid>
      )}

      <S.PaginationWrapper>
        <Pagination
          currentPage={page}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </S.PaginationWrapper>

      {isMobile && (
        <FAB onClick={() => open("create-shopping-list")} />
      )}

      <Modal.Window name="create-shopping-list" padding="0">
        <CreateShoppingListModal 
          onCreate={handlers.createList}
          onClose={close}
        />
      </Modal.Window>
    </S.PageContainer>
  </>
  );
}

export default Shopping;
