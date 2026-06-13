import { useState, useMemo, useEffect } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { useSummaryWidget } from "../../../hooks/Stats/useSummaryWidget";
import { useAccountsData } from "../../../hooks/Accounts/useAccountsData";
import { useRecentTransactionsWidget } from "../../../hooks/Stats/useRecentTransactionsWidget";
import { formatMoney } from "../../../utils/helpers";
import { startOfMonth, endOfMonth } from "date-fns";
import CenteredSpinner from "../../../components/ui/CenteredSpinner";
import { ExpensesPieWidget } from "../../../components/stats/widgets/ExpensesPieWidget";
import { TopListWidget } from "../../../components/stats/widgets/TopListWidget";
import { TransactionItem } from "../../../components/transactions/TransactionItem";
import { 
  HiOutlineArrowTrendingUp, 
  HiOutlineArrowTrendingDown, 
  HiOutlineArrowLongRight,
  HiOutlineUser,
  HiOutlineUsers,
  HiOutlineWallet
} from "react-icons/hi2";
import { useUserRole } from "../../../hooks/useUserRole";
import { BANK_SKINS } from "../../../components/accounts/bankSkins";
import { BankLogo } from "../../../components/accounts/form/CardStyles";
import { useNavigate } from "react-router-dom";

const StyledMobileDashboard = styled.div`
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-page);
  min-height: 100%;
`;

