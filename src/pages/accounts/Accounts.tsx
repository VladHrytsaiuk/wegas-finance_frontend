import { Link } from "react-router-dom";
// Force rebuild after hook rename
import { HiPlus } from "react-icons/hi2";

// Components
import { Button } from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { AccountsGrid } from "../../components/accounts/AccountsGrid";
import { AccountsTable } from "../../components/accounts/AccountsTable";
import { ViewToggle } from "../../components/ui/ViewToggle";
import ConfirmDelete from "../../components/ui/ConfirmDelete";
import { TableToolbar } from "../../components/shared/TableToolbar/TableToolbar";

// Hook & Styles
import { useAccountsPage } from "../../hooks/Accounts/useAccountsPage";
import * as S from "./Accounts.styles";

function Accounts() {
  const {
    // Data & Status
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

  if (isLoading)
    return <S.LoadingState>{t("accounts:accountsPage.status_loading")}</S.LoadingState>;
  if (isError)
    return <S.ErrorState>{t("accounts:accountsPage.status_error")}</S.ErrorState>;

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
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    width: "auto",
                    textDecoration: "none",
                  }}
                >
                  <HiPlus style={{ width: "20px", height: "20px" }} />
                  <span>{t("accounts:accountsPage.button_add")}</span>
                </Button>
              )}
            </S.ControlsGroup>
          </TableToolbar>
        </S.ControlsRow>

        {filteredAccounts.length === 0 ? (
          <S.EmptyState>
            <S.EmptyStateIcon>💳</S.EmptyStateIcon>
            <div>{t("accounts:accountsPage.empty_title")}</div>
          </S.EmptyState>
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
