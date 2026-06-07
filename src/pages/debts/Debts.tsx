import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Button } from "../../components/ui/Button";
import { TableToolbar } from "../../components/shared/TableToolbar/TableToolbar";
import CreateTransactionModal from "../../components/transactions/CreateTransactionModal";

// Utils & Styles
import { formatMoney } from "../../utils/helpers";
import * as S from "./Debts.styles";
import { useDebtsPage, type DebtTotals } from "../../hooks/Debts/useDebtsPage";

function Debts() {
  const navigate = useNavigate();

  const {
    state: {
      isLoading,
      searchQuery,
      filterValues,
      positive,
      negative,
      totalsOwedToMe,
      totalsIOwe,
      netBalances,
    },
    config: { filtersConfig, sortOptions, sortValue },
    handlers: {
      handleSearchChange,
      handleSortChange,
      handleFilterChange,
      handleClearAll,
    },
    t,
  } = useDebtsPage();

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
    navigate("/debts");
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

  if (isLoading) return <Spinner />;

  return (
    <S.PageContainer>
      {/* SUMMARY CARDS */}
      {!searchQuery && Object.keys(filterValues.currency).length === 0 && (
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
        <Button
          variation="primary"
          size="medium"
          onClick={handleGlobalCreate}
          icon={<HiPlus />}
          style={{ whiteSpace: "nowrap" }}
        >
          {t("transactions:transactionsPage.button_add")}
        </Button>
      </TableToolbar>

      {/* LIST SECTIONS */}
      <S.SectionsContainer>
        {/* POSITIVE */}
        {positive.length > 0 && (
          <S.Section>
            <S.SectionHeader>
              <S.SectionTitle>
                <HiArrowUpRight color="var(--color-green-600)" />
                {t("goals_debts:debtsPage.section_positive")}
              </S.SectionTitle>
              <S.Badge $type="green">{positive.length}</S.Badge>
            </S.SectionHeader>
            <S.Grid>
              {positive.map((cp) => (
                <S.DebtCard key={cp.id}>
                  <S.CardLink to={`/debts/${cp.id}`} className="card-link">
                    <S.Avatar $color="var(--color-green-600)">
                      {cp.logo ? (
                        <img src={`/brands/${cp.logo}`} alt={cp.name} />
                      ) : (
                        <HiOutlineUser />
                      )}
                    </S.Avatar>
                    <S.Info>
                      <S.Name>{cp.name}</S.Name>
                      <S.RoleLabel>{t("transactions:transactions.debt_person")}</S.RoleLabel>
                    </S.Info>
                    <S.ArrowIconWrapper className="arrow-icon">
                      <HiChevronRight size={20} />
                    </S.ArrowIconWrapper>
                  </S.CardLink>
                  <S.CardBody>
                    <S.AmountBlock>
                      {cp.balances
                        .filter((b) => b.balance > 0)
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
                        ))}
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
                        <HiArrowUpRight /> {t("goals_debts:debtsPage.btn_lend")}
                      </Button>

                      {/* 🔥 3. Передаємо баланс при кліку на Повернути */}
                      <Button
                        variation="primary"
                        size="small"
                        $fullWidth
                        onClick={() => {
                          // Знаходимо основний позитивний баланс (або перший-ліпший)
                          // Тут трохи спрощено, беремо перший позитивний, але логіка правильна
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
                        <HiArrowDownLeft /> {t("goals_debts:debtsPage.btn_repay_to_me")}
                      </Button>
                    </S.ActionButtons>
                  </S.CardBody>
                </S.DebtCard>
              ))}
            </S.Grid>
          </S.Section>
        )}

        {/* NEGATIVE */}
        {negative.length > 0 && (
          <S.Section>
            <S.SectionHeader>
              <S.SectionTitle>
                <HiArrowDownLeft color="var(--color-red-600)" />
                {t("goals_debts:debtsPage.section_negative")}
              </S.SectionTitle>
              <S.Badge $type="red">{negative.length}</S.Badge>
            </S.SectionHeader>
            <S.Grid>
              {negative.map((cp) => (
                <S.DebtCard key={cp.id}>
                  <S.CardLink to={`/debts/${cp.id}`}>
                    <S.Avatar $color="var(--color-red-600)">
                      {cp.logo ? (
                        <img src={`/brands/${cp.logo}`} alt={cp.name} />
                      ) : (
                        <HiOutlineUser />
                      )}
                    </S.Avatar>
                    <S.Info>
                      <S.Name>{cp.name}</S.Name>
                      <S.RoleLabel>{t("transactions:transactions.debt_person")}</S.RoleLabel>
                    </S.Info>
                    <S.ArrowIconWrapper className="arrow-icon">
                      <HiChevronRight size={20} />
                    </S.ArrowIconWrapper>
                  </S.CardLink>
                  <S.CardBody>
                    <S.AmountBlock>
                      {cp.balances
                        .filter((b) => b.balance < 0)
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
                        ))}
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
                        <HiArrowDownLeft /> {t("goals_debts:debtsPage.btn_borrow")}
                      </Button>

                      {/* 🔥 3. Передаємо баланс при кліку на Повернути борг */}
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
                        <HiArrowUpRight /> {t("goals_debts:debtsPage.btn_repay_my_debt")}
                      </Button>
                    </S.ActionButtons>
                  </S.CardBody>
                </S.DebtCard>
              ))}
            </S.Grid>
          </S.Section>
        )}
      </S.SectionsContainer>

      {/* EMPTY STATE */}
      {!isLoading &&
        !searchQuery &&
        positive.length === 0 &&
        negative.length === 0 && (
          <S.EmptyState>
            <S.EmptyIconWrapper>
              <HiWallet />
            </S.EmptyIconWrapper>
            <div>
              <h3>{t("goals_debts:debtsPage.empty_title")}</h3>
              <p>{t("goals_debts:debtsPage.empty_desc")}</p>
            </div>
          </S.EmptyState>
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
    </S.PageContainer>
  );
}

export default Debts;
