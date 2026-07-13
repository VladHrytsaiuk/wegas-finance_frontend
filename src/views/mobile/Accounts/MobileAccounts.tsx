import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import styled from "styled-components";
import toast from "react-hot-toast";
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
  HiOutlineBars3BottomLeft,
  HiOutlineUser,
  HiOutlineUsers,
  HiDocumentArrowUp,
} from "react-icons/hi2";
import { FAB } from "../../../components/ui/FAB";
import { formatMoney } from "../../../utils/helpers";
import Modal from "../../../components/ui/Modal";
import ConfirmDelete from "../../../components/ui/ConfirmDelete";
import { MobileAccountsSkeleton } from "../../../components/ui/Skeleton/LoadingSkeletons";
import CardSlider from "../../../components/mobile/CardSlider";
import ImportModal from "../../../components/import/ImportModal";
import { useUserRole } from "../../../hooks/useUserRole";
import { getTransactionsApi } from "../../../services/apiTransactions";
import { getCategoriesApi } from "../../../services/apiCategories";
import {
  type Account,
  updateMobileAccountsOrderApi,
} from "../../../services/apiAccounts";
import type { Category } from "../../../types";
import type { Transaction } from "../../../types";
import MobilePageHeader from "../../../components/mobile/MobilePageHeader";
import { TransactionItem } from "../../../components/transactions/TransactionItem";
import { useSettings } from "../../../context/SettingsContext";
import { getMeApi } from "../../../services/apiUsers";
import { sortAccountsByPreferredOrder } from "../../../utils/accountSorting";
import { MobileAccountsOrderModal } from "./MobileAccountsOrderModal";

type Scope = "personal" | "family";
type AccountTypeFilter = "all" | "card" | "cash" | "savings";
const MOBILE_SELECTED_ACCOUNT_KEY = "mobile_accounts_selected_account_id";

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

const HeaderActionButton = styled.button`
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-page);
  color: var(--color-text-main);
  display: inline-flex;
  align-items: center;
  justify-content: center;
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

const QuickActionsGrid = styled.div<{ $cols?: number }>`
  display: grid;
  grid-template-columns: repeat(${(props) => props.$cols || 3}, minmax(0, 1fr));
  gap: 8px;
