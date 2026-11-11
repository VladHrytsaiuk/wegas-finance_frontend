import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import styled from "styled-components";

import { useExportPage } from "../../../hooks/Settings/useExportPage";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { useUserRole } from "../../../hooks/useUserRole";
import { getAccountsApi } from "../../../services/apiAccounts";
import { getCategoriesApi } from "../../../services/apiCategories";
import { getCounterpartiesApi } from "../../../services/apiCounterparties";
import { getUsersApi } from "../../../services/apiUsers";
import { CounterpartyTile } from "../../../mobile/counterpartyTile";
import { Footnote, Switch } from "../../../mobile/ui/Field";
import { Group, Meta, Row, Section } from "../../../mobile/ui/Group";
import { Segmented } from "../../../mobile/ui/Segmented";
import { PrimaryButton } from "../../../mobile/ui/Sheet";
import { Tile } from "../../../mobile/ui/Tile";
import { AccountsFilterSheet } from "../Statistics/AccountsFilterSheet";
import { PeriodSheet } from "../Statistics/PeriodSheet";
import { periodLabel, periodRange, type CustomRange, type PeriodKey } from "../Statistics/statistics";
import { MultiPickSheet, type PickOption } from "./MultiPickSheet";
import { SettingsScreen } from "./SettingsScreen";

// Експорт: операції (Excel/CSV/PDF з фільтрами), звіт зі статистики, резервна копія (JSON).

type Tab = "transactions" | "stats" | "backup";

interface InitialExport {
  initialFrom?: number;
  initialTo?: number;
  initialAccountIds?: string[];
  initialTab?: Tab;
}

const FORMATS = [
  { value: "xlsx" as const, label: "Excel" },
  { value: "csv" as const, label: "CSV" },
  { value: "pdf" as const, label: "PDF" },
];

const TYPES: PickOption[] = [
  { id: "expense", label: "Витрати" },
  { id: "income", label: "Доходи" },
  { id: "transfer", label: "Перекази" },
];

/** Головна дія завжди на виду, а не під прокруткою. */
const Action = styled.div`
  position: sticky;
  bottom: 12px;
  z-index: 5;
`;

const dayInput = (ms: number) => format(new Date(ms), "yyyy-MM-dd");
const summary = (ids: string[], names: (id: string) => string | undefined) =>
  ids.length === 0 ? "Усі" : ids.length === 1 ? (names(ids[0]) ?? "1") : `Обрано ${ids.length}`;

