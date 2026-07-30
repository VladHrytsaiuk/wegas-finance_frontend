import { HiPlus, HiFolderPlus, HiOutlineUserGroup, HiExclamationTriangle } from "react-icons/hi2";

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
      copyOnWriteItem,
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
      confirmCopyOnWrite,
      handleCloseSelection,
    },
    t,
  } = useCounterpartiesPage();

  const isMobile = useIsMobile();
  const { open, close } = useModal();

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
        <Modal.Open opens="copy-on-write"><span id="trigger-copy-on-write" /></Modal.Open>
        <Modal.Window name="copy-on-write" padding="1.5rem" mobileBottomSheet>
          <div style={{ padding: 0, maxWidth: "32rem" }}>
            <div style={{ display: "flex", gap: ".85rem", alignItems: "flex-start" }}><div style={{ width: "2.4rem", height: "2.4rem", display: "grid", placeItems: "center", flex: "0 0 2.4rem", borderRadius: ".75rem", background: "var(--color-brand-50)", color: "var(--color-brand-700)" }}><HiExclamationTriangle size={20} /></div><div><h3 style={{ margin: "0 0 .35rem", color: "var(--color-text-main)" }}>Змінити системний запис?</h3><p style={{ margin: 0, color: "var(--color-text-secondary)", lineHeight: 1.55 }}>Після збереження «<strong style={{ color: "var(--color-text-main)" }}>{copyOnWriteItem?.name}</strong>» стане локальним записом сім’ї.</p></div></div>
            <div style={{ marginTop: "1rem", padding: ".75rem .9rem", borderRadius: ".65rem", background: "var(--color-bg-page)", color: "var(--color-text-secondary)", fontSize: ".83rem", lineHeight: 1.45 }}>Він більше не отримуватиме глобальні оновлення платформи.</div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: ".75rem", marginTop: "1rem" }}><Button variation="secondary" onClick={close}>Скасувати</Button><Button onClick={() => { close(); confirmCopyOnWrite(); }}>Продовжити</Button></div>
          </div>
        </Modal.Window>
      </S.PageWrapper>
    </>
  );
}

export default Counterparties;
