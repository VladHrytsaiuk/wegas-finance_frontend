import { HiPlus, HiFolderPlus } from "react-icons/hi2";

// UI Components
import { Button } from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { CounterpartyTree } from "../../components/counterparties/CounterpartyTree";
import { TableToolbar } from "../../components/shared/TableToolbar/TableToolbar";
import { CounterpartyModals } from "../../components/counterparties/CounterpartyModals";

// Styles & Logic
import * as S from "./Counterparties.styles";
import { useCounterpartiesPage } from "../../hooks/Counterparties/useCounterpartiesPage";

function Counterparties() {
  const {
    state: {
      treeRoots,
      isLoadingCps,
      searchQuery,
      filters,
      sortValue,
      selectedCp,
      selectedCat,
      itemToDelete,
      canManageStructure,
      actions,
    },
    configs: { filtersConfig, sortOptions },
    handlers: {
      setSearchQuery,
      setFilters,
      setSortValue,
      handleEditClick,
      handleDeleteClick,
      handleClearFilters,
      handleCloseSelection,
    },
    t,
  } = useCounterpartiesPage();

  return (
    <Modal>
      <S.PageWrapper>
        {/* --- Header --- */}
        <S.HeaderRow>
          <S.Title>{t("counterpartiesPage.title")}</S.Title>
          <S.HeaderActions>
            {canManageStructure && (
              <>
                <Modal.Open opens="create-cat">
                  <Button
                    icon={<HiFolderPlus />}
                    variation="secondary"
                    size="medium"
                  >
                    {t("counterpartiesPage.add_category_button")}
                  </Button>
                </Modal.Open>
                <Modal.Open opens="create-cp">
                  <Button icon={<HiPlus />} size="medium">
                    {t("counterpartiesPage.add_counterparty_button")}
                  </Button>
                </Modal.Open>
              </>
            )}
          </S.HeaderActions>
        </S.HeaderRow>

        {/* --- Toolbar --- */}
        <S.ControlsRow>
          <TableToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder={t("counterpartiesPage.search_placeholder")}
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

        {/* --- Tree Content --- */}
        <S.TreeContainer>
          {isLoadingCps ? (
            <S.EmptyState>
              {t("counterpartiesPage.status_loading")}
            </S.EmptyState>
          ) : treeRoots.length === 0 ? (
            <S.EmptyState>
              {t("counterpartiesPage.status_not_found")}
            </S.EmptyState>
          ) : (
            <CounterpartyTree
              nodes={treeRoots}
              defaultExpandedIds={["root_shops", "root_people", "root_other"]}
              onSelect={(cp) => {
                if (canManageStructure)
                  handleEditClick({ type: "item", data: cp });
              }}
              onEdit={canManageStructure ? handleEditClick : undefined}
              onDelete={canManageStructure ? handleDeleteClick : undefined}
            />
          )}
        </S.TreeContainer>

        {/* --- Hidden Triggers for programmatic modals --- */}
        <S.HiddenTriggers>
          <Modal.Open opens="edit-cat">
            <span id="trigger-edit-cat" />
          </Modal.Open>
          <Modal.Open opens="edit-cp">
            <span id="trigger-edit-cp" />
          </Modal.Open>
          <Modal.Open opens="delete-confirm">
            <span id="trigger-delete-confirm" />
          </Modal.Open>
        </S.HiddenTriggers>

        {/* --- All Modals --- */}
        <CounterpartyModals
          selectedCp={selectedCp}
          selectedCat={selectedCat}
          itemToDelete={itemToDelete}
          actions={actions}
          onCloseSelection={handleCloseSelection}
        />
      </S.PageWrapper>
    </Modal>
  );
}

export default Counterparties;