const StickyHeader = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: var(--color-bg-surface);
  padding: 16px 20px;
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
  background-color: ${props => props.$active ? 'var(--color-brand-600)' : 'transparent'};
  color: ${props => props.$active ? 'white' : 'var(--color-text-secondary)'};

  svg {
    width: 20px;
    height: 20px;
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const SummaryCard = styled.div<{ $type: 'income' | 'expense' }>`
  background-color: var(--color-bg-surface);
  border-radius: 16px;
  padding: 14px;
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 6px;

  .icon-box {
    width: 26px;
    height: 26px;
    border-radius: 6px;
    background-color: ${props => props.$type === 'income' ? 'var(--color-green-50)' : 'var(--color-red-50)'};
    color: ${props => props.$type === 'income' ? 'var(--color-green-600)' : 'var(--color-red-600)'};
    display: flex;
    align-items: center;
    justify-content: center;
    svg { width: 16px; height: 16px; }
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
  }
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
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
    padding: 16px;
    background: transparent;
  }
`;

const AccountList = styled.div`
  display: flex;
  flex-direction: column;
`;

const AccountItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  background-color: var(--color-bg-surface);
  
  &:last-child { border-bottom: none; }
  &:active { background-color: var(--color-bg-hover); }
`;

const AccInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AccIconFallback = styled.div<{ $color?: string }>`
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background-color: ${props => props.$color || 'var(--color-brand-600)'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  svg { width: 14px; height: 14px; }
`;

const AccBalance = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-main);
`;

const TransactionList = styled.div`
  display: flex;
  flex-direction: column;

  & > div {
    border-bottom: 1px solid var(--color-border);
    &:last-child { border-bottom: none; }
  }
`;

function MobileDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUserRole();
  const [viewScope, setViewScope] = useState<'personal' | 'family'>('personal');
  
  usePageTitle(t("navigation:general.dashboard"));

  const { accounts, isLoading: isAccLoading } = useAccountsData();

  const targetAccountIds = useMemo(() => {
    if (!accounts) return [];
    if (viewScope === 'personal') {
      return accounts.filter((acc: any) => acc.user_id === user?.id).map((acc: any) => acc.id);
    }
    return accounts.map((acc: any) => acc.id);
  }, [accounts, viewScope, user?.id]);

  const globalFilter = useMemo(() => ({
    from: startOfMonth(new Date()).getTime(),
    to: endOfMonth(new Date()).getTime(),
    accountIds: targetAccountIds,
  }), [targetAccountIds]);

  const {
    totals: { balance, income, expense },
    meta: { currency, language, isLoading: isStatsLoading }
  } = useSummaryWidget({ globalFilter });

  const {
    state: { recentItems, categories },
  } = useRecentTransactionsWidget({ globalFilter });

  const getSkin = (account: any) => {
    // 🔥 Витягуємо скін так само, як у useAccountsGrid
    if (account.type === "card") {
      const bank = account.bank_name;
      const design = account.card_type || account.card_design;

      if (bank && design) {
        const key = `${bank}-${design}`;
        if (BANK_SKINS[key]) return BANK_SKINS[key];
      }
      
      // Спробуємо за іконкою (вона часто містить повний ключ скіна)
      if (account.icon && BANK_SKINS[account.icon]) {
        return BANK_SKINS[account.icon];
      }

      return BANK_SKINS["default"];
    }

    // Для готівки та інших
    return {
      bg: account.color || "#10b981",
      color: "#ffffff",
      bankId: account.type === "cash" ? "cash" : "savings",
      logoFile: "",
      iconType: account.storage_type?.slug || account.type
    };
  };

  if (isAccLoading || (isStatsLoading && targetAccountIds.length > 0)) return <CenteredSpinner fullHeight />;

  const filteredAccounts = accounts.filter((acc: any) => targetAccountIds.includes(acc.id));

  return (
    <StyledMobileDashboard>
      <StickyHeader>
        <HeaderTop>
          <BalanceInfo>
            <Greeting>{viewScope === 'personal' ? 'Мій баланс' : 'Сімейний баланс'}</Greeting>
            <TotalBalance>{formatMoney(balance, currency, language)}</TotalBalance>
          </BalanceInfo>
          
          <WorkspaceToggle>
            <ToggleButton 
              $active={viewScope === 'personal'} 
              onClick={() => setViewScope('personal')}
              title="Особисті"
            >
              <HiOutlineUser />
            </ToggleButton>
            <ToggleButton 
              $active={viewScope === 'family'} 
              onClick={() => setViewScope('family')}
              title="Сім'я"
            >
              <HiOutlineUsers />
            </ToggleButton>
          </WorkspaceToggle>
        </HeaderTop>
      </StickyHeader>

      <Content>
        <SummaryGrid>
          <SummaryCard $type="income">
            <div className="icon-box"><HiOutlineArrowTrendingUp /></div>
            <div className="label">Доходи</div>
            <div className="value">{formatMoney(income, currency, language)}</div>
          </SummaryCard>
          <SummaryCard $type="expense">
            <div className="icon-box"><HiOutlineArrowTrendingDown /></div>
            <div className="label">Витрати</div>
            <div className="value">{formatMoney(expense, currency, language)}</div>
          </SummaryCard>
        </SummaryGrid>

        <Section>
          <SectionHeader>
            <SectionTitle>Рахунки</SectionTitle>
            <ViewAll onClick={() => navigate('/accounts')}>
              Всі <HiOutlineArrowLongRight />
            </ViewAll>
          </SectionHeader>
          <WidgetWrapper style={{ padding: 0 }}>
            <AccountList>
              {filteredAccounts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                  Рахунків не знайдено
                </div>
              ) : (
                filteredAccounts.slice(0, 5).map(acc => {
                  const skin = getSkin(acc);
                  const isCard = acc.type === 'card';
                  
                  return (
                    <AccountItem key={acc.id} onClick={() => navigate(`/accounts/${acc.id}`)}>
                      <AccInfo>
                        {isCard && skin.logoFile ? (
                          <BankLogo skin={skin} />
                        ) : (
                          <AccIconFallback $color={acc.color}>
                            <HiOutlineWallet />
                          </AccIconFallback>
                        )}
                        <div style={{ fontSize: '14px', fontWeight: 600 }}>{acc.name}</div>
                      </AccInfo>
                      <AccBalance>{formatMoney(acc.balance || acc.calculated_balance || 0, acc.currency || currency, language)}</AccBalance>
                    </AccountItem>
                  );
                })
              )}
            </AccountList>
          </WidgetWrapper>
        </Section>

        <Section>
          <SectionHeader>
            <SectionTitle>Останні операції</SectionTitle>
            <ViewAll onClick={() => navigate('/transactions')}>
              Більше <HiOutlineArrowLongRight />
            </ViewAll>
          </SectionHeader>
          <WidgetWrapper style={{ padding: 0 }}>
            <TransactionList>
              {recentItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                  Операцій не знайдено
                </div>
              ) : (
                recentItems.slice(0, 5).map(tx => (
                  <TransactionItem
                    key={tx.id}
                    transaction={tx}
                    categories={categories}
                    accounts={accounts}
                    currency={currency}
                    language={language}
                    isWidget={true}
                  />
                ))
              )}
            </TransactionList>
          </WidgetWrapper>
        </Section>

        <Section>
          <SectionHeader>
            <SectionTitle>Аналітика витрат</SectionTitle>
          </SectionHeader>
          <WidgetWrapper>
            <ExpensesPieWidget 
              globalFilter={globalFilter}
              type="expense"
              hideHeader
            />
          </WidgetWrapper>
        </Section>

        <Section style={{ paddingBottom: '20px' }}>
          <SectionHeader>
            <SectionTitle>Топ категорій</SectionTitle>
          </SectionHeader>
          <WidgetWrapper>
            <TopListWidget 
              type="expense"
              entity="category"
              title=""
              globalFilter={globalFilter}
            />
          </WidgetWrapper>
        </Section>
      </Content>
    </StyledMobileDashboard>
  );
}

export default MobileDashboard;
