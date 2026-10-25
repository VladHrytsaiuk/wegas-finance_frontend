import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { format } from "date-fns";
import { uk, enUS } from "date-fns/locale";
import {
  HiOutlineInboxArrowDown,
  HiOutlineUsers,
  HiOutlineBolt,
  HiOutlineArrowUpRight,
  HiOutlineCheckCircle,
  HiOutlineFlag,
} from "react-icons/hi2";

import { usePageTitle } from "../../../hooks/usePageTitle";
import { formatMoney } from "../../../utils/helpers";
import { Screen, LargeTitle } from "../../../mobile/ui/Screen";
import { Section, SectionAction, Group, Row } from "../../../mobile/ui/Group";
import { Tile } from "../../../mobile/ui/Tile";
import { TxRow } from "../../../mobile/ui/TxRow";
import { useMobileOverview, type AttentionItem } from "./useMobileOverview";

const ATTENTION_ICONS: Record<AttentionItem["icon"], ReactNode> = {
  inbox: <HiOutlineInboxArrowDown size={20} />,
  owed: <HiOutlineUsers size={20} />,
  utility: <HiOutlineBolt size={20} />,
  debt: <HiOutlineArrowUpRight size={20} />,
};

const AVATAR_COLORS = ["#047857", "#b45309", "#1d4ed8", "#7c3aed", "#be185d"];

const BalanceCard = styled.section`
  background: var(--m-surface);
  border-radius: var(--m-radius-card);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const Label = styled.p`
  margin: 0;
  font-size: 15px;
  color: var(--m-label-2);
`;

const Big = styled.p`
  margin: 4px 0 0;
  font-size: 40px;
  line-height: 46px;
  font-weight: 600;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;

  & span {
    font-size: 24px;
    color: var(--m-label-2);
  }
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  padding-top: 16px;
  border-top: 0.5px solid var(--m-separator);
`;

const Stat = styled.div<{ $accent?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 2px;

  & span:first-child {
    font-size: 13px;
    color: var(--m-label-2);
  }

  & span:last-child {
    font-size: 20px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: ${(p) => (p.$accent ? "var(--m-accent)" : "var(--m-label)")};
  }
`;

const Avatars = styled(Link)`
  display: flex;
  align-items: center;
  min-height: 44px;
  padding-left: 8px;
  text-decoration: none;
`;

const Avatar = styled.span<{ $color: string }>`
  width: 32px;
  height: 32px;
  margin-left: -8px;
  border-radius: 16px;
  border: 2px solid var(--m-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  background: ${(p) => p.$color};
`;

const Cards = styled.div<{ $single: boolean }>`
  display: grid;
  grid-template-columns: ${(p) => (p.$single ? "1fr" : "repeat(2, minmax(0, 1fr))")};
  gap: 12px;
`;

const Card = styled(Link)`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 150px;
  padding: 14px;
  box-sizing: border-box;
  border-radius: 16px;
  background: var(--m-surface);
  color: var(--m-label);
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;

  &:active {
    opacity: 0.7;
  }
`;

const CardKicker = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--m-accent);
`;

const CardTitle = styled.span`
  font-size: 17px;
  font-weight: 600;
`;

const CardText = styled.span`
  font-size: 13px;
  line-height: 19px;
  color: var(--m-label-2);
`;

const CardFoot = styled.span`
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  color: var(--m-label-2);
  font-variant-numeric: tabular-nums;
`;

const Percent = styled.span`
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
`;

const Bar = styled.span<{ $pct: number }>`
  display: block;
  height: 4px;
  border-radius: 2px;
  background: var(--m-separator);
  overflow: hidden;

  &::after {
    content: "";
    display: block;
    height: 100%;
    width: ${(p) => p.$pct}%;
    border-radius: 2px;
    background: var(--m-accent);
  }
`;

// Ціла частина великим, копійки й валюта — дрібніше.
function splitMoney(formatted: string) {
  const match = formatted.match(/^(.*?)([.,]\d{2}\s.*)$/);
  return match ? [match[1], match[2]] : [formatted, ""];
}

function MobileOverview() {
  usePageTitle("Огляд");
  const data = useMobileOverview();
  const locale = data.language === "uk" ? uk : enUS;
  const now = new Date();
  const eyebrow = format(now, "EEEE, d MMMM", { locale });
  const month = format(now, "LLLL", { locale });
  const [whole, fraction] = splitMoney(formatMoney(data.balance, data.currency, data.language));

  const cards = [data.shopping, data.goal].filter(Boolean).length;

  return (
    <Screen>
      <LargeTitle
        eyebrow={eyebrow}
        title="Огляд"
        trailing={
          data.members.length > 0 && (
            <Avatars to="/settings/users" aria-label={`Сімʼя: ${data.members.length}`}>
              {data.members.slice(0, 4).map((m, i) => (
                <Avatar key={m.id} $color={AVATAR_COLORS[i % AVATAR_COLORS.length]} aria-hidden="true">
                  {(m.name || "?").charAt(0).toUpperCase()}
                </Avatar>
              ))}
            </Avatars>
          )
        }
      />

      <BalanceCard>
        <div>
          <Label>
            {data.accountsCount > 0 ? `Усього на рахунках · ${data.accountsCount}` : "Усього на рахунках"}
          </Label>
          <Big>
            {whole}
            <span>{fraction}</span>
          </Big>
        </div>
        <Stats>
          <Stat>
            <span>Витрати за {month}</span>
            <span>{formatMoney(data.monthExpense, data.currency, data.language, false)}</span>
          </Stat>
          <Stat $accent>
            <span>Доходи за {month}</span>
            <span>{formatMoney(data.monthIncome, data.currency, data.language, false)}</span>
          </Stat>
        </Stats>
      </BalanceCard>

      {data.attention.length > 0 && (
        <Section title="Потребує уваги">
          <Group>
            {data.attention.map((item) => (
              <Row
                key={item.key}
                to={item.to}
                leading={<Tile icon={ATTENTION_ICONS[item.icon]} tint={item.tint} />}
                title={item.title}
                subtitle={item.subtitle}
                chevron
              />
            ))}
          </Group>
        </Section>
      )}

      {cards > 0 && (
        <Cards $single={cards === 1}>
          {data.shopping && (
            <Card to="/shopping">
              <CardKicker>
                <HiOutlineCheckCircle size={18} aria-hidden="true" />
                Покупки
              </CardKicker>
              <CardTitle>{data.shopping.title}</CardTitle>
              <CardText>{data.shopping.preview}</CardText>
              <CardFoot>Лишилось {data.shopping.left}</CardFoot>
            </Card>
          )}
          {data.goal && (
            <Card to={`/goals/${data.goal.id}`}>
              <CardKicker>
                <HiOutlineFlag size={18} aria-hidden="true" />
                Ціль
              </CardKicker>
              <CardTitle>{data.goal.name}</CardTitle>
              <Percent>{data.goal.pct}%</Percent>
              <CardFoot>
                <Bar $pct={data.goal.pct} />
                {data.goal.progress}
              </CardFoot>
            </Card>
          )}
        </Cards>
      )}

      {data.recent.length > 0 && (
        <Section title="Останні операції" action={<SectionAction to="/transactions">Усі</SectionAction>}>
          <Group>
            {data.recent.map((tx) => (
              <TxRow
                key={tx.id}
                transaction={tx}
                categories={data.categories}
                accounts={data.accounts}
              />
            ))}
          </Group>
        </Section>
      )}
    </Screen>
  );
}

export default MobileOverview;
