import { HiPlus, HiTag } from "react-icons/hi2";

// UI Components
import { Button } from "../../components/ui/Button";
import Modal, { useModal } from "../../components/ui/Modal";
import ConfirmDelete from "../../components/ui/ConfirmDelete";
import { CategoryTree } from "../../components/categories/CategoryTree";
import { TableToolbar } from "../../components/shared/TableToolbar/TableToolbar";
import { CategoryForm } from "../../components/categories/CategoryForm";
import { EmptyState } from "../../components/ui/EmptyState";
import { CenteredSpinner } from "../../components/ui/CenteredSpinner";
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
      handleDelete,
      handleCreateClick,
      handleSave,
      handleDeleteConfirm,
      handleClearFilters,
    },
    t,
  } = useCategoriesPage();

  const isMobile = useIsMobile();
  const { open } = useModal();

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
            <CenteredSpinner isContainer />
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
