import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { ExpensesPieWidget } from "../../../components/stats/widgets/ExpensesPieWidget";
import { TopListWidget } from "../../../components/stats/widgets/TopListWidget";
import { useMemo } from "react";
import { startOfMonth, endOfMonth } from "date-fns";

const StyledMobileStats = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background-color: var(--color-bg-page);
  min-height: 100%;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-main);
  margin-bottom: 10px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-main);
`;

const WidgetWrapper = styled.div`
  background-color: var(--color-bg-surface);
  border-radius: 20px;
  border: 1px solid var(--color-border);
  padding: 16px;
  box-shadow: var(--shadow-sm);

  /* Override internal widget card styles */
  & > div {
    border: none;
    padding: 0;
    background: transparent;
  }
`;

function MobileTransactions() {
  const { t } = useTranslation();
  usePageTitle(t("navigation:general.stats", "Статистика"));

  const globalFilter = useMemo(() => ({
    from: startOfMonth(new Date()).getTime(),
    to: endOfMonth(new Date()).getTime(),
    accountIds: [],
  }), []);

  return (
    <StyledMobileStats>
      <Title>Аналітика</Title>
      
      <Section>
        <SectionTitle>Розподіл витрат</SectionTitle>
        <WidgetWrapper>
          <ExpensesPieWidget 
            globalFilter={globalFilter}
            type="expense"
          />
        </WidgetWrapper>
      </Section>

      <Section>
        <SectionTitle>Топ категорій</SectionTitle>
        <WidgetWrapper>
          <TopListWidget 
            type="expense"
            entity="category"
            title=""
            globalFilter={globalFilter}
          />
        </WidgetWrapper>
      </Section>

      <Section>
        <SectionTitle>Топ магазинів</SectionTitle>
        <WidgetWrapper>
          <TopListWidget 
            type="expense"
            entity="counterparty"
            title=""
            globalFilter={globalFilter}
          />
        </WidgetWrapper>
      </Section>
    </StyledMobileStats>
  );
}

export default MobileTransactions;
