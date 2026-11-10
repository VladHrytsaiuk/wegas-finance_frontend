import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineChartBar, HiPlus } from "react-icons/hi2";
import styled from "styled-components";

import { useSettings } from "../../../context/SettingsContext";
import { useUtilityMeters } from "../../../hooks/Utility/useUtility";
import { formatMoney } from "../../../utils/helpers";
import { Group, Meta, Row, Section } from "../../../mobile/ui/Group";
import { ConfirmSheet } from "../../../mobile/ui/ConfirmSheet";
import { ScreenState } from "../../../mobile/ui/Loader";
import { NavBar, NavButton } from "../../../mobile/ui/NavBar";
import { LargeTitle } from "../../../mobile/ui/Screen";
import { SearchField } from "../../../mobile/ui/SearchField";
import { Tile } from "../../../mobile/ui/Tile";
import { MeterFormSheet } from "./MeterFormSheet";
import {
  filterMeters,
  fmtNumber,
  groupMeters,
  meterDebt,
  METER_GROUPINGS,
  SERVICE_TYPES,
  serviceType,
  type MeterGrouping,
} from "./utility";

// Комуналка: лічильники з групуванням, пошуком і фільтром за типом.

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

const Chips = styled.div`
  display: flex;
  gap: 8px;
  margin: 0 -16px;
  padding: 0 16px;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Chip = styled.button<{ $active: boolean }>`
  flex-shrink: 0;
  height: 32px;
  padding: 0 14px;
  border: none;
  border-radius: 16px;
  font: inherit;
  font-size: 15px;
  white-space: nowrap;
  cursor: pointer;
  color: ${(p) => (p.$active ? "var(--m-on-accent)" : "var(--m-label)")};
  background: ${(p) => (p.$active ? "var(--m-accent)" : "var(--m-surface)")};
`;

const SortButton = styled.button.attrs({ type: "button" })`
  padding: 0;
  color: var(--m-accent);
  border: none;
  background: none;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
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

const Debt = styled(Meta)`
  font-weight: 600;
  color: #c2410c;
`;

export default function MobileUtility() {
  const navigate = useNavigate();
  const { language } = useSettings();
  const { meters, isLoading } = useUtilityMeters();
  const [query, setQuery] = useState("");
  const [types, setTypes] = useState<string[]>([]);
  const [grouping, setGrouping] = useState<MeterGrouping>("asset");
  const [groupingOpen, setGroupingOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const groups = useMemo(
    () => groupMeters(filterMeters(meters, query, types), grouping),
    [meters, query, types, grouping],
  );
  const shown = groups.reduce((n, g) => n + g.meters.length, 0);
  const toggleType = (value: string) =>
    setTypes((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );

  return (
    <Page>
      <NavBar
        backLabel="Ще"
        onBack={() => navigate("/more")}
        trailing={
          <span style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <NavButton
              type="button"
              aria-label="Аналітика"
              onClick={() => navigate("/utility/analytics")}
            >
              <HiOutlineChartBar size={24} />
            </NavButton>
            <NavButton
              type="button"
              aria-label="Нова послуга"
              onClick={() => setCreating(true)}
            >
              <HiPlus size={24} />
            </NavButton>
          </span>
        }
      />
      <Body>
        <LargeTitle title="Комуналка" />

        {meters.length > 0 && (
          <>
            <SearchField
              value={query}
              onChange={setQuery}
              label="Пошук лічильників"
            />
            <Chips role="group" aria-label="Тип послуги">
              {SERVICE_TYPES.map((t) => (
                <Chip
                  key={t.value}
                  type="button"
                  $active={types.includes(t.value)}
                  aria-pressed={types.includes(t.value)}
                  onClick={() => toggleType(t.value)}
                >
                  {t.label}
                </Chip>
              ))}
            </Chips>
          </>
        )}

        {isLoading && <ScreenState loading>Завантаження…</ScreenState>}

        {groups.map((group, index) => (
          <Section
            key={group.name}
            caption={`${group.name} · ${group.meters.length}`}
            action={
              index === 0 ? (
                <SortButton onClick={() => setGroupingOpen(true)}>
                  {METER_GROUPINGS.find((g) => g.value === grouping)?.label}
                </SortButton>
              ) : undefined
            }
          >
            <Group>
              {group.meters.map((meter) => {
                const type = serviceType(meter.type);
                const debt = meterDebt(meter);
                return (
                  <Row
                    key={meter.id}
                    to={`/utility/${meter.id}`}
                    leading={
                      <Tile
                        icon={<type.Icon size={24} />}
                        color={type.color}
                        size={44}
                      />
                    }
                    title={meter.name}
                    subtitle={
                      meter.counterparty?.name ||
                      `Рахунок: ${meter.personal_account || "—"}`
                    }
                    trailing={
                      <>
                        <span style={{ fontWeight: 500 }}>
                          {meter.last_reading_value !== undefined &&
                          meter.last_reading_value !== null &&
                          meter.last_reading_date
                            ? `${fmtNumber(meter.last_reading_value)} ${meter.unit}`
                            : "—"}
                        </span>
                        {debt > 0 ? (
                          <Debt>
                            Борг {formatMoney(debt, meter.currency, language)}
                          </Debt>
                        ) : (
                          <Meta>
                            {formatMoney(meter.tariff * 100, meter.currency, language)}
                            {" / "}
                            {meter.unit}
                          </Meta>
                        )}
                      </>
                    }
                    chevron
                    inset={72}
                  />
                );
              })}
            </Group>
          </Section>
        ))}

        {!isLoading && meters.length === 0 && (
          <Empty>
            Додайте першу послугу — світло, воду, газ чи інтернет — і вносьте
            показники щомісяця. Натисніть «+».
          </Empty>
        )}
        {!isLoading && meters.length > 0 && shown === 0 && (
          <Empty>Нічого не знайдено</Empty>
        )}
      </Body>

      <ConfirmSheet
        open={groupingOpen}
        onOpenChange={setGroupingOpen}
        message="Групувати лічильники"
        actions={METER_GROUPINGS.map((g) => ({
          label: g.value === grouping ? `✓ ${g.label}` : g.label,
          onSelect: () => setGrouping(g.value),
        }))}
      />
      {creating && (
        <MeterFormSheet
          open={creating}
          onOpenChange={(open) => !open && setCreating(false)}
        />
      )}
    </Page>
  );
}
