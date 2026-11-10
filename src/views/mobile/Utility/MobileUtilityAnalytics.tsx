import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { useSettings } from "../../../context/SettingsContext";
import { useUtilityAnalytics } from "../../../hooks/Utility/useUtilityAnalytics";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { formatMoney } from "../../../utils/helpers";
import { Group, Meta, Row, Section } from "../../../mobile/ui/Group";
import { ScreenState } from "../../../mobile/ui/Loader";
import { NavBar } from "../../../mobile/ui/NavBar";
import { LargeTitle } from "../../../mobile/ui/Screen";
import { monthLabel, serviceType } from "./utility";

// Аналітика комуналки: за рік, середній платіж і витрати по місяцях зі
// стовпчиками за типами послуг (кожен колір — свій тип).

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
  gap: 24px;
  padding: 0 16px 32px;
`;

const Tiles = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const Stat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px;
  border-radius: var(--m-radius-group);
  background: var(--m-surface);

  strong {
    font-size: 20px;
    letter-spacing: -0.01em;
  }
`;

const Bar = styled.span`
  display: flex;
  width: 100%;
  height: 8px;
  margin-top: 6px;
  border-radius: 4px;
  overflow: hidden;
  background: var(--m-fill);
`;

const Segment = styled.span<{ $color: string; $pct: number }>`
  display: block;
  height: 100%;
  width: ${(p) => p.$pct}%;
  background: ${(p) => p.$color};
`;

const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  padding: 0 4px;
  font-size: 13px;
  color: var(--m-label-2);

  span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  i {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }
`;

const Sub = styled.span`
  display: flex;
  flex-direction: column;
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

export default function MobileUtilityAnalytics() {
  usePageTitle("Аналітика комуналки");
  const navigate = useNavigate();
  const { language } = useSettings();
  const { isLoading, chartData, allKeys, totalYearCost, avgMonthly, hasData } =
    useUtilityAnalytics();
  const money = (major: number) => formatMoney(major * 100, "UAH", language);

  type Row = Record<string, number | string>;
  const monthTotal = (row: Row) =>
    allKeys.reduce((sum, key) => sum + Number(row[key] || 0), 0);
  const peak = Math.max(1, ...(chartData as Row[]).map(monthTotal));

  return (
    <Page>
      <NavBar backLabel="Комуналка" onBack={() => navigate("/utility")} />
      <Body>
        <LargeTitle title="Аналітика" subtitle="Витрати за останній рік" />

        {isLoading && <ScreenState loading>Завантаження…</ScreenState>}
        {!isLoading && !hasData && (
          <Empty>Даних для аналітики за цей період ще немає.</Empty>
        )}

        {hasData && (
          <>
            <Tiles>
              <Stat>
                <Meta>Всього за рік</Meta>
                <strong>{money(totalYearCost)}</strong>
              </Stat>
              <Stat>
                <Meta>Середній платіж / міс</Meta>
                <strong>{money(avgMonthly)}</strong>
              </Stat>
            </Tiles>

            <Legend aria-label="Типи послуг">
              {allKeys.map((key) => (
                <span key={key}>
                  <i style={{ background: serviceType(key).color }} />
                  {serviceType(key).label}
                </span>
              ))}
            </Legend>

            <Section caption="По місяцях">
              <Group>
                {[...(chartData as Row[])].reverse().map((row) => {
                  const total = monthTotal(row);
                  return (
                    <Row
                      key={String(row.month)}
                      title={monthLabel(String(row.month))}
                      subtitle={
                        <Sub>
                          <Bar role="img" aria-label="Частки типів послуг">
                            {allKeys.map((key) => {
                              const value = Number(row[key] || 0);
                              return value > 0 ? (
                                <Segment
                                  key={key}
                                  $color={serviceType(key).color}
                                  $pct={(value / peak) * 100}
                                  title={`${serviceType(key).label}: ${money(value)}`}
                                />
                              ) : null;
                            })}
                          </Bar>
                        </Sub>
                      }
                      trailing={<strong>{money(total)}</strong>}
                      inset={16}
                    />
                  );
                })}
              </Group>
            </Section>
          </>
        )}
      </Body>
    </Page>
  );
}
