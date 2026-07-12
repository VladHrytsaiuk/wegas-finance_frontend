import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { useAccountsPage } from "../../../hooks/Accounts/useAccountsPage";
import { EmptyState } from "../../../components/ui/EmptyState";
import {
  HiArrowDownTray,
  HiArrowUpTray,
  HiArrowsRightLeft,
  HiChevronRight,
  HiCreditCard,
  HiOutlineClock,
  HiOutlineBanknotes,
  HiOutlineUser,
  HiOutlineUsers,
} from "react-icons/hi2";
import { FAB } from "../../../components/ui/FAB";
import { formatMoney } from "../../../utils/helpers";
import Modal from "../../../components/ui/Modal";
import ConfirmDelete from "../../../components/ui/ConfirmDelete";
import { MobileAccountsSkeleton } from "../../../components/ui/Skeleton/LoadingSkeletons";
import CardSlider from "../../../components/mobile/CardSlider";
import { useUserRole } from "../../../hooks/useUserRole";
import { getTransactionsApi } from "../../../services/apiTransactions";
import type { Account } from "../../../services/apiAccounts";
import type { Transaction } from "../../../types";
import MobilePageHeader from "../../../components/mobile/MobilePageHeader";

type Scope = "personal" | "family";
type AccountTypeFilter = "all" | "card" | "cash" | "savings";

const StyledMobileAccounts = styled.div`
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-page);
  min-height: 100vh;
  padding-bottom: 80px;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const HeaderScopeToggle = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px;
  border-radius: 999px;
  background: var(--color-bg-page);
  border: 1px solid var(--color-border);
`;

const HeaderScopeButton = styled.button<{ $active: boolean }>`
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: none;
  background: ${(props) =>
    props.$active ? "var(--color-brand-600)" : "transparent"};
  color: ${(props) =>
    props.$active ? "var(--color-white)" : "var(--color-text-secondary)"};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const OwnerChips = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const OwnerChip = styled.button<{ $active: boolean }>`
  border: 1px solid
    ${(props) => (props.$active ? "var(--color-brand-500)" : "var(--color-border)")};
  background: ${(props) =>
    props.$active ? "var(--color-brand-50)" : "var(--color-bg-surface)"};
  color: ${(props) =>
    props.$active ? "var(--color-brand-700)" : "var(--color-text-secondary)"};
  border-radius: 999px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
`;

const TypeFilters = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const TypeFilterChip = styled.button<{ $active: boolean }>`
  border: 1px solid
    ${(props) => (props.$active ? "var(--color-brand-500)" : "var(--color-border)")};
  background: ${(props) =>
    props.$active ? "var(--color-brand-50)" : "var(--color-bg-surface)"};
  color: ${(props) =>
    props.$active ? "var(--color-brand-700)" : "var(--color-text-secondary)"};
  border-radius: 999px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const SectionTitleWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 17px;
  line-height: 1.2;
  font-weight: 800;
  color: var(--color-text-main);
`;

const GhostButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: none;
  background: transparent;
  color: var(--color-brand-700);
  font-size: 13px;
  font-weight: 700;
  padding: 0;
  cursor: pointer;
`;

const QuickActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
`;

const QuickAction = styled.button<{ $tone: "income" | "expense" | "transfer" }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 6px 9px;
  min-height: 72px;
  border-radius: 16px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-surface);
  color: var(--color-text-main);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  text-align: center;

  .icon {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${(props) =>
      props.$tone === "income"
        ? "var(--color-brand-50)"
        : props.$tone === "expense"
          ? "var(--color-red-100)"
          : props.$tone === "transfer"
            ? "var(--color-blue-50)"
            : "rgba(148, 163, 184, 0.14)"};
    color: ${(props) =>
      props.$tone === "income"
        ? "var(--color-brand-700)"
        : props.$tone === "expense"
          ? "var(--color-red-700)"
          : "var(--color-blue-700)"};
  }

  .title {
    font-size: 11px;
    font-weight: 800;
    line-height: 1.1;
  }
`;

const RecentCard = styled.div`
  border-radius: 22px;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
`;

const SimpleRecentList = styled.div`
  display: flex;
  flex-direction: column;
`;

