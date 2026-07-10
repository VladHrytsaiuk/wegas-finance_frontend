import { useState, useMemo } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { useSummaryWidget } from "../../../hooks/Stats/useSummaryWidget";
import { useAccountsData } from "../../../hooks/Accounts/useAccountsData";
import { useRecentTransactionsWidget } from "../../../hooks/Stats/useRecentTransactionsWidget";
import { formatMoney } from "../../../utils/helpers";
import { subDays, endOfDay } from "date-fns";
import CenteredSpinner from "../../../components/ui/CenteredSpinner";
import { TrendWidget } from "../../../components/stats/widgets/TrendWidget";
import { TopListWidget } from "../../../components/stats/widgets/TopListWidget";
import { TransactionItem } from "../../../components/transactions/TransactionItem";
import {
  HiOutlineArrowTrendingUp,
  HiOutlineArrowTrendingDown,
  HiOutlineArrowLongRight,
  HiOutlineUser,
  HiOutlineUsers,
  HiOutlineShoppingCart,
  HiOutlineTrophy,
  HiOutlineGift,
  HiOutlineBolt,
  HiOutlineComputerDesktop,
} from "react-icons/hi2";
import { useUserRole } from "../../../hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import type { Account } from "../../../types";
const StyledMobileDashboard = styled.div`
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-page);
  min-height: 100vh;
  padding-bottom: 80px; /* Місце для FAB */
`;

const StickyHeader = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: var(--color-bg-surface);
  padding: 16px 20px;
  padding-top: max(16px, env(safe-area-inset-top));
  border-bottom: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const BalanceInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const Greeting = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: var(--color-brand-600);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 2px;
`;

const TotalBalance = styled.div`
  font-size: 26px;
  font-weight: 800;
  color: var(--color-text-main);
  letter-spacing: -0.5px;
  min-height: 32px;
  display: flex;
  align-items: center;
`;

const WorkspaceToggle = styled.div`
  display: flex;
  background-color: var(--color-bg-page);
  padding: 4px;
  border-radius: 12px;
  border: 1px solid var(--color-border);
`;

const ToggleButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 36px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${(props) =>
    props.$active ? "var(--color-brand-600)" : "transparent"};
  color: ${(props) =>
    props.$active ? "white" : "var(--color-text-secondary)"};

  svg {
    width: 20px;
    height: 20px;
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 16px;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const SummaryCard = styled.div<{ $type: "income" | "expense" }>`
  background-color: var(--color-bg-surface);
  border-radius: 16px;
  padding: 14px;
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 6px;
  cursor: pointer;
  transition: transform 0.1s;

  &:active {
    transform: scale(0.98);
  }

  .icon-box {
    width: 26px;
    height: 26px;
    border-radius: 6px;
    background-color: ${(props) =>
      props.$type === "income"
        ? "var(--color-green-50)"
        : "var(--color-red-50)"};
    color: ${(props) =>
      props.$type === "income"
        ? "var(--color-green-600)"
        : "var(--color-red-600)"};
    display: flex;
    align-items: center;
    justify-content: center;
    svg {
      width: 16px;
      height: 16px;
    }
  }

  .label {
    font-size: 10px;
    font-weight: 700;
    color: var(--color-text-secondary);
    text-transform: uppercase;
  }

  .value {
    font-size: 15px;
    font-weight: 700;
    color: var(--color-text-main);
    min-height: 22px;
  }
`;

const QuickLinks = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px; /* Reduced gap from 12px to fit 5 items */
  padding: 0;
`;

const QuickLinkButton = styled.button`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  transition: transform 0.1s;
  min-width: 0; /* Allow shrinking */

  &:active {
    transform: scale(0.95);
  }

  .icon-box {
    width: 44px; /* Reduced from 48px to fit 5 items */
    height: 44px;
    border-radius: 12px;
    background-color: var(--color-bg-surface);
    border: 1px solid var(--color-border);
    color: var(--color-brand-600);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--shadow-sm);

    svg {
      width: 22px;
      height: 22px;
    }
  }

  .label {
    font-size: 10px; /* Slightly smaller text */
    font-weight: 600;
    color: var(--color-text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    text-align: center;
  }
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px;
`;

const SectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-main);
`;

const ViewAll = styled.button`
  background: none;
  border: none;
  color: var(--color-brand-600);
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
`;

const WidgetWrapper = styled.div`
  background-color: var(--color-bg-surface);
  border-radius: 20px;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  overflow: hidden;

  & > div {
    border: none;
    padding: 0;
    background: transparent;
  }
`;

const AnalyticsWrapper = styled(WidgetWrapper)`
  height: 280px;

  & > div {
    height: 100%;
    padding: 12px;
    border: none;
    display: flex;
    flex-direction: column;
  }

  & > div > div {
    padding: 0;
    border: none;
    background: transparent;
  }

  header {
    margin-bottom: 12px;
    padding: 0;
    flex-wrap: wrap;
    gap: 8px;
  }

  div[class*="TitleGroup"] {
    gap: 8px;
  }

  h3 {
    display: none;
  }

  button[class*="ToggleBtn"] {
    padding: 4px 8px;
    font-size: 11px;
  }
`;

const TopListWrapper = styled(WidgetWrapper)`
  & > div {
    padding: 12px;
  }

  header {
    margin-bottom: 12px;
    padding: 0;
    flex-wrap: wrap;
    gap: 8px;
  }

  div[class*="TitleGroup"] {
    gap: 8px;
  }

  h3 {
    display: none;
  }

  button[class*="ToggleBtn"] {
    padding: 4px 8px;
    font-size: 11px;
  }
`;

const TransactionList = styled.div`
  display: flex;
  flex-direction: column;

  & > div {
    border-bottom: 1px solid var(--color-border);
    &:last-child {
      border-bottom: none;
    }
  }
