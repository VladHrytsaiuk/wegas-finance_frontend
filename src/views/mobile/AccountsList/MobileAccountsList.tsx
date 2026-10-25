import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";

import { usePageTitle } from "../../../hooks/usePageTitle";
import { useUserRole } from "../../../hooks/useUserRole";
import { useSettings } from "../../../context/SettingsContext";
import { getAccountsApi, type Account } from "../../../services/apiAccounts";
import { getGoalsApi } from "../../../services/apiGoals";
import { getUsersApi } from "../../../services/apiUsers";
import { statsService } from "../../../services/apiStats";
import { formatMoney } from "../../../utils/helpers";
import { Screen, LargeTitle } from "../../../mobile/ui/Screen";
import { Section, Group, Row, Amount } from "../../../mobile/ui/Group";
import { AccountTile } from "../../../mobile/accountTile";
import { ACCOUNT_SECTIONS, accountSection } from "../../../mobile/accountSection";

const ProgressTrack = styled.span`
  display: block;
  width: 100%;
  height: 4px;
  margin-top: 4px;
  border-radius: 2px;
  background: var(--m-separator);
  overflow: hidden;
`;

const ProgressFill = styled.span<{ $pct: number }>`
  display: block;
  height: 100%;
  width: ${(p) => p.$pct}%;
  border-radius: 2px;
  background: var(--m-accent);
`;

const SubtitleStack = styled.span`
  display: flex;
  flex-direction: column;
`;

const AddButton = styled.button`
  height: 50px;
  border: none;
  border-radius: var(--m-radius-group);
  background: var(--m-surface);
  color: var(--m-accent);
  font: inherit;
  font-size: 17px;
  cursor: pointer;
`;

function MobileAccountsList() {
  usePageTitle("Рахунки");
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUserRole();
  const { currency, language } = useSettings();

  const { data: accounts = [] } = useQuery({ queryKey: ["accounts"], queryFn: getAccountsApi });
  const { data: goals = [] } = useQuery({ queryKey: ["goals"], queryFn: getGoalsApi });
  const { data: members = [] } = useQuery({ queryKey: ["users"], queryFn: getUsersApi });
  const { data: balance } = useQuery({
    queryKey: ["stats", "balance", [], currency],
    queryFn: () => statsService.getDashboard({ from: 0, to: 0, accountIds: [], currency }),
  });

  const sections = useMemo(() => {
    const visible = accounts.filter((a) => !a.is_group && !a.is_archived);
    return ACCOUNT_SECTIONS.map((section) => ({
      ...section,
      accounts: visible.filter((a) => accountSection(a) === section.key),
    })).filter((section) => section.accounts.length > 0);
  }, [accounts]);

  const subtitleFor = (account: Account) => {
    const parts: string[] = [];
    if (account.card_number) parts.push(`•• ${account.card_number.slice(-4)}`);
    if (account.is_synced) parts.push("синхронізується");
    // Рахунок іншого члена сім'ї — підписуємо, чий він.
    if (account.user_id && user?.id && account.user_id !== user.id) {
      const owner = members.find((m) => m.id === account.user_id);
      if (owner) parts.push(owner.name);
    }
    return parts.join(" · ");
  };

  const goalFor = (account: Account) => {
    const goal = goals.find((g) => g.id === account.goal_id);
    if (!goal || goal.target_amount <= 0) return null;
    const pct = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100));
    const progress = `${formatMoney(goal.current_amount, goal.currency, language, false)} з ${formatMoney(goal.target_amount, goal.currency, language, false)} · ${pct}%`;
    // Назву цілі показуємо, лише коли вона не збігається з назвою рахунку.
    return { pct, text: goal.name === account.name ? progress : `${goal.name}: ${progress}` };
  };

  return (
    <Screen>
      <LargeTitle
        title="Рахунки"
        subtitle={
          balance ? `Разом ${formatMoney(balance.total_balance, currency, language)}` : undefined
        }
      />

      {sections.map((section) => (
        <Section key={section.key} caption={section.caption}>
          <Group>
            {section.accounts.map((account) => {
              const goal = goalFor(account);
              const subtitle = subtitleFor(account);
              return (
                <Row
                  key={account.id}
                  to={`/accounts/${account.id}`}
                  leading={
                    <AccountTile account={account} />
                  }
                  title={account.name}
                  subtitle={
                    goal ? (
                      <SubtitleStack>
                        {goal.text}
                        <ProgressTrack>
                          <ProgressFill $pct={goal.pct} />
                        </ProgressTrack>
                      </SubtitleStack>
                    ) : (
                      subtitle || undefined
                    )
                  }
                  trailing={
                    <Amount>{formatMoney(account.balance, account.currency, language)}</Amount>
                  }
                />
              );
            })}
          </Group>
        </Section>
      ))}

      <AddButton
        type="button"
        onClick={() => navigate("/accounts/new", { state: { background: location } })}
      >
        Додати рахунок
      </AddButton>
    </Screen>
  );
}

export default MobileAccountsList;
