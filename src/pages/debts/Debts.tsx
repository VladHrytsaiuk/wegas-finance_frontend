import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "../../hooks/usePageTitle";
import {
  HiPlus,
  HiArrowUpRight,
  HiArrowDownLeft,
  HiOutlineUser,
  HiWallet,
  HiChevronRight,
} from "react-icons/hi2";

// UI Components
import Spinner from "../../components/ui/Spinner";
import { CenteredSpinner } from "../../components/ui/CenteredSpinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { Button } from "../../components/ui/Button";
import { TableToolbar } from "../../components/shared/TableToolbar/TableToolbar";
import CreateTransactionModal from "../../components/transactions/CreateTransactionModal";
import { ViewToggle } from "../../components/ui/ViewToggle";
import { DebtsTable } from "../../components/debts/DebtsTable";
import { SmartIcon } from "../../utils/IconMap";

// Utils & Styles
import { formatMoney } from "../../utils/helpers";
import * as S from "./Debts.styles";
import { useDebtsPage, type DebtTotals } from "../../hooks/Debts/useDebtsPage";
import { useIsMobile } from "../../hooks/useIsMobile";
import { FAB } from "../../components/ui/FAB";

function Debts() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const {
    state: {
      isLoading,
      searchQuery,
      filterValues,
      debtors,
      creditors,
      settled,
      totalsOwedToMe,
      totalsIOwe,
      netBalances,
      viewMode,
    },
    config: { filtersConfig, sortOptions, sortValue },
    handlers: {
      handleSearchChange,
      handleSortChange,
      handleFilterChange,
      handleClearAll,
      setViewMode,
    },
    t,
  } = useDebtsPage();

  usePageTitle(t("navigation:general.debts", "Борги"));

  // --- LOCAL STATE FOR MODALS ---
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [selectedCpId, setSelectedCpId] = useState<string | null>(null);
  // 🔥 1. Додаємо стейт для суми
  const [selectedAmount, setSelectedAmount] = useState<number | undefined>(
    undefined,
  );

  const [txType, setTxType] = useState<string>("loan_give");

  const handleGlobalCreate = () => {
    setSelectedCpId(null);
    setSelectedAmount(undefined); // Скидаємо суму для нової транзакції
    setTxType("loan_give");
    setIsTxModalOpen(true);
  };

  // 🔥 2. Оновлюємо функцію, додаємо аргумент amount
  const onOpenTransaction = (
    cpId: string,
    type: "give" | "repay",
    context: "positive" | "negative",
    amount?: number, // <--- Додали
  ) => {
    setSelectedCpId(cpId);

    // Якщо це "repay" (повернення), підставляємо суму. Якщо "give" (дати ще) - поле пусте.
    if (type === "repay" && amount) {
      setSelectedAmount(Math.abs(amount));
    } else {
      setSelectedAmount(undefined);
    }

    if (context === "positive") {
      setTxType(type === "give" ? "loan_give" : "loan_repay");
    } else {
      setTxType(type === "give" ? "debt_take" : "debt_repay");
    }
    setIsTxModalOpen(true);
  };

  const closeTxModal = () => {
    setIsTxModalOpen(false);
    setSelectedCpId(null);
    setSelectedAmount(undefined); // Скидаємо при закритті
    // navigate("/debts"); // Це може ламати стейт при закритті модалки, якщо вона відкрита через background
  };

  // --- RENDERS ---
  const renderSummaryValues = (
    totals: DebtTotals,
    color: string,
    emptyText: string,
  ) => {
    const currencies = Object.keys(totals);
    if (currencies.length === 0)
      return <S.SummaryValue $color={color}>{emptyText}</S.SummaryValue>;
    return (
      <S.CurrencyList>
        {currencies.map((curr) => (
          <S.SummaryValue key={curr} $color={color}>
            <span>
              {formatMoney(totals[curr], curr).replace(curr, "").trim()}
            </span>
            <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>{curr}</span>
          </S.SummaryValue>
        ))}
      </S.CurrencyList>
    );
  };

  const renderNetBalance = () => {
    const currencies = Object.keys(netBalances);
    if (currencies.length === 0)
      return (
        <S.SummaryValue $color="var(--color-text-secondary)">
          0.00
        </S.SummaryValue>
      );
    return (
      <S.CurrencyList>
        {currencies.map((curr) => {
          const val = netBalances[curr];
          if (val === 0) return null;
          const color =
            val > 0 ? "var(--color-green-600)" : "var(--color-red-600)";
          return (
            <S.SummaryValue key={curr} $color={color}>
              <span>{formatMoney(val, curr).replace(curr, "").trim()}</span>
              <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>{curr}</span>
            </S.SummaryValue>
          );
        })}
      </S.CurrencyList>
    );
  };

  if (isLoading) return <CenteredSpinner />;

  return (
    <S.PageContainer>
      {/* SUMMARY CARDS */}
      {!searchQuery &&
        Object.keys(filterValues.currency).length === 0 &&
        (debtors.length > 0 || creditors.length > 0) && (
          <S.SummaryRow>
          <S.SummaryCard $type="positive">
            <S.SummaryLabel>
              <HiArrowUpRight size={16} /> {t("goals_debts:debtsPage.summary_owed_to_me")}
            </S.SummaryLabel>
            {renderSummaryValues(
              totalsOwedToMe,
              "var(--color-green-600)",
              "0.00",
            )}
          </S.SummaryCard>

          <S.SummaryCard $type="negative">
            <S.SummaryLabel>
              <HiArrowDownLeft size={16} /> {t("goals_debts:debtsPage.summary_i_owe")}
            </S.SummaryLabel>
            {renderSummaryValues(totalsIOwe, "var(--color-red-600)", "0.00")}
          </S.SummaryCard>

          <S.SummaryCard $type="neutral">
            <S.SummaryLabel>
              <HiWallet size={16} /> {t("goals_debts:debtsPage.summary_balance")}
            </S.SummaryLabel>
            {renderNetBalance()}
          </S.SummaryCard>
        </S.SummaryRow>
      )}

      {/* TOOLBAR */}
      <TableToolbar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        searchPlaceholder={t("counterparties:counterpartiesPage.search_placeholder")}
        filtersConfig={filtersConfig}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        sortOptions={sortOptions}
        sortValue={sortValue}
        onSortChange={handleSortChange}
        onClearAll={handleClearAll}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <ViewToggle view={viewMode} onChange={setViewMode} />
          {!isMobile && (
            <Button
              variation="primary"
              size="medium"
              onClick={handleGlobalCreate}
              icon={<HiPlus />}
              style={{ whiteSpace: "nowrap" }}
            >
              {t("transactions:transactionsPage.button_add")}
            </Button>
          )}
        </div>
      </TableToolbar>

      {/* LIST SECTIONS */}
      {(debtors.length > 0 || creditors.length > 0 || settled.length > 0) && (
        <>
          {viewMode === "grid" ? (
            <S.SectionsContainer>
              {/* POSITIVE (DEBTORS) */}
              {debtors.length > 0 && (
                <S.Section>
                  <S.SectionHeader>
                    <S.SectionTitle>
                      <HiArrowUpRight color="var(--color-green-600)" />
                      {t("goals_debts:debtsPage.section_positive")}
                    </S.SectionTitle>
                    <S.Badge $type="green">{debtors.length}</S.Badge>
                  </S.SectionHeader>
                  <S.Grid>
                    {debtors.map((cp) => {
                      const hasActive = cp.balances.some((b) => b.balance > 0.01);
                      const color = hasActive ? "var(--color-green-600)" : "var(--color-grey-500)";
                      
                      return (
                        <S.DebtCard key={cp.id}>
                          <S.CardLink to={`/debts/${cp.id}`} className="card-link">
                            <S.Avatar $color={color}>
                              <SmartIcon
                                logo={cp.logo}
                                iconName={cp.icon || "HiOutlineUser"}
                                size={20}
                                color={color}
                              />
                            </S.Avatar>
                            <S.Info>
                              <S.Name>{cp.name}</S.Name>
                              <S.RoleLabel>
                                {t("transactions:transactions.debt_person")}
                              </S.RoleLabel>
                            </S.Info>
                            <S.ArrowIconWrapper className="arrow-icon">
                              <HiChevronRight size={20} />
                            </S.ArrowIconWrapper>
                          </S.CardLink>
                          <S.CardBody>
                            <S.AmountBlock>
                              {cp.balances.filter((b) => b.balance > 0.01).length > 0 ? (
                                cp.balances
                                  .filter((b) => b.balance > 0.01)
                                  .filter(
                                    (b) =>
                                      filterValues.currency.length === 0 ||
                                      filterValues.currency.includes(b.currency),
                                  )
                                  .map((b) => (
                                    <S.AmountRow
                                      key={b.currency}
                                      $color="var(--color-green-600)"
                                    >
                                      <span>{formatMoney(b.balance, b.currency)}</span>
                                    </S.AmountRow>
                                  ))
                              ) : (
                                <S.AmountRow $color="var(--color-grey-500)" style={{ opacity: 0.5 }}>
                                  <span>{formatMoney(0, cp.balances[0]?.currency || "UAH")}</span>
                                </S.AmountRow>
                              )}
                            </S.AmountBlock>
                            <S.ActionButtons>
                              <Button
                                variation="secondary"
                                size="small"
                                $fullWidth
                                onClick={() =>
                                  onOpenTransaction(cp.id, "give", "positive")
                                }
                              >
                                <HiArrowUpRight />{" "}
                                {t("goals_debts:debtsPage.btn_lend")}
                              </Button>

                              {hasActive && (
                                <Button
                                  variation="primary"
                                  size="small"
                                  $fullWidth
                                  onClick={() => {
                                    const balance = cp.balances.find(
                                      (b) => b.balance > 0,
                                    )?.balance;
                                    onOpenTransaction(
                                      cp.id,
                                      "repay",
                                      "positive",
                                      balance,
                                    );
                                  }}
                                >
                                  <HiArrowDownLeft />{" "}
                                  {t("goals_debts:debtsPage.btn_repay_to_me")}
                                </Button>
                              )}
                            </S.ActionButtons>
                          </S.CardBody>
                        </S.DebtCard>
                      );
                    })}
                  </S.Grid>
                </S.Section>
              )}

              {/* NEGATIVE (CREDITORS) */}
              {creditors.length > 0 && (
                <S.Section>
                  <S.SectionHeader>
                    <S.SectionTitle>
                      <HiArrowDownLeft color="var(--color-red-600)" />
                      {t("goals_debts:debtsPage.section_negative")}
                    </S.SectionTitle>
                    <S.Badge $type="red">{creditors.length}</S.Badge>
                  </S.SectionHeader>
                  <S.Grid>
                    {creditors.map((cp) => {
                      const hasActive = cp.balances.some((b) => b.balance < -0.01);
                      const color = hasActive ? "var(--color-red-600)" : "var(--color-grey-500)";

                      return (
                        <S.DebtCard key={cp.id}>
                          <S.CardLink to={`/debts/${cp.id}`}>
                            <S.Avatar $color={color}>
                              <SmartIcon
                                logo={cp.logo}
                                iconName={cp.icon || "HiOutlineUser"}
                                size={20}
                                color={color}
                              />
                            </S.Avatar>
                            <S.Info>
                              <S.Name>{cp.name}</S.Name>
                              <S.RoleLabel>
                                {t("transactions:transactions.debt_person")}
                              </S.RoleLabel>
                            </S.Info>
                            <S.ArrowIconWrapper className="arrow-icon">
                              <HiChevronRight size={20} />
                            </S.ArrowIconWrapper>
                          </S.CardLink>
                          <S.CardBody>
                            <S.AmountBlock>
                              {cp.balances.filter((b) => b.balance < -0.01).length > 0 ? (
                                cp.balances
                                  .filter((b) => b.balance < -0.01)
                                  .filter(
                                    (b) =>
                                      filterValues.currency.length === 0 ||
                                      filterValues.currency.includes(b.currency),
                                  )
                                  .map((b) => (
                                    <S.AmountRow
                                      key={b.currency}
                                      $color="var(--color-red-600)"
                                    >
                                      <span>
                                        {formatMoney(Math.abs(b.balance), b.currency)}
                                      </span>
                                    </S.AmountRow>
                                  ))
                              ) : (
                                <S.AmountRow $color="var(--color-grey-500)" style={{ opacity: 0.5 }}>
                                  <span>{formatMoney(0, cp.balances[0]?.currency || "UAH")}</span>
                                </S.AmountRow>
                              )}
                            </S.AmountBlock>
                            <S.ActionButtons>
                              <Button
                                variation="secondary"
                                size="small"
                                $fullWidth
                                onClick={() =>
                                  onOpenTransaction(cp.id, "give", "negative")
                                }
                              >
                                <HiArrowDownLeft />{" "}
                                {t("goals_debts:debtsPage.btn_borrow")}
                              </Button>

                              {hasActive && (
                                <Button
                                  variation="primary"
                                  size="small"
                                  $fullWidth
                                  onClick={() => {
                                    const balance = cp.balances.find(
                                      (b) => b.balance < 0,
                                    )?.balance;
                                    onOpenTransaction(
                                      cp.id,
                                      "repay",
                                      "negative",
                                      balance,
                                    );
                                  }}
                                >
                                  <HiArrowUpRight />{" "}
                                  {t("goals_debts:debtsPage.btn_repay_my_debt")}
                                </Button>
                              )}
                            </S.ActionButtons>
                          </S.CardBody>
                        </S.DebtCard>
                      );
                    })}
                  </S.Grid>
                </S.Section>
              )}

              {/* SETTLED (HISTORY) */}
              {settled.length > 0 && (
                <S.Section>
                  <S.SectionHeader>
                    <S.SectionTitle>
                      <HiOutlineUser color="var(--color-grey-500)" />
                      {t("goals_debts:debtsPage.section_settled", "Закриті")}
                    </S.SectionTitle>
                    <S.Badge $type="neutral">{settled.length}</S.Badge>
                  </S.SectionHeader>
                  <S.Grid>
                    {settled.map((cp) => {
                      const color = "var(--color-grey-500)";
                      
                      return (
                        <S.DebtCard key={cp.id} style={{ opacity: 0.8 }}>
                          <S.CardLink to={`/debts/${cp.id}`} className="card-link">
                            <S.Avatar $color={color}>
                              <SmartIcon
                                logo={cp.logo}
                                iconName={cp.icon || "HiOutlineUser"}
                                size={20}
                                color={color}
                              />
                            </S.Avatar>
                            <S.Info>
                              <S.Name>{cp.name}</S.Name>
                              <S.RoleLabel>
                                {t("transactions:transactions.debt_person")}
                              </S.RoleLabel>
                            </S.Info>
                            <S.ArrowIconWrapper className="arrow-icon">
                              <HiChevronRight size={20} />
                            </S.ArrowIconWrapper>
                          </S.CardLink>
                          <S.CardBody>
                            <S.AmountBlock>
                              <S.AmountRow $color="var(--color-grey-500)" style={{ opacity: 0.5 }}>
                                <span>{formatMoney(0, cp.balances[0]?.currency || "UAH")}</span>
                              </S.AmountRow>
                            </S.AmountBlock>
                            <S.ActionButtons>
                              <Button
                                variation="secondary"
                                size="small"
                                $fullWidth
                                onClick={() =>
                                  onOpenTransaction(cp.id, "give", "positive")
                                }
                              >
                                <HiPlus />{" "}
                                {t("goals_debts:debtsPage.btn_new_loan", "Нова операція")}
                              </Button>
                            </S.ActionButtons>
                          </S.CardBody>
                        </S.DebtCard>
                      );
                    })}
                  </S.Grid>
                </S.Section>
              )}
            </S.SectionsContainer>
          ) : (
            <DebtsTable 
              debtors={debtors}
              creditors={creditors}
              settled={settled}
              onRowClick={(id) => navigate(`/debts/${id}`)}
              onAction={onOpenTransaction}
            />
          )}
        </>
      )}

      {/* EMPTY STATE */}
      {!isLoading &&
        !searchQuery &&
        debtors.length === 0 &&
        creditors.length === 0 &&
        settled.length === 0 && (
          <EmptyState
            icon={<HiWallet />}
            title={t("goals_debts:debtsPage.empty_title")}
            description={t("goals_debts:debtsPage.empty_desc")}
          />
        )}

      {/* MODAL FOR TRANSACTIONS */}
      {isTxModalOpen && (
        <CreateTransactionModal
          key={
            selectedAmount
              ? `modal-with-amount-${selectedAmount}`
              : "modal-empty"
          } // 🔥 Force re-render if amount changes
          isOpen={isTxModalOpen}
          onClose={closeTxModal}
          initialData={{
            type: txType,
            counterparty_id: selectedCpId || undefined,
            amount: selectedAmount, // 🔥 4. Передаємо суму в initialData
          }}
        />
      )}

      {isMobile && (
        <FAB onClick={handleGlobalCreate} />
      )}
    </S.PageContainer>
  );
}

export default Debts;