const SimpleRecentRow = styled.button`
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 16px;
  border: none;
  border-bottom: 1px solid var(--color-border);
  background: transparent;
  text-align: left;
  cursor: pointer;

  &:last-child {
    border-bottom: none;
  }
`;

const SimpleRecentIcon = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-page);
  color: var(--color-brand-700);
`;

const SimpleRecentText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;

  .title {
    font-size: 14px;
    font-weight: 700;
    color: var(--color-text-main);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .meta {
    font-size: 12px;
    color: var(--color-text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const SimpleRecentAmount = styled.div<{ $negative?: boolean }>`
  font-size: 14px;
  font-weight: 800;
  color: ${(props) =>
    props.$negative ? "var(--color-red-700)" : "var(--color-brand-700)"};
  white-space: nowrap;
`;

const InlineEmpty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px 16px;
  color: var(--color-text-secondary);
  text-align: center;

  svg {
    width: 28px;
    height: 28px;
    color: var(--color-text-tertiary);
  }
`;

function MobileAccounts() {
  const {
    accounts,
    users,
    isLoading,
    isError,
    t,
    navigate,
    location,
    canManageStructure,
    setIdToDelete,
    accountToDeleteName,
    handleDeleteConfirm,
    isDeleting,
  } = useAccountsPage();
  const { user, isStartupper } = useUserRole();
  const [scope, setScope] = useState<Scope>("personal");
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<AccountTypeFilter>("all");
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  usePageTitle(t("navigation:general.accounts"));

  const hasNoAccountsAtAll = accounts.length === 0;

  const personalAccounts = useMemo(
    () => (user ? accounts.filter((account) => account.user_id === user.id) : accounts),
    [accounts, user],
  );

  const familyAccounts = useMemo(
    () => (user ? accounts.filter((account) => account.user_id !== user.id) : []),
    [accounts, user],
  );

  const familyOwners = useMemo(() => {
    const ownerIds = new Set(familyAccounts.map((account) => account.user_id));
    return users.filter((candidate) => ownerIds.has(candidate.id));
  }, [familyAccounts, users]);

  const canUseFamilyScope = familyOwners.length > 0 && !isStartupper;

  const scopedAccountsBase = useMemo(() => {
    if (scope === "family" && canUseFamilyScope) {
      if (selectedOwnerId === "all") return familyAccounts;
      return familyAccounts.filter((account) => account.user_id === selectedOwnerId);
    }

    if (personalAccounts.length > 0) return personalAccounts;
    return accounts;
  }, [accounts, canUseFamilyScope, familyAccounts, personalAccounts, scope, selectedOwnerId]);

  const scopedAccounts = useMemo(() => {
    if (typeFilter === "all") return scopedAccountsBase;

    return scopedAccountsBase.filter((account) => {
      const normalizedType =
        account.type === "piggy_bank" ? "savings" : account.type;
      return normalizedType === typeFilter;
    });
  }, [scopedAccountsBase, typeFilter]);

  useEffect(() => {
    if (scope === "personal") setSelectedOwnerId("all");
  }, [scope]);

  useEffect(() => {
    if (!canUseFamilyScope && scope !== "personal") {
      setScope("personal");
      setSelectedOwnerId("all");
    }
  }, [canUseFamilyScope, scope]);

  useEffect(() => {
    const availableTypes = new Set(
      scopedAccountsBase.map((account) =>
        account.type === "piggy_bank" ? "savings" : account.type,
      ),
    );

    if (typeFilter !== "all" && !availableTypes.has(typeFilter)) {
      setTypeFilter("all");
    }
  }, [scopedAccountsBase, typeFilter]);

  useEffect(() => {
    if (!scopedAccounts.length) {
      setSelectedAccountId(null);
      return;
    }

    const stillExists = scopedAccounts.some((account) => account.id === selectedAccountId);
    if (!stillExists) {
      setSelectedAccountId(scopedAccounts[0].id);
    }
  }, [scopedAccounts, selectedAccountId]);

  const selectedAccount = useMemo(
    () => scopedAccounts.find((account) => account.id === selectedAccountId) || null,
    [scopedAccounts, selectedAccountId],
  );

  const sliderAccounts = useMemo(
    () =>
      scopedAccounts.map((account) => ({
        ...account,
        owner_name:
          users.find((candidate) => candidate.id === account.user_id)?.name || undefined,
      })),
    [scopedAccounts, users],
  );

  const { data: recentTxResponse, isLoading: isRecentLoading } = useQuery({
    queryKey: ["transactions", selectedAccount?.id, "mobile-preview"],
    queryFn: () =>
      getTransactionsApi({
        account_id: selectedAccount!.id,
        limit: 4,
      }),
    enabled: !!selectedAccount?.id,
  });

  const recentTransactions = Array.isArray(recentTxResponse)
    ? recentTxResponse
    : recentTxResponse?.data || [];

  const recentItems = useMemo(
    () => (recentTransactions as Transaction[]).slice(0, 3),
    [recentTransactions],
  );

  const hasMoreThanThree = recentTransactions.length > 3;

  const openTransactionModal = (type: "income" | "expense" | "transfer") => {
    if (!selectedAccount) return;

    navigate(`/transactions/new?type=${type}&accountId=${selectedAccount.id}`, {
      state: { background: location },
    });
  };

  if (isLoading) return <MobileAccountsSkeleton />;
  if (isError)
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        {t("accounts:accountsPage.status_error")}
      </div>
    );

  return (
    <Modal>
      <StyledMobileAccounts>
        <MobilePageHeader
          title={t("navigation:general.accounts")}
          onBack={() => navigate(-1)}
          rightAction={
            canUseFamilyScope ? (
              <HeaderScopeToggle>
                <HeaderScopeButton
                  $active={scope === "personal"}
                  onClick={() => setScope("personal")}
                  title={t("dashboard:mobile.personal", "Мої")}
                >
                  <HiOutlineUser size={18} />
                </HeaderScopeButton>
                <HeaderScopeButton
                  $active={scope === "family"}
                  onClick={() => setScope("family")}
                  title={t("dashboard:mobile.family", "Родина")}
                >
                  <HiOutlineUsers size={18} />
                </HeaderScopeButton>
              </HeaderScopeToggle>
            ) : null
          }
        />

        <Content>
          {hasNoAccountsAtAll ? (
            <EmptyState
              icon={<HiCreditCard />}
              title={t("accounts:accountsPage.status_empty")}
              description={t("accounts:accountsPage.status_empty_desc")}
            />
          ) : (
            <>
              {scope === "family" && canUseFamilyScope && familyOwners.length > 0 && (
                <OwnerChips>
                  <OwnerChip
                    $active={selectedOwnerId === "all"}
                    onClick={() => setSelectedOwnerId("all")}
                  >
                    {t("common:common.all", "Усі")}
                  </OwnerChip>
                  {familyOwners.map((member) => (
                    <OwnerChip
                      key={member.id}
                      $active={selectedOwnerId === member.id}
                      onClick={() => setSelectedOwnerId(member.id)}
                    >
                      {member.name}
                    </OwnerChip>
                  ))}
                </OwnerChips>
              )}

              <TypeFilters>
                <TypeFilterChip
                  $active={typeFilter === "all"}
                  onClick={() => setTypeFilter("all")}
                >
                  {t("common:common.all", "Усі")}
                </TypeFilterChip>
                {scopedAccountsBase.some((account) => account.type === "card") && (
                  <TypeFilterChip
                    $active={typeFilter === "card"}
                    onClick={() => setTypeFilter("card")}
                  >
                    {t("accounts:accountsTable.type_card", "Картки")}
                  </TypeFilterChip>
                )}
                {scopedAccountsBase.some((account) => account.type === "cash") && (
                  <TypeFilterChip
                    $active={typeFilter === "cash"}
                    onClick={() => setTypeFilter("cash")}
                  >
                    {t("accounts:accountsTable.type_cash", "Готівка")}
                  </TypeFilterChip>
                )}
                {scopedAccountsBase.some(
                  (account) => account.type === "piggy_bank" || account.type === "savings",
                ) && (
                  <TypeFilterChip
                    $active={typeFilter === "savings"}
                    onClick={() => setTypeFilter("savings")}
                  >
                    {t("accounts:accountsTable.type_savings", "Скарбнички")}
                  </TypeFilterChip>
                )}
              </TypeFilters>

              {scopedAccounts.length === 0 ? (
                <EmptyState
                  icon={<HiCreditCard />}
                  title={t("accounts:accountsPage.status_empty", "Немає рахунків")}
                  description={t("accounts:accountsPage.status_empty_desc")}
                  compact={false}
                />
              ) : (
                <>
                  <Section>
                    <CardSlider
                      accounts={sliderAccounts}
                      activeAccountId={selectedAccount?.id || null}
                      onAccountChange={setSelectedAccountId}
                      onCardClick={(accountId) => navigate(`/accounts/${accountId}`)}
                    />
                  </Section>

                  {selectedAccount && (
                    <Section>
                      <QuickActionsGrid>
                        <QuickAction $tone="income" onClick={() => openTransactionModal("income")}>
                          <div className="icon">
                            <HiArrowDownTray size={20} />
                          </div>
                          <div className="title">
                            {t("accounts:accountDetailsPage.action_income_button")}
                          </div>
                        </QuickAction>

                        <QuickAction $tone="expense" onClick={() => openTransactionModal("expense")}>
                          <div className="icon">
                            <HiArrowUpTray size={20} />
                          </div>
                          <div className="title">
                            {t("accounts:accountDetailsPage.action_expense_button")}
                          </div>
                        </QuickAction>

                        <QuickAction
                          $tone="transfer"
                          onClick={() => openTransactionModal("transfer")}
                        >
                          <div className="icon">
                            <HiArrowsRightLeft size={20} />
                          </div>
                          <div className="title">
                            {t("accounts:accountDetailsPage.action_transfer", "Переказ")}
                          </div>
                        </QuickAction>
                      </QuickActionsGrid>
                    </Section>
                  )}

                  {selectedAccount && (
                    <Section>
                      <SectionHeader>
                        <SectionTitle>
                          {t("dashboard:recentTransactions.title", "Останні операції")}
                        </SectionTitle>
                        {hasMoreThanThree && (
                          <GhostButton onClick={() => navigate(`/transactions?account=${selectedAccount.id}`)}>
                            {t("common:common.all", "Усі")}
                            <HiChevronRight size={16} />
                          </GhostButton>
                        )}
                      </SectionHeader>

                      <RecentCard>
                        {isRecentLoading ? (
                          <InlineEmpty>
                            <HiOutlineClock />
                            <span>{t("dashboard:recentTransactions.status_loading")}</span>
                          </InlineEmpty>
                        ) : recentItems.length === 0 ? (
                          <InlineEmpty>
                            <HiOutlineClock />
                            <span>{t("dashboard:recentTransactions.status_empty")}</span>
                          </InlineEmpty>
                        ) : (
                          <SimpleRecentList>
                            {recentItems.map((tx) => {
                              const isNegative = [
                                "expense",
                                "transfer_out",
                                "loan_give",
                                "debt_repay",
                                "utility_payment",
                              ].includes(tx.type || "");
                              const title =
                                tx.counterparty?.name ||
                                tx.category?.name ||
                                tx.note ||
                                t("transactions:transactionsTable.default_category");
                              const meta = new Date(tx.date).toLocaleString("uk-UA", {
                                day: "2-digit",
                                month: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              });

                              return (
                                <SimpleRecentRow
                                  key={tx.id}
                                  onClick={() => navigate(`/transactions/${tx.id}`)}
                                >
                                  <SimpleRecentIcon>
                                    <HiOutlineBanknotes size={20} />
                                  </SimpleRecentIcon>
                                  <SimpleRecentText>
                                    <span className="title">{title}</span>
                                    <span className="meta">{meta}</span>
                                  </SimpleRecentText>
                                  <SimpleRecentAmount $negative={isNegative}>
                                    {isNegative ? "- " : "+ "}
                                    {formatMoney(
                                      Math.abs(Number(tx.amount) || 0),
                                      tx.account?.currency ||
                                        selectedAccount?.currency ||
                                        "UAH",
                                    )}
                                  </SimpleRecentAmount>
                                </SimpleRecentRow>
                              );
                            })}
                          </SimpleRecentList>
                        )}
                      </RecentCard>
                    </Section>
                  )}

                </>
              )}
            </>
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
