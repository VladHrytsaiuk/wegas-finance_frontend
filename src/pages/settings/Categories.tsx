import { HiPlus, HiTag, HiExclamationTriangle } from "react-icons/hi2";

// UI Components
import { Button } from "../../components/ui/Button";
import Modal, { useModal } from "../../components/ui/Modal";
import ConfirmDelete from "../../components/ui/ConfirmDelete";
import { CategoryTree } from "../../components/categories/CategoryTree";
import { TableToolbar } from "../../components/shared/TableToolbar/TableToolbar";
import { CategoryForm } from "../../components/categories/CategoryForm";
import { EmptyState } from "../../components/ui/EmptyState";
import { SettingsListSkeleton } from "../../components/ui/Skeleton/LoadingSkeletons";
import { FAB } from "../../components/ui/FAB";

// Styles & Logic
import * as S from "./Categories.styles";
import { useCategoriesPage } from "../../hooks/Categories/useCategoriesPage";
import { useIsMobile } from "../../hooks/useIsMobile";
import MobilePageHeader from "../../components/mobile/MobilePageHeader";

function Categories() {
  return (
    <Modal>
      <CategoriesContent />
    </Modal>
  );
}

function CategoriesContent() {
  const {
    state: {
      isLoading,
      categoryTreeRoots,
      flatCategories,
      editingCategory,
      copyOnWriteCategory,
      searchQuery,
      filters,
      sortValue,
      canManageStructure,
      isCreateLoading,
      isUpdateLoading,
      isDeleteLoading,
    },
    configs: { filtersConfig, sortOptions },
    handlers: {
      setSearchQuery,
      setFilters,
      setSortValue,
      handleEdit,
      confirmCopyOnWrite,
      handleDelete,
      handleCreateClick,
      handleSave,
      handleDeleteConfirm,
      handleClearFilters,
    },
    t,
  } = useCategoriesPage();

  const isMobile = useIsMobile();
  const { open, close } = useModal();

  return (
    <>
      {isMobile && <MobilePageHeader title={t("categories:categoriesPage.title")} />}
      <S.PageWrapper style={{ padding: isMobile ? "0" : undefined }}>
        {/* HEADER */}
        {!isMobile && (
          <S.HeaderRow>
            <S.Title>{t("categories:categoriesPage.title")}</S.Title>
            {canManageStructure && (
              <S.HeaderActions>
                <Modal.Open opens="create-category">
                  <Button
                    icon={<HiPlus />}
                    size="medium"
                    onClick={handleCreateClick}
                  >
                    {t("categories:categoriesPage.add_category_button")}
                  </Button>
                </Modal.Open>
              </S.HeaderActions>
            )}
          </S.HeaderRow>
        )}

        {/* TOOLBAR */}
        <S.ControlsRow style={{ padding: isMobile ? "12px 16px" : undefined }}>
          <TableToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder={t("categories:categoriesPage.search_placeholder")}
            searchPosition="top"
            filtersConfig={filtersConfig}
            filterValues={filters}
            onFilterChange={(k, v) =>
              setFilters((prev) => ({ ...prev, [k]: v }))
            }
            onClearAll={handleClearFilters}
            sortOptions={sortOptions}
            sortValue={sortValue}
            onSortChange={setSortValue}
          />
        </S.ControlsRow>

        {/* CONTENT */}
        <S.TreeContainer style={{ padding: isMobile ? "0 16px 80px 16px" : undefined }}>
          {isLoading ? (
            <SettingsListSkeleton />
          ) : categoryTreeRoots.length === 0 ? (
            <EmptyState
              isFullPage={false}
              icon={<HiTag />}
              title={t("categories:categoriesPage.status_not_found")}
            />
          ) : (
            <CategoryTree
              categories={categoryTreeRoots}
              defaultExpandedIds={[]}
              onEdit={canManageStructure ? handleEdit : undefined}
              onDelete={canManageStructure ? handleDelete : undefined}
              showTypeBadge={true}
            />
          )}
        </S.TreeContainer>

        {isMobile && canManageStructure && (
          <FAB
            onClick={() => {
              handleCreateClick();
              open("create-category");
            }}
          />
        )}
      </S.PageWrapper>

      {/* --- MODALS --- */}

      {/* 1. Create */}
      <Modal.Window name="create-category" mobileBottomSheet>
        <S.ModalContent>
          <S.ModalTitle>{t("categories:categoriesPage.modal_create_title")}</S.ModalTitle>
          <CategoryForm
            categories={flatCategories}
            isLoading={isCreateLoading}
            buttonLabel={t("categories:categoriesPage.form_create_button")}
            onSubmit={handleSave}
          />
        </S.ModalContent>
      </Modal.Window>

      {/* 2. Edit */}
      <Modal.Open opens="copy-on-write-category">
        <span id="trigger-copy-on-write-category" style={{ display: "none" }} />
      </Modal.Open>
      <Modal.Window name="copy-on-write-category" padding="1.5rem" mobileBottomSheet>
        <S.ModalContent>
          <div style={{ display: "flex", gap: "0.85rem", alignItems: "flex-start" }}><div style={{ width: "2.4rem", height: "2.4rem", display: "grid", placeItems: "center", flex: "0 0 2.4rem", borderRadius: "0.75rem", background: "var(--color-brand-50)", color: "var(--color-brand-700)" }}><HiExclamationTriangle size={20} /></div><div><S.ModalTitle style={{ margin: "0 0 0.35rem" }}>Змінити системну категорію?</S.ModalTitle><p style={{ margin: 0, color: "var(--color-text-secondary)", lineHeight: 1.55 }}>Після збереження «<strong style={{ color: "var(--color-text-main)" }}>{copyOnWriteCategory?.name}</strong>» стане локальною категорією вашої сім’ї.</p></div></div>
          <div style={{ marginTop: "1rem", padding: ".75rem .9rem", borderRadius: "0.65rem", background: "var(--color-bg-page)", color: "var(--color-text-secondary)", fontSize: ".83rem", lineHeight: 1.45 }}>Вона більше не отримуватиме глобальні оновлення платформи.</div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
            <Button variation="secondary" onClick={close}>Скасувати</Button>
            <Button onClick={() => { close(); confirmCopyOnWrite(); }}>Продовжити</Button>
          </div>
        </S.ModalContent>
      </Modal.Window>
      <Modal.Open opens="edit-category">
        <span id="trigger-edit-category" style={{ display: "none" }} />
      </Modal.Open>
      <Modal.Window name="edit-category" mobileBottomSheet>
        <S.ModalContent>
          {editingCategory && (
            <>
              <S.ModalTitle>
                {t("categories:categoriesPage.modal_edit_title")}
              </S.ModalTitle>
              <CategoryForm
                initialData={editingCategory}
                categories={flatCategories}
                isLoading={isUpdateLoading}
                buttonLabel={t("categories:categoriesPage.form_edit_button")}
                onSubmit={handleSave}
              />
            </>
          )}
        </S.ModalContent>
      </Modal.Window>

      {/* 3. Delete */}
      <Modal.Open opens="delete-confirm">
        <span id="trigger-delete-confirm" style={{ display: "none" }} />
      </Modal.Open>
      <Modal.Window name="delete-confirm" mobileBottomSheet>
        <ConfirmDelete
          resourceName={editingCategory?.name}
          onConfirm={handleDeleteConfirm}
          disabled={isDeleteLoading}
        />
      </Modal.Window>
    </>
  );
}

export default Categories;
