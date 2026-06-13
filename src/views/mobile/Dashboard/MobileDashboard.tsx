import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { useSummaryWidget } from "../../../hooks/Stats/useSummaryWidget";
import { formatMoney } from "../../../utils/helpers";
import { useMemo } from "react";
import { subDays } from "date-fns";
import CenteredSpinner from "../../../components/ui/CenteredSpinner";

const StyledMobileDashboard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-main);
`;

const Card = styled.div`
  background-color: var(--color-bg-surface);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
`;

const CardTitle = styled.h3`
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
`;

const CardValue = styled.div<{ $color?: string }>`
  font-size: 28px;
  font-weight: 700;
  color: ${props => props.$color || 'var(--color-brand-600)'};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const SmallCard = styled(Card)`
  padding: 16px;
`;

const SmallCardValue = styled.div<{ $color?: string }>`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.$color || 'var(--color-text-main)'};
`;

function MobileDashboard() {
  const { t } = useTranslation();
  usePageTitle(t("navigation:general.dashboard"));

  const globalFilter = useMemo(() => ({
    from: subDays(new Date(), 30).getTime(),
    to: new Date().getTime(),
    accountIds: [],
  }), []);

  const {
    totals: { balance, income, expense },
    meta: { currency, language, isLoading },
  } = useSummaryWidget({ globalFilter });

  if (isLoading) return <CenteredSpinner isContainer />;

  return (
    <StyledMobileDashboard>
      <Header>
        <Title>{t("navigation:general.dashboard")}</Title>
      </Header>

      <Card>
        <CardTitle>{t("dashboard:dashboard.total_balance")}</CardTitle>
        <CardValue>{formatMoney(balance, currency, language)}</CardValue>
      </Card>

      <StatsGrid>
        <SmallCard>
          <CardTitle>{t("dashboard:dashboard.income_period")}</CardTitle>
          <SmallCardValue $color="var(--color-green-600)">
            {formatMoney(income, currency, language)}
          </SmallCardValue>
        </SmallCard>
        <SmallCard>
          <CardTitle>{t("dashboard:dashboard.expense_period")}</CardTitle>
          <SmallCardValue $color="var(--color-red-600)">
            {formatMoney(expense, currency, language)}
          </SmallCardValue>
        </SmallCard>
      </StatsGrid>

      <Card>
        <CardTitle>Recent Activity</CardTitle>
        <div style={{ color: "var(--color-text-tertiary)", fontSize: "14px" }}>
          Mobile activity feed coming soon...
        </div>
      </Card>
    </StyledMobileDashboard>
  );
}

export default MobileDashboard;
