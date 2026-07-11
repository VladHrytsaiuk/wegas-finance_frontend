import { HiPlus, HiFolderPlus, HiOutlineUserGroup } from "react-icons/hi2";

// UI Components
import { Button } from "../../components/ui/Button";
import Modal, { useModal } from "../../components/ui/Modal";
import { CounterpartyTree } from "../../components/counterparties/CounterpartyTree";
import { TableToolbar } from "../../components/shared/TableToolbar/TableToolbar";
import { CounterpartyModals } from "../../components/counterparties/CounterpartyModals";
import { SettingsListSkeleton } from "../../components/ui/Skeleton/LoadingSkeletons";
import { EmptyState } from "../../components/ui/EmptyState";

// Styles & Logic
import * as S from "./Counterparties.styles";
import { useCounterpartiesPage } from "../../hooks/Counterparties/useCounterpartiesPage";
import { useIsMobile } from "../../hooks/useIsMobile";
import MobilePageHeader from "../../components/mobile/MobilePageHeader";
import { FAB } from "../../components/ui/FAB";

function Counterparties() {
  return (
    <Modal>
      <CounterpartiesContent />
    </Modal>
  );
}

function CounterpartiesContent() {
  const {
    state: {
      treeRoots,
      isLoading,
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

  const isMobile = useIsMobile();
  const { open } = useModal();

  return (
    <>
      {isMobile && <MobilePageHeader title={t("counterparties:counterpartiesPage.title")} />}
      <S.PageWrapper style={{ padding: isMobile ? "0" : undefined }}>
        {/* --- Header --- */}
        {!isMobile && (
          <S.HeaderRow>
            <S.Title>{t("counterparties:counterpartiesPage.title")}</S.Title>
            <S.HeaderActions>
              {canManageStructure && (
                <>
                  <Modal.Open opens="create-cat">
                    <Button
                      icon={<HiFolderPlus />}
                      variation="secondary"
                      size="medium"
                    >
                      {t("counterparties:counterpartiesPage.add_category_button")}
                    </Button>
                  </Modal.Open>
                  <Modal.Open opens="create-cp">
                    <Button icon={<HiPlus />} size="medium">
                      {t("counterparties:counterpartiesPage.add_counterparty_button")}
                    </Button>
                  </Modal.Open>
                </>
              )}
            </S.HeaderActions>
          </S.HeaderRow>
        )}

        {/* --- Toolbar --- */}
        <S.ControlsRow style={{ padding: isMobile ? "12px 16px" : undefined }}>
          <TableToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder={t("counterparties:counterpartiesPage.search_placeholder")}
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

        {/* --- Tree Content --- */}
        <S.TreeContainer style={{ padding: isMobile ? "0 16px 80px 16px" : undefined }}>
          {isLoading ? (
            <SettingsListSkeleton />
          ) : treeRoots.length === 0 ? (
            <EmptyState
              isFullPage={false}
              icon={<HiOutlineUserGroup />}
              title={t("counterparties:counterpartiesPage.status_not_found")}
            />
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

        {isMobile && canManageStructure && (
          <FAB 
            actions={[
              {
                icon: <HiFolderPlus />,
                label: t("counterparties:counterpartiesPage.add_category_button"),
                onClick: () => open("create-cat")
              },
              {
                icon: <HiPlus />,
                label: t("counterparties:counterpartiesPage.add_counterparty_button"),
                onClick: () => open("create-cp")
              }
            ]}
          />
        )}

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
    </>
  );
}

export default Counterparties;
