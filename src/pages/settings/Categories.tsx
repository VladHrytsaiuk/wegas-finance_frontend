import { HiPlus, HiTag } from "react-icons/hi2";

// UI Components
import { Button } from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import ConfirmDelete from "../../components/ui/ConfirmDelete";
import { CategoryTree } from "../../components/categories/CategoryTree";
import { TableToolbar } from "../../components/shared/TableToolbar/TableToolbar";
import { CategoryForm } from "../../components/categories/CategoryForm";
import { EmptyState } from "../../components/ui/EmptyState";
import { CenteredSpinner } from "../../components/ui/CenteredSpinner";

// Styles & Logic
import * as S from "./Categories.styles";
import { useCategoriesPage } from "../../hooks/Categories/useCategoriesPage";

function Categories() {
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

  return (
    <Modal>
      <S.PageWrapper>
        {/* HEADER */}
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

        {/* TOOLBAR */}
        <S.ControlsRow>
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
        <S.TreeContainer>
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
      </S.PageWrapper>

      {/* --- MODALS --- */}

      {/* 1. Create */}
      <Modal.Window name="create-category">
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
      <Modal.Window name="edit-category">
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
      <Modal.Window name="delete-confirm">
        <ConfirmDelete
          resourceName={editingCategory?.name}
          onConfirm={handleDeleteConfirm}
          disabled={isDeleteLoading}
        />
      </Modal.Window>
    </Modal>
  );
}

export default Categories;