`;

const QuickAction = styled.button<{ $tone: "income" | "expense" | "transfer" | "import" }>`
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
            : props.$tone === "import"
              ? "var(--color-purple-50)"
              : "rgba(148, 163, 184, 0.14)"};
    color: ${(props) =>
      props.$tone === "income"
        ? "var(--color-brand-700)"
        : props.$tone === "expense"
          ? "var(--color-red-700)"
          : props.$tone === "transfer"
            ? "var(--color-blue-700)"
            : props.$tone === "import"
              ? "var(--color-purple-600)"
              : "var(--color-text-secondary)"};
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
  const queryClient = useQueryClient();
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
  const { currency, language } = useSettings();
  const [scope, setScope] = useState<Scope>("personal");
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<AccountTypeFilter>("all");
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return window.sessionStorage.getItem(MOBILE_SELECTED_ACCOUNT_KEY);
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: getCategoriesApi,
    staleTime: 5 * 60 * 1000,
  });
  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: getMeApi,
    staleTime: 5 * 60 * 1000,
  });

  const [draftOrderedAccounts, setDraftOrderedAccounts] = useState<Account[]>([]);

  usePageTitle(t("navigation:general.accounts"));

  const mobileOrderIds = useMemo(() => {
    if (!me?.mobile_accounts_order) return [];

    try {
      const parsed = JSON.parse(me.mobile_accounts_order);
      return Array.isArray(parsed)
        ? parsed.filter((value): value is string => typeof value === "string")
        : [];
    } catch {
      return [];
    }
  }, [me?.mobile_accounts_order]);

  const orderedAccounts = useMemo(
    () => sortAccountsByPreferredOrder(accounts, mobileOrderIds),
    [accounts, mobileOrderIds],
  );

  const hasNoAccountsAtAll = orderedAccounts.length === 0;

  const personalAccounts = useMemo(
    () =>
      user
        ? orderedAccounts.filter((account) => account.user_id === user.id)
        : orderedAccounts,
    [orderedAccounts, user],
  );

  const familyAccounts = useMemo(
    () =>
      user
        ? orderedAccounts.filter((account) => account.user_id !== user.id)
        : [],
    [orderedAccounts, user],
  );

  const ownerNames = useMemo(
    () =>
      users.reduce<Record<string, string>>((acc, candidate) => {
        acc[candidate.id] = candidate.name;
        return acc;
      }, {}),
    [users],
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
    return orderedAccounts;
  }, [canUseFamilyScope, familyAccounts, orderedAccounts, personalAccounts, scope, selectedOwnerId]);

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

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (selectedAccountId) {
      window.sessionStorage.setItem(
        MOBILE_SELECTED_ACCOUNT_KEY,
        selectedAccountId,
      );
    } else {
      window.sessionStorage.removeItem(MOBILE_SELECTED_ACCOUNT_KEY);
    }
  }, [selectedAccountId]);

  const selectedAccount = useMemo(
    () => scopedAccounts.find((account) => account.id === selectedAccountId) || null,
    [scopedAccounts, selectedAccountId],
  );

  const isImportSupported = useMemo(() => {
    if (!selectedAccount || selectedAccount.type !== "card") return false;
    const name = selectedAccount.name?.toLowerCase() || "";
    const icon = selectedAccount.icon?.toLowerCase() || "";
    const bankName = selectedAccount.bank_name?.toLowerCase() || "";
    return ["privat", "monobank"].some((bank) =>
      name.includes(bank) || icon.includes(bank) || bankName.includes(bank)
    );
  }, [selectedAccount]);

  const sliderAccounts = useMemo(
    () =>
      scopedAccounts.map((account) => ({
        ...account,
        owner_name: ownerNames[account.user_id] || undefined,
      })),
    [ownerNames, scopedAccounts],
  );

  const saveMobileOrder = useMutation({
    mutationFn: updateMobileAccountsOrderApi,
    onSuccess: (_, orderedIds) => {
      queryClient.setQueryData(["me"], (current: { mobile_accounts_order?: string } | undefined) => {
        if (!current) return current;
        return {
          ...current,
          mobile_accounts_order: JSON.stringify(orderedIds),
        };
      });
      toast.success("Порядок рахунків збережено");
    },
    onError: () => {
      toast.error("Не вдалося зберегти порядок рахунків");
    },
  });

  const isOrderDirty = useMemo(() => {
    if (!draftOrderedAccounts.length || draftOrderedAccounts.length !== scopedAccountsBase.length) {
      return false;
    }

    return draftOrderedAccounts.some(
      (account, index) => account.id !== scopedAccountsBase[index]?.id,
    );
  }, [draftOrderedAccounts, scopedAccountsBase]);

  const handleSaveOrder = async () => {
    const scopeIds = new Set(scopedAccountsBase.map((account) => account.id));
    const reorderedScopeIds = draftOrderedAccounts.map((account) => account.id);
    let reorderedIndex = 0;

    const mergedOrderIds = orderedAccounts.map((account) => {
      if (!scopeIds.has(account.id)) return account.id;
      const nextId = reorderedScopeIds[reorderedIndex];
      reorderedIndex += 1;
      return nextId || account.id;
    });

    try {
      await saveMobileOrder.mutateAsync(mergedOrderIds);
      return true;
    } catch {
      return false;
    }
  };

  const {
    data: recentRes,
    isLoading: isRecentLoading,
    isError: isRecentError,
  } = useQuery({
    queryKey: ["transactions", selectedAccount?.id, "recent-mobile"],
    queryFn: () =>
      getTransactionsApi({
        account_id: selectedAccount!.id,
        limit: 5,
        page: 1,
        sort: "date-desc",
      }),
    enabled: !!selectedAccount?.id,
  });

  const recentTransactions = Array.isArray(recentRes)
    ? recentRes
    : recentRes?.data || [];

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
            <>
              {scopedAccountsBase.length > 1 && (
                <Modal.Open opens="accounts-order">
                  <HeaderActionButton
                    onClick={() => setDraftOrderedAccounts(scopedAccountsBase)}
                    aria-label="Порядок рахунків"
                    title="Порядок рахунків"
                  >
                    <HiOutlineBars3BottomLeft size={18} />
                  </HeaderActionButton>
                </Modal.Open>
              )}

              {canUseFamilyScope ? (
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
              ) : null}
            </>
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
                      onCardClick={(accountId) => {
                        setSelectedAccountId(accountId);
                        navigate(`/accounts/${accountId}`);
                      }}
                    />
                  </Section>

                  {selectedAccount && (
                    <Section>
                      <QuickActionsGrid $cols={isImportSupported && !selectedAccount.is_synced ? 4 : 3}>
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
                        
                        {isImportSupported && !selectedAccount.is_synced && (
                          <Modal.Open opens="import-modal">
                            <QuickAction $tone="import">
                              <div className="icon">
                                <HiDocumentArrowUp size={20} />
                              </div>
                              <div className="title">
                                {t("accounts:accountDetailsPage.action_import_button", "Імпорт")}
                              </div>
                            </QuickAction>
                          </Modal.Open>
                        )}
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
                        ) : isRecentError || recentItems.length === 0 ? (
                          <InlineEmpty>
                            <HiOutlineClock />
                            <span>
                              {isRecentError
                                ? t("common:ui.error_loading", "Завантаження не вдалося")
                                : t("dashboard:recentTransactions.status_empty")}
                            </span>
                          </InlineEmpty>
                        ) : (
                          <SimpleRecentList>
                            {recentItems.map((tx) => (
                              <TransactionItem
                                key={tx.id}
                                transaction={tx}
                                categories={categories}
                                accounts={orderedAccounts}
                                currency={currency}
                                language={language}
                                isWidget={true}
                                hideAccountColumn={true}
                                hideCategory={true}
                                onClick={() => navigate(`/transactions/${tx.id}`)}
                              />
                            ))}
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
            onClick={() =>
              navigate("new", {
                state: { background: location },
                replace: true,
              })
            }
          />
        )}

        <Modal.Window name="delete-confirm">
          <ConfirmDelete
            resourceName={t("accounts:accountsTable.delete_resource_name", {
              name: accountToDeleteName,
            })}
            disabled={isDeleting}
            onConfirm={handleDeleteConfirm}
            onClose={() => setIdToDelete("")}
          />
        </Modal.Window>
        
        {selectedAccount && (
          <Modal.Window name="import-modal" padding="0">
            <ImportModal account={selectedAccount} />
          </Modal.Window>
        )}

        <Modal.Window name="accounts-order" mobileBottomSheet padding="1.25rem 1rem 1.5rem">
          <MobileAccountsOrderModal
            accounts={draftOrderedAccounts}
            ownerNames={ownerNames}
            isDirty={isOrderDirty}
            isSaving={saveMobileOrder.isPending}
            onSave={handleSaveOrder}
            onReorder={setDraftOrderedAccounts}
          />
        </Modal.Window>
      </StyledMobileAccounts>
    </Modal>
  );
}

export default MobileAccounts;
