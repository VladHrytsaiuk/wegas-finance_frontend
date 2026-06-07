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
import { CenteredSpinner } from "../../components/ui/CenteredSpinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { HiCreditCard } from "react-icons/hi2";

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
    return (
      <CenteredSpinner
        isContainer
        message={t("accounts:accountsPage.status_loading", "Завантаження рахунків...")}
      />
    );
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
            title={t("accounts:accountsPage.empty_title")}
            description={t("accounts:accountsPage.empty_description", "Створіть свій перший рахунок, щоб почати відстежувати фінанси")}
            action={
              canManageStructure ? (
                <Button
                  as={Link}
                  to="new"
                  state={{ background: location }}
                  variation="primary"
                >
                  {t("accounts:accountsPage.button_add")}
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
