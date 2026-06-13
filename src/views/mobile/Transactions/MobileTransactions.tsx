import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "../../../hooks/usePageTitle";

const StyledMobileTransactions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-main);
`;

const TransactionItem = styled.div`
  background-color: var(--color-bg-surface);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid var(--color-border);
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Counterparty = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-main);
`;

const Category = styled.div`
  font-size: 13px;
  color: var(--color-text-secondary);
`;

const Amount = styled.div<{ $isExpense: boolean }>`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.$isExpense ? 'var(--color-red-600)' : 'var(--color-green-600)'};
`;

function MobileTransactions() {
  const { t } = useTranslation();
  usePageTitle(t("navigation:general.transactions"));

  return (
    <StyledMobileTransactions>
      <Title>{t("navigation:general.transactions")}</Title>
      
      <TransactionItem>
        <Info>
          <Counterparty>Silpo</Counterparty>
          <Category>Food & Drinks</Category>
        </Info>
        <Amount $isExpense={true}>-₴ 450.00</Amount>
      </TransactionItem>

      <TransactionItem>
        <Info>
          <Counterparty>Salary</Counterparty>
          <Category>Income</Category>
        </Info>
        <Amount $isExpense={false}>+₴ 45,000.00</Amount>
      </TransactionItem>

      <div style={{ textAlign: "center", color: "var(--color-text-tertiary)", marginTop: "20px" }}>
        Transaction list coming soon...
      </div>
    </StyledMobileTransactions>
  );
}

export default MobileTransactions;