export default function MobileExport() {
  usePageTitle("Експорт");
  const location = useLocation();
  const initial = (location.state as { export?: InitialExport } | null)?.export;
  const { isStartupper } = useUserRole();
  const { state, actions } = useExportPage(initial);
  const { activeTab, loading, transFilters, transFormat, statsAccountIds, statsOptions } = state;

  // Період: готовий варіант або свій діапазон; з екрана «Статистика» приходить свій.
  const [period, setPeriod] = useState<PeriodKey>(initial?.initialFrom ? "custom" : "30d");
  const [custom, setCustom] = useState<CustomRange>(() => ({
    from: dayInput(initial?.initialFrom ?? Date.now() - 29 * 864e5),
    to: dayInput(initial?.initialTo ?? Date.now()),
  }));
  const [periodOpen, setPeriodOpen] = useState(false);
  const [accountsOpen, setAccountsOpen] = useState(false);
  const [pick, setPick] = useState<null | "type" | "category" | "counterparty" | "user">(null);

  const { data: accounts = [] } = useQuery({ queryKey: ["accounts"], queryFn: getAccountsApi });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: getCategoriesApi });
  const { data: counterparties = [] } = useQuery({ queryKey: ["counterparties"], queryFn: getCounterpartiesApi });
  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: getUsersApi });
  const { user } = useUserRole();

  const range = useMemo(() => periodRange(period, custom), [period, custom]);
  const applyPeriod = (key: PeriodKey, c: CustomRange) => {
    setPeriod(key);
    setCustom(c);
    const r = periodRange(key, c);
    actions.setDateRange({ from: r.from, to: r.to });
  };

  const accountIds = activeTab === "transactions" ? transFilters.accountIds : statsAccountIds;
  const setAccountIds = (ids: string[]) =>
    activeTab === "transactions" ? actions.handleTransFilterChange("accountIds", ids) : actions.setStatsAccountIds(ids);

  const categoryOptions = useMemo<PickOption[]>(() => {
    const roots = categories.filter((c) => !c.parent_id);
    return roots.flatMap((root) => {
      const kids = categories.filter((c) => c.parent_id === root.id);
      return [
        { id: root.id, label: `${root.name} · ${root.type === "income" ? "дохід" : "витрата"}`, leading: <Tile iconName={root.icon} color={root.color} size={30} />, children: kids.map((k) => k.id) },
        ...kids.map((k) => ({ id: k.id, label: k.name, leading: <Tile iconName={k.icon} color={k.color} size={26} />, nested: true })),
      ];
    });
  }, [categories]);
  const counterpartyOptions = useMemo<PickOption[]>(
    () => counterparties.map((cp) => ({ id: cp.id, label: cp.name, leading: <CounterpartyTile cp={cp} size={30} /> })),
    [counterparties],
  );
  const userOptions = useMemo<PickOption[]>(() => users.map((u) => ({ id: u.id, label: u.name })), [users]);

  const pickers = {
    type: { title: "Тип операцій", options: TYPES, value: transFilters.type, key: "type" },
    category: { title: "Категорії", options: categoryOptions, value: transFilters.categoryIds, key: "categoryIds" },
    counterparty: { title: "Контрагенти", options: counterpartyOptions, value: transFilters.counterpartyIds, key: "counterpartyIds" },
    user: { title: "Учасники", options: userOptions, value: transFilters.userIds, key: "userIds" },
  } as const;
  const current = pick ? pickers[pick] : null;
  const nameOf = (options: PickOption[]) => (id: string) => options.find((o) => o.id === id)?.label;

  const tabs = [
    { value: "transactions" as Tab, label: "Операції" },
    { value: "stats" as Tab, label: "Статистика" },
    ...(isStartupper ? [] : [{ value: "backup" as Tab, label: "Копія" }]),
  ];

  return (
    <SettingsScreen title="Експорт">
      <Segmented label="Що експортувати" options={tabs} value={activeTab} onChange={actions.setActiveTab} />

      {activeTab !== "backup" && (
        <Section caption="Параметри">
          <Group>
            <Row onClick={() => setPeriodOpen(true)} title="Період" trailing={<Meta>{periodLabel(period, range)}</Meta>} chevron />
            <Row
              onClick={() => setAccountsOpen(true)}
              title="Рахунки"
              trailing={<Meta>{summary(accountIds, (id) => accounts.find((a) => a.id === id)?.name)}</Meta>}
              chevron
            />
          </Group>
        </Section>
      )}

      {activeTab === "transactions" && (
        <>
          <Section caption="Фільтри">
            <Group>
              <Row onClick={() => setPick("type")} title="Тип" trailing={<Meta>{summary(transFilters.type, nameOf(TYPES))}</Meta>} chevron />
              <Row onClick={() => setPick("category")} title="Категорії" trailing={<Meta>{summary(transFilters.categoryIds, (id) => categories.find((c) => c.id === id)?.name)}</Meta>} chevron />
              <Row onClick={() => setPick("counterparty")} title="Контрагенти" trailing={<Meta>{summary(transFilters.counterpartyIds, nameOf(counterpartyOptions))}</Meta>} chevron />
              <Row onClick={() => setPick("user")} title="Учасники" trailing={<Meta>{summary(transFilters.userIds, nameOf(userOptions))}</Meta>} chevron />
            </Group>
          </Section>
          <Section caption="Формат">
            <Segmented label="Формат файлу" options={FORMATS} value={transFormat} onChange={actions.setTransFormat} />
          </Section>
        </>
      )}

      {activeTab === "stats" && (
        <Section caption="Що включити у звіт">
          <Group>
            {(
              [
                ["summary", "Підсумки"],
                ["categories", "Категорії"],
                ["topTransactions", "Топ-15 найбільших операцій"],
                ["counterparties", "Контрагенти"],
                ["tags", "Теги"],
              ] as const
            ).map(([key, label]) => (
              <Row
                key={key}
                title={label}
                trailing={<Switch label={label} checked={statsOptions[key]} onChange={() => actions.toggleStatsOption(key)} />}
              />
            ))}
          </Group>
          <Footnote>Звіт формується в Excel (.xlsx): кілька аркушів з різними зрізами даних за вибраний період і рахунки.</Footnote>
        </Section>
      )}

      {activeTab === "backup" && (
        <Section>
          <Group>
            <Row title="Повний бекап бази даних" subtitle="Усі рахунки, категорії, магазини, теги й операції у файлі JSON — для безпечного зберігання або подальшого імпорту." wrapSubtitle />
          </Group>
          <Footnote>Збережіть файл у надійному місці. Копія містить усі фінансові дані родини.</Footnote>
        </Section>
      )}

      <Action>
        <PrimaryButton type="button" disabled={loading} onClick={() => void actions.handleExport()}>
          {loading ? "Готуємо файл…" : activeTab === "backup" ? "Завантажити копію" : activeTab === "stats" ? "Сформувати звіт" : "Завантажити"}
        </PrimaryButton>
      </Action>

      <PeriodSheet
        open={periodOpen}
        onOpenChange={setPeriodOpen}
        period={period}
        custom={custom}
        onPeriod={(key) => applyPeriod(key, custom)}
        onCustom={(c) => applyPeriod("custom", c)}
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
      {current && pick && (
        <MultiPickSheet
          key={pick}
          open
          onOpenChange={(o) => !o && setPick(null)}
          title={current.title}
          options={current.options}
          value={current.value}
          onChange={(ids) => actions.handleTransFilterChange(current.key, ids)}
        />
      )}
    </SettingsScreen>
  );
}
