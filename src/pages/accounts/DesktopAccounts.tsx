import { Link } from "react-router-dom";
// Force rebuild after hook rename
import { HiPlus } from "react-icons/hi2";
import { usePageTitle } from "../../hooks/usePageTitle";

// Components
import { Button } from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { AccountsGrid } from "../../components/accounts/AccountsGrid";
import { AccountsTable } from "../../components/accounts/AccountsTable";
import { ViewToggle } from "../../components/ui/ViewToggle";
import ConfirmDelete from "../../components/ui/ConfirmDelete";
import { TableToolbar } from "../../components/shared/TableToolbar/TableToolbar";
import { EmptyState } from "../../components/ui/EmptyState";
import { AccountsPageSkeleton } from "../../components/ui/Skeleton/LoadingSkeletons";
import { HiCreditCard } from "react-icons/hi2";

// Hook & Styles
import { useAccountsPage } from "../../hooks/Accounts/useAccountsPage";
import * as S from "./Accounts.styles";

function Accounts() {
  const {
    // Data & Status
    accounts,
    isLoading,
    isError,
    users,
    filteredAccounts,
    groupedAccounts,

    // Filter & Sort Logic
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    filters,
    handleFilterChange,
    handleClearAll,
    filtersConfig,
    sortOptions,

    // UI Helpers
    t,
    navigate,
    location,
    canManageStructure,

    // Delete Logic
    setIdToDelete,
    accountToDeleteName,
    handleDeleteConfirm,
    isDeleting,
  } = useAccountsPage();

  usePageTitle(t("navigation:general.accounts", "Рахунки"));

  if (isLoading)
    return <AccountsPageSkeleton viewMode={viewMode} />;
  if (isError)
    return <S.ErrorState>{t("accounts:accountsPage.status_error")}</S.ErrorState>;

  const hasNoAccountsAtAll = accounts.length === 0;

  return (
    <S.PageContainer>
      <Modal>
        <S.ControlsRow>
          <TableToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder={t("accounts:accountsPage.search_placeholder")}
            searchPosition="top"
            filtersConfig={filtersConfig}
            filterValues={filters}
            onFilterChange={handleFilterChange}
            sortOptions={sortOptions}
            sortValue={sortBy}
            onSortChange={setSortBy}
            onClearAll={handleClearAll}
          >
            <S.ControlsGroup>
              <ViewToggle view={viewMode} onChange={setViewMode} />

              {canManageStructure && (
                <Button
                  as={Link}
                  to="new"
                  state={{ background: location }}
                  size="medium"
                  icon={<HiPlus />}
                  style={{
                    width: "auto",
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t("accounts:accountsPage.button_add")}
                </Button>
              )}
            </S.ControlsGroup>
          </TableToolbar>
        </S.ControlsRow>

        {filteredAccounts.length === 0 ? (
          <EmptyState
            icon={<HiCreditCard />}
            title={
              hasNoAccountsAtAll
                ? t("accounts:accountsPage.status_empty")
                : t("common:common.no_results", "Нічого не знайдено")
            }
            description={
              hasNoAccountsAtAll
                ? t("accounts:accountsPage.status_empty_desc")
                : t("common:common.try_adjusting_search", "Спробуйте змінити параметри пошуку або фільтри")
            }
            action={
              hasNoAccountsAtAll && canManageStructure ? (
                <Button
                  as={Link}
                  to="new"
                  state={{ background: location }}
                  variation="primary"
                >
                  {t("accounts:accountsPage.button_add")}
                </Button>
              ) : !hasNoAccountsAtAll ? (
                <Button variation="secondary" onClick={handleClearAll}>
                  {t("common:common.clear_filters", "Очистити фільтри")}
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            {viewMode === "grid" ? (
              <AccountsGrid
                groupedAccounts={groupedAccounts}
                users={users}
                onDelete={(id) => setIdToDelete(id)}
                onClick={(id) => navigate(`/accounts/${id}`)}
                canManage={canManageStructure}
              />
            ) : (
              <AccountsTable
                accounts={filteredAccounts}
                users={users}
                onDelete={(id) => setIdToDelete(id)}
                onClick={(id) => navigate(`/accounts/${id}`)}
                canManage={canManageStructure}
              />
            )}
          </>
        )}

        <Modal.Window name="delete-confirm">
          <ConfirmDelete
            resourceName={t("accounts:accountsTable.delete_resource_name", {
              name: accountToDeleteName,
            })}
            onConfirm={handleDeleteConfirm}
            disabled={isDeleting}
          />
        </Modal.Window>
      </Modal>
    </S.PageContainer>
  );
}

export default Accounts;
