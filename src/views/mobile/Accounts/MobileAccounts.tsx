import styled from "styled-components";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { useAccountsPage } from "../../../hooks/Accounts/useAccountsPage";
import { EmptyState } from "../../../components/ui/EmptyState";
import { HiCreditCard, HiEllipsisVertical } from "react-icons/hi2";
import { FAB } from "../../../components/ui/FAB";
import { formatMoney } from "../../../utils/helpers";
import Modal from "../../../components/ui/Modal";
import ConfirmDelete from "../../../components/ui/ConfirmDelete";
import { MobileAccountsSkeleton } from "../../../components/ui/Skeleton/LoadingSkeletons";

const StyledMobileAccounts = styled.div`
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-page);
  min-height: 100vh;
  padding-bottom: 80px;
`;

const StickyHeader = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: var(--color-bg-surface);
  padding: 16px 20px;
  padding-top: max(16px, env(safe-area-inset-top));
  border-bottom: 1px solid var(--color-border);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const HeaderTitle = styled.h1`
  font-size: 20px;
  font-weight: 800;
  color: var(--color-text-main);
  letter-spacing: -0.5px;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
`;

const AccountCard = styled.div`
  background-color: var(--color-bg-surface);
  border-radius: 16px;
  padding: 16px;
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: var(--shadow-sm);
  position: relative;
`;

const AccountHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const AccountInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const AccountName = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-main);
`;

const AccountType = styled.div`
  font-size: 12px;
  color: var(--color-text-tertiary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const AccountBalance = styled.div`
  font-size: 20px;
  font-weight: 800;
  color: var(--color-brand-600);
`;

const MoreButton = styled.button`
  background: none;
  border: none;
  color: var(--color-text-tertiary);
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

function MobileAccounts() {
  const {
    accounts,
    isLoading,
    isError,
    filteredAccounts,
    t,
    navigate,
    location,
    canManageStructure,
    setIdToDelete,
    accountToDeleteName,
    handleDeleteConfirm,
    isDeleting,
  } = useAccountsPage();

  usePageTitle(t("navigation:general.accounts"));

  if (isLoading) return <MobileAccountsSkeleton />;
  if (isError)
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        {t("accounts:accountsPage.status_error")}
      </div>
    );

  const hasNoAccountsAtAll = accounts.length === 0;

  return (
    <Modal>
      <StyledMobileAccounts>
        <StickyHeader>
          <HeaderTitle>{t("navigation:general.accounts")}</HeaderTitle>
        </StickyHeader>

        <Content>
          {filteredAccounts.length === 0 ? (
            <EmptyState
              icon={<HiCreditCard />}
              title={
                hasNoAccountsAtAll
                  ? t("accounts:accountsPage.status_empty")
                  : t("common:common.no_results")
              }
              description={
                hasNoAccountsAtAll
                  ? t("accounts:accountsPage.status_empty_desc")
                  : t("common:common.try_adjusting_search")
              }
            />
          ) : (
            filteredAccounts.map((account) => (
              <AccountCard
                key={account.id}
                onClick={() => navigate(`/accounts/${account.id}`)}
              >
                <AccountHeader>
                  <AccountInfo>
                    <AccountType>
                      {account.type_name || account.type}
                    </AccountType>
                    <AccountName>{account.name}</AccountName>
                  </AccountInfo>
                  {canManageStructure && (
                    <MoreButton
                      onClick={(e) => {
                        e.stopPropagation();
                        setIdToDelete(account.id);
                      }}
                    >
                      <HiEllipsisVertical size={20} />
                    </MoreButton>
                  )}
                </AccountHeader>
                <AccountBalance>
                  {formatMoney(account.balance, account.currency)}
                </AccountBalance>
              </AccountCard>
            ))
          )}
        </Content>

        {canManageStructure && (
          <FAB
            onClick={() => navigate("new", { state: { background: location } })}
          />
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
      </StyledMobileAccounts>
    </Modal>
  );
}

export default MobileAccounts;
