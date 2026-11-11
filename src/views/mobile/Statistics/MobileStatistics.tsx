import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { HiOutlineArrowDownTray } from "react-icons/hi2";
import styled from "styled-components";

import { getAccountsApi } from "../../../services/apiAccounts";
import { getCategoriesApi } from "../../../services/apiCategories";
import { getCounterpartiesApi } from "../../../services/apiCounterparties";
import { statsService } from "../../../services/apiStats";
import { getUsersApi } from "../../../services/apiUsers";
import { useSettings } from "../../../context/SettingsContext";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { useUserRole } from "../../../hooks/useUserRole";
import { formatMoney } from "../../../utils/helpers";
import { Group, Meta, Row } from "../../../mobile/ui/Group";
import { ScreenState } from "../../../mobile/ui/Loader";
import { NavBar, NavButton } from "../../../mobile/ui/NavBar";
import { LargeTitle } from "../../../mobile/ui/Screen";
import { Segmented } from "../../../mobile/ui/Segmented";
import { Tile } from "../../../mobile/ui/Tile";
import { AccountsFilterSheet } from "./AccountsFilterSheet";
import { Donut } from "./Donut";
import { PeriodSheet } from "./PeriodSheet";
import { TrendChart } from "./TrendChart";
import {
  STAT_TABS,
  buildRows,
  donutSlices,
  percentLabel,
  periodLabel,
  periodRange,
  trendPoints,
  type CustomRange,
  type PeriodKey,
  type StatTab,
} from "./statistics";

// Статистика: де йдуть гроші й звідки приходять — динаміка, категорії,
// контрагенти й теги за обраний період та рахунки.

const Page = styled.div.attrs<{ "data-m-screen"?: string }>({
  "data-m-screen": "",
})`
  min-height: 100%;
  background: var(--m-bg);
  color: var(--m-label);
  font-family: var(--m-font);
  -webkit-font-smoothing: antialiased;
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0 16px 32px;
`;

const Hero = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-align: center;
`;

const Total = styled.strong`
  font-size: 34px;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
`;

const Card = styled.div`
  padding: 16px;
  border-radius: var(--m-radius-group);
  background: var(--m-surface);
`;

const Empty = styled.p`
  margin: 0;
  padding: 24px 16px;
  border-radius: var(--m-radius-group);
  background: var(--m-surface);
  text-align: center;
  font-size: 15px;
  color: var(--m-label-2);
`;

const Bar = styled.span`
  display: block;
  width: 100%;
  height: 4px;
  margin: 6px 0 0;
  border-radius: 2px;
  background: var(--m-fill);
  overflow: hidden;
`;

const BarFill = styled.span<{ $pct: number; $color: string }>`
  display: block;
  height: 100%;
  width: ${(p) => Math.max(2, p.$pct)}%;
  background: ${(p) => p.$color};