`;

function MobileDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isLoading: isUserLoading } = useUserRole();
  const [viewScope, setViewScope] = useState<"personal" | "family">("personal");

  usePageTitle(t("navigation:general.dashboard"));

  const { accounts, isLoading: isAccLoading } = useAccountsData();

  const targetAccountIds = useMemo(() => {
    if (!accounts) return [];
    if (viewScope === "personal") {
      if (!user) return [];
      return accounts
        .filter((acc: Account) => acc.user_id === user.id)
        .map((acc: Account) => acc.id);
    }
    return accounts.map((acc: Account) => acc.id);
  }, [accounts, viewScope, user]);

  const globalFilter = useMemo(
    () => ({
      from: subDays(new Date(), 30).getTime(),
      to: endOfDay(new Date()).getTime(),
      accountIds: targetAccountIds,
    }),
    [targetAccountIds],
  );

  const {
    totals: { balance, income, expense },
    meta: { currency, language, isLoading: isStatsLoading },
  } = useSummaryWidget({ globalFilter });

  const {
    state: { recentItems, categories },
  } = useRecentTransactionsWidget({ globalFilter });

  // Блокуємо екран ТІЛЬКИ при завантаженні критичних даних користувача або рахунків
  if (isUserLoading || isAccLoading) return <CenteredSpinner fullHeight />;

  return (
    <StyledMobileDashboard>
      <StickyHeader>
        <HeaderTop>
          <BalanceInfo>
            <Greeting>
              {viewScope === "personal"
                ? t("dashboard:mobile.personal_balance")
                : t("dashboard:mobile.family_balance")}
            </Greeting>
            <TotalBalance>
              {isStatsLoading && balance === 0
                ? "..."
                : formatMoney(balance, currency, language)}
            </TotalBalance>
          </BalanceInfo>

          <WorkspaceToggle>
            <ToggleButton
              $active={viewScope === "personal"}
              onClick={() => setViewScope("personal")}
              title={t("dashboard:mobile.personal")}
            >
              <HiOutlineUser />
            </ToggleButton>
            <ToggleButton
              $active={viewScope === "family"}
              onClick={() => setViewScope("family")}
              title={t("dashboard:mobile.family")}
            >
              <HiOutlineUsers />
            </ToggleButton>
          </WorkspaceToggle>
        </HeaderTop>
      </StickyHeader>

      <Content>
        <SummaryGrid>
          <SummaryCard
            $type="income"
            onClick={() => navigate("/transactions?type=income")}
          >
            <div className="icon-box">
              <HiOutlineArrowTrendingUp />
            </div>
            <div className="label">{t("dashboard:mobile.income")}</div>
            <div className="value">
              {isStatsLoading && income === 0
                ? "..."
                : formatMoney(income, currency, language)}
            </div>
          </SummaryCard>
          <SummaryCard
            $type="expense"
            onClick={() => navigate("/transactions?type=expense")}
          >
            <div className="icon-box">
              <HiOutlineArrowTrendingDown />
            </div>
            <div className="label">{t("dashboard:mobile.expense")}</div>
            <div className="value">
              {isStatsLoading && expense === 0
                ? "..."
                : formatMoney(expense, currency, language)}
            </div>
          </SummaryCard>
        </SummaryGrid>

        <QuickLinks>
          <QuickLinkButton onClick={() => navigate("/shopping")}>
            <div className="icon-box">
              <HiOutlineShoppingCart />
            </div>
            <span className="label">{t("dashboard:mobile.shopping")}</span>
          </QuickLinkButton>

          <QuickLinkButton onClick={() => navigate("/goals")}>
            <div className="icon-box">
              <HiOutlineTrophy />
            </div>
            <span className="label">{t("dashboard:mobile.goals")}</span>
          </QuickLinkButton>

          <QuickLinkButton onClick={() => navigate("/wishlist")}>
            <div className="icon-box">
              <HiOutlineGift />
            </div>
            <span className="label">{t("dashboard:mobile.wishlist")}</span>
          </QuickLinkButton>

          <QuickLinkButton onClick={() => navigate("/utility")}>
            <div className="icon-box">
              <HiOutlineBolt />
            </div>
            <span className="label">{t("dashboard:mobile.utility")}</span>
          </QuickLinkButton>

          <QuickLinkButton onClick={() => navigate("/assets")}>
            <div className="icon-box">
              <HiOutlineComputerDesktop />
            </div>
            <span className="label">{t("dashboard:mobile.assets")}</span>
          </QuickLinkButton>
        </QuickLinks>

        <Section>
          <SectionHeader>
            <SectionTitle>
              {t("dashboard:mobile.recent_operations")}
            </SectionTitle>
            <ViewAll onClick={() => navigate("/transactions")}>
              {t("dashboard:mobile.view_more")} <HiOutlineArrowLongRight />
            </ViewAll>
          </SectionHeader>
          <WidgetWrapper style={{ padding: 0 }}>
            <TransactionList>
              {recentItems.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "24px",
                    color: "var(--color-text-secondary)",
                    fontSize: "14px",
                  }}
                >
                  {t("dashboard:mobile.no_operations")}
                </div>
              ) : (
                recentItems
                  .slice(0, 5)
                  .map((tx) => (
                    <TransactionItem
                      key={tx.id}
                      transaction={tx}
                      categories={categories}
                      accounts={accounts}
                      currency={currency}
                      language={language}
                      isWidget={true}
                      onClick={() => navigate(`/transactions/${tx.id}`)}
                    />
                  ))
              )}
            </TransactionList>
          </WidgetWrapper>
        </Section>

        <Section>
          <SectionHeader>
            <SectionTitle>
              {t("dashboard:mobile.expense_dynamics")}
            </SectionTitle>
          </SectionHeader>
          <AnalyticsWrapper>
            <TrendWidget
              globalFilter={globalFilter}
              type="expense"
              color="#ef4444"
              title=""
            />
          </AnalyticsWrapper>
        </Section>

        <Section style={{ paddingBottom: "20px" }}>
          <SectionHeader>
            <SectionTitle>{t("dashboard:mobile.top_categories")}</SectionTitle>
          </SectionHeader>
          <TopListWrapper>
            <TopListWidget
              type="expense"
              entity="category"
              title=""
              globalFilter={globalFilter}
            />
          </TopListWrapper>
        </Section>
      </Content>
    </StyledMobileDashboard>
  );
}

export default MobileDashboard;
