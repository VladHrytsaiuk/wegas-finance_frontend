import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { useSettings } from "../../../context/SettingsContext";
import { useMeterAnalytics } from "../../../hooks/Utility/useUtilityMeterAnalyticsPage";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { formatMoney } from "../../../utils/helpers";
import { Group, Meta, Row, Section } from "../../../mobile/ui/Group";
import { ScreenState } from "../../../mobile/ui/Loader";
import { NavBar } from "../../../mobile/ui/NavBar";
import { LargeTitle } from "../../../mobile/ui/Screen";
import { fmtNumber, monthLabel, serviceType } from "./utility";

// Аналітика лічильника: споживання (стовпчик відносно піку), вартість за
// місяць і тариф — його зміни видно по рядках, стрілка показує подорожчання.

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
  display: block;
  width: 100%;
  height: 8px;
  margin: 6px 0 4px;
  border-radius: 4px;
  background: var(--m-fill);
  overflow: hidden;
`;

const Fill = styled.span<{ $pct: number; $color: string }>`
  display: block;
  height: 100%;
  width: ${(p) => p.$pct}%;
  border-radius: 4px;
  background: ${(p) => p.$color};
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

export default function MobileMeterAnalytics() {
  const navigate = useNavigate();
  const { language } = useSettings();
  const { meter, stats, isLoading, hasData, meterId } = useMeterAnalytics();
  usePageTitle(meter ? `Аналітика: ${meter.name}` : "Аналітика");

  const back = () => navigate(`/utility/${meterId}`);

  if (!meter) {
    return (
      <Page>
        <NavBar backLabel="Лічильник" onBack={back} />
        <ScreenState loading={isLoading}>
          {isLoading ? "Завантаження…" : "Лічильник не знайдено"}
        </ScreenState>
      </Page>
    );
  }

  const color = serviceType(meter.type).color;
  // Бекенд віддає вартість у гривнях (не в копійках), як і глобальна статистика.
  const money = (major: number) =>
    formatMoney(major * 100, meter.currency, language);
  const peak = Math.max(1, ...stats.map((s) => s.total_consumption));
  const totalCost = stats.reduce((n, s) => n + s.total_cost, 0);
  const totalConsumption = stats.reduce((n, s) => n + s.total_consumption, 0);
  const ordered = [...stats].reverse();

  return (
    <Page>
      <NavBar backLabel={meter.name} onBack={back} />
      <Body>
        <LargeTitle
          title="Аналітика"
          subtitle={`${meter.name} · ${meter.unit} / ${meter.currency}`}
        />

        {!hasData && (
          <Empty>Даних ще немає. Внесіть хоча б два показники.</Empty>
        )}

        {hasData && (
          <>
            <Tiles>
              <Stat>
                <Meta>Витрачено</Meta>
                <strong>{money(totalCost)}</strong>
              </Stat>
              <Stat>
                <Meta>Спожито</Meta>
                <strong>
                  {fmtNumber(totalConsumption)} {meter.unit}
                </strong>
              </Stat>
            </Tiles>

            <Section caption="По місяцях">
              <Group>
                {ordered.map((row, index) => {
                  // Порівнюємо з попереднім у часі місяцем (він наступний у зворотному списку).
                  const before = ordered[index + 1];
                  const change =
                    before && before.avg_tariff
                      ? row.avg_tariff - before.avg_tariff
                      : 0;
                  return (
                    <Row
                      key={row.month}
                      title={monthLabel(row.month)}
                      subtitle={
                        <Sub>
                          <Bar role="img" aria-label="Споживання">
                            <Fill
                              $color={color}
                              $pct={(row.total_consumption / peak) * 100}
                            />
                          </Bar>
                          {fmtNumber(row.total_consumption)} {meter.unit} · тариф{" "}
                          {fmtNumber(row.avg_tariff, 4)}
                          {change > 0 ? " ↑" : change < 0 ? " ↓" : ""}
                        </Sub>
                      }
                      trailing={<strong>{money(row.total_cost)}</strong>}
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