`;

const EXPENSE_COLOR = "#ff3b30";
const INCOME_COLOR = "#34c759";

const todayInput = () => format(new Date(), "yyyy-MM-dd");

export default function MobileStatistics() {
  usePageTitle("Статистика");
  const navigate = useNavigate();
  const { currency, language } = useSettings();
  const { user } = useUserRole();

  const [flow, setFlow] = useState<"expense" | "income">("expense");
  const [tab, setTab] = useState<StatTab>("category");
  const [period, setPeriod] = useState<PeriodKey>("30d");
  const [custom, setCustom] = useState<CustomRange>(() => {
    const now = new Date();
    return { from: format(new Date(now.getTime() - 29 * 864e5), "yyyy-MM-dd"), to: todayInput() };
  });
  const [accountIds, setAccountIds] = useState<string[]>([]);
  const [periodOpen, setPeriodOpen] = useState(false);
  const [accountsOpen, setAccountsOpen] = useState(false);

  const range = useMemo(() => periodRange(period, custom), [period, custom]);
  const filter = { from: range.from, to: range.to, accountIds, currency };
  const idsKey = accountIds.join(",");

  const { data: accounts = [] } = useQuery({ queryKey: ["accounts"], queryFn: getAccountsApi });
  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: getUsersApi });
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategoriesApi,
    staleTime: 5 * 60 * 1000,
  });
  const { data: counterparties = [] } = useQuery({
    queryKey: ["counterparties"],
    queryFn: getCounterpartiesApi,
    staleTime: 5 * 60 * 1000,
  });

  const { data: topData, isLoading: topLoading } = useQuery({
    queryKey: ["stats", "mobile-top", flow, tab, range.from, range.to, idsKey, currency],
    queryFn: () => statsService.getTopStats(flow, tab, filter, 0),
    placeholderData: (prev) => prev,
  });
  const { data: trendData, isLoading: trendLoading } = useQuery({
    queryKey: ["stats", "mobile-trend", flow, range.from, range.to, idsKey, currency],
    queryFn: () => statsService.getTrend(flow, filter),
    placeholderData: (prev) => prev,
  });

  // Бекенд міг віддати null для порожнього періоду.
  const top = useMemo(() => topData ?? [], [topData]);
  const trend = useMemo(() => trendData ?? [], [trendData]);

  const { rows, total } = useMemo(
    () => buildRows(tab, top, categories, counterparties),
    [tab, top, categories, counterparties],
  );
  const { points, monthly } = useMemo(() => trendPoints(trend, range), [trend, range]);
  const slices = useMemo(() => donutSlices(rows), [rows]);

  // Підсумок періоду береться з динаміки — вона містить усі операції без обмеження списку.
  const periodTotal = trend.reduce((sum, t) => sum + t.total, 0);
  const money = (minor: number) => formatMoney(minor, currency, language, false);
  const flowLabel = flow === "expense" ? "Витрати" : "Доходи";
  const color = flow === "expense" ? EXPENSE_COLOR : INCOME_COLOR;

  const accountsLabel =
    accountIds.length === 0
      ? "Усі"
      : accountIds.length === 1
        ? (accounts.find((a) => a.id === accountIds[0])?.name ?? "1 рахунок")
        : `${accountIds.length} рахунки`;

  const loading = (topLoading || trendLoading) && top.length === 0 && trend.length === 0;

  return (
    <Page>
      <NavBar
        backLabel="Ще"
        onBack={() => navigate("/more")}
        trailing={
          <NavButton
            type="button"
            aria-label="Експорт"
            onClick={() =>
              navigate("/settings/export", {
                state: {
                  export: {
                    initialFrom: range.from,
                    initialTo: range.to,
                    initialAccountIds: accountIds,
                    initialTab: "stats",
                  },
                },
              })
            }
          >
            <HiOutlineArrowDownTray size={22} />
          </NavButton>
        }
      />
      <Body>
        <LargeTitle title="Статистика" />

        <Segmented
          label="Тип операцій"
          value={flow}
          onChange={setFlow}
          options={[
            { value: "expense", label: "Витрати" },
            { value: "income", label: "Доходи" },
          ]}
        />

        <Group>
          <Row title="Період" trailing={<Meta>{periodLabel(period, range)}</Meta>} chevron onClick={() => setPeriodOpen(true)} />
          <Row title="Рахунки" trailing={<Meta>{accountsLabel}</Meta>} chevron onClick={() => setAccountsOpen(true)} />
        </Group>

        {loading ? (
          <ScreenState loading>Завантаження…</ScreenState>
        ) : trend.length === 0 && rows.length === 0 ? (
          <Empty>За цей період немає {flow === "expense" ? "витрат" : "доходів"}. Змініть період чи рахунки.</Empty>
        ) : (
          <>
            <Hero>
              <Meta>{flowLabel} · {periodLabel(period, range)}</Meta>
              <Total>{money(periodTotal)}</Total>
            </Hero>

            <Card>
              <TrendChart points={points} monthly={monthly} color={color} currency={currency} language={language} />
            </Card>

            <Segmented label="Розріз" value={tab} onChange={setTab} options={STAT_TABS} />

            {rows.length === 0 ? (
              <Empty>
                {tab === "counterparty"
                  ? "Операції без контрагента не потрапляють у цей розріз."
                  : tab === "tag"
                    ? "Серед операцій немає позначених тегами."
                    : "Немає даних за цей період."}
              </Empty>
            ) : (
              <>
                <Card>
                  <Donut slices={slices} total={money(total)} caption={flowLabel} />
                </Card>
                <Group>
                  {rows.map((row) => (
                    <Row
                      key={row.key}
                      leading={
                        <Tile
                          iconName={row.iconName}
                          logo={row.logo}
                          color={row.color}
                          size={40}
                        />
                      }
                      title={row.name}
                      subtitle={
                        <>
                          {percentLabel(row.percent)}
                          <Bar>
                            <BarFill $pct={row.percent} $color={row.color} />
                          </Bar>
                        </>
                      }
                      trailing={<strong style={{ fontWeight: 600 }}>{money(row.total)}</strong>}
                      inset={68}
                    />
                  ))}
                </Group>
              </>
            )}
          </>
        )}
      </Body>

      <PeriodSheet
        open={periodOpen}
        onOpenChange={setPeriodOpen}
        period={period}
        custom={custom}
        onPeriod={setPeriod}
        onCustom={setCustom}
      />
      <AccountsFilterSheet
        open={accountsOpen}
        onOpenChange={setAccountsOpen}
        accounts={accounts}
        users={users}
        meId={user?.id}
        value={accountIds}
        onChange={setAccountIds}
      />
    </Page>
  );
}
