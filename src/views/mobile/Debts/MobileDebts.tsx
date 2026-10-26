import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { HiPlus } from "react-icons/hi2";
import styled from "styled-components";

import type { Counterparty } from "../../../types";
import {
  getCounterpartiesApi,
  getCpCategoriesApi,
} from "../../../services/apiCounterparties";
import { useSettings } from "../../../context/SettingsContext";
import { formatMoney } from "../../../utils/helpers";
import { CounterpartyTile } from "../../../mobile/counterpartyTile";
import { Section, Group, Row, Amount, Meta } from "../../../mobile/ui/Group";
import { NavBar, NavButton } from "../../../mobile/ui/NavBar";
import { LargeTitle } from "../../../mobile/ui/Screen";
import { SearchField } from "../../../mobile/ui/SearchField";
import { Segmented } from "../../../mobile/ui/Segmented";
import { AddSheet } from "../AddSheet/AddSheet";
import { emptyInitial } from "../AddSheet/editState";
import {
  debtCurrencies,
  groupDebts,
  negativeBalances,
  positiveBalances,
  type DebtGroup,
} from "./debts";

// Борги: хто винен мені, кому винен я, закриті. Усе, що вміла стара сторінка
// боргів, крім перемикача «сітка/таблиця» — це вигляд для ПК.

type Filter = "all" | DebtGroup;

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
  flex-wrap: wrap;
`;

const Chip = styled.button<{ $active: boolean }>`
  height: 32px;
  padding: 0 14px;
  border: none;
  border-radius: 16px;
  font: inherit;
  font-size: 15px;
  cursor: pointer;
  color: ${(p) => (p.$active ? "var(--m-on-accent)" : "var(--m-label)")};
  background: ${(p) => (p.$active ? "var(--m-accent)" : "var(--m-surface)")};
`;

const SortButton = styled.button`
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  font-size: 13px;
  color: var(--m-accent);
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

const Lines = styled.span`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

export default function MobileDebts() {
  const navigate = useNavigate();
  const { language } = useSettings();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [currency, setCurrency] = useState("");
  const [desc, setDesc] = useState(false);
  const [adding, setAdding] = useState(false);

  const { data: counterparties = [], isLoading } = useQuery({
    queryKey: ["counterparties"],
    queryFn: getCounterpartiesApi,
  });
  const { data: cpCategories = [] } = useQuery({
    queryKey: ["cp-categories-for-select"],
    queryFn: getCpCategoriesApi,
    staleTime: 5 * 60 * 1000,
  });

  const currencies = useMemo(
    () => debtCurrencies(counterparties),
    [counterparties],
  );
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return counterparties
      .filter((cp) => !q || cp.name.toLowerCase().includes(q))
      .sort((a, b) => (desc ? -1 : 1) * a.name.localeCompare(b.name));
  }, [counterparties, query, desc]);
  const groups = useMemo(
    () => groupDebts(visible, currency || undefined),
    [visible, currency],
  );
  // Підсумки — по всіх людях з урахуванням валюти, як на старій сторінці.
  const totals = useMemo(
    () => groupDebts(counterparties, currency || undefined),
    [counterparties, currency],
  );

  const money = (minor: number, cur: string) =>
    formatMoney(minor, cur, language);
  const sums = (record: Record<string, number>, sign = "") =>
    Object.keys(record).length
      ? Object.entries(record)
          .map(([cur, value]) => `${sign}${money(Math.abs(value), cur)}`)
          .join(" · ")
      : money(0, currency || "UAH");
  const categoryOf = (cp: Counterparty) =>
    cpCategories.find((c) => c.id === cp.category_id);
  const onlyCurrency = (list: Counterparty["balances"]) =>
    list.filter((b) => !currency || b.currency === currency);

  const row = (cp: Counterparty, group: DebtGroup) => {
    const balances =
      group === "debtor"
        ? onlyCurrency(positiveBalances(cp))
        : group === "creditor"
          ? onlyCurrency(negativeBalances(cp))
          : [];
    return (
      <Row
        key={`${group}-${cp.id}`}
        to={`/debts/${cp.id}`}
        leading={
          <CounterpartyTile cp={cp} category={categoryOf(cp)} size={36} />
        }
        title={cp.name}
        subtitle={
          group === "debtor"
            ? "Мені винні"
            : group === "creditor"
              ? "Я винен"
              : "Розрахувались"
        }
        trailing={
          balances.length ? (
            <Lines>
              {balances.map((b) => (
                <Amount
                  key={b.currency}
                  $tone={group === "debtor" ? "income" : "default"}
                >
                  {money(Math.abs(b.balance), b.currency)}
                </Amount>
              ))}
            </Lines>
          ) : (
            <Meta>{money(0, cp.balances?.[0]?.currency || "UAH")}</Meta>
          )
        }
        chevron
      />
    );
  };

  const sections: { key: DebtGroup; caption: string; list: Counterparty[] }[] =
    [
      { key: "debtor", caption: "Мені винні", list: groups.debtors },
      { key: "creditor", caption: "Я винен", list: groups.creditors },
      { key: "settled", caption: "Закриті", list: groups.settled },
    ];
  const shown = sections.filter(
    (s) => (filter === "all" || filter === s.key) && s.list.length,
  );
  const hasAny =
    totals.debtors.length + totals.creditors.length + totals.settled.length > 0;

  return (
    <Page>
      <NavBar
        backLabel="Ще"
        onBack={() => navigate("/more")}
        trailing={
          <NavButton
            type="button"
            aria-label="Новий борг"
            onClick={() => setAdding(true)}
          >
            <HiPlus size={24} />
          </NavButton>
        }
      />
      <Body>
        <LargeTitle title="Борги" />

        {hasAny && (
          <Group>
            <Row
              title="Мені винні"
              trailing={<Amount $tone="income">{sums(totals.owedToMe)}</Amount>}
            />
            <Row
              title="Я винен"
              trailing={<Amount>{sums(totals.iOwe)}</Amount>}
            />
            <Row
              title="Баланс"
              trailing={
                <Amount>
                  {Object.keys(totals.net).length
                    ? Object.entries(totals.net)
                        .filter(([, v]) => v !== 0)
                        .map(
                          ([cur, v]) =>
                            `${v > 0 ? "+" : "−"}${money(Math.abs(v), cur)}`,
                        )
                        .join(" · ") || money(0, currency || "UAH")
                    : money(0, currency || "UAH")}
                </Amount>
              }
            />
          </Group>
        )}

        {hasAny && (
          <>
            <SearchField
              value={query}
              onChange={setQuery}
              label="Пошук людини"
            />
            <Segmented
              label="Показати"
              value={filter}
              onChange={setFilter}
              options={[
                { value: "all", label: "Усі" },
                { value: "debtor", label: "Мені винні" },
                { value: "creditor", label: "Я винен" },
                { value: "settled", label: "Закриті" },
              ]}
            />
            {currencies.length > 1 && (
              <Chips role="group" aria-label="Валюта">
                <Chip
                  type="button"
                  $active={!currency}
                  onClick={() => setCurrency("")}
                >
                  Усі валюти
                </Chip>
                {currencies.map((cur) => (
                  <Chip
                    key={cur}
                    type="button"
                    $active={currency === cur}
                    onClick={() => setCurrency(cur)}
                  >
                    {cur}
                  </Chip>
                ))}
              </Chips>
            )}
          </>
        )}

        {shown.map((section, index) => (
          <Section
            key={section.key}
            caption={`${section.caption} · ${section.list.length}`}
            action={
              index === 0 ? (
                <SortButton type="button" onClick={() => setDesc((d) => !d)}>
                  {desc ? "Я → А" : "А → Я"}
                </SortButton>
              ) : undefined
            }
          >
            <Group>{section.list.map((cp) => row(cp, section.key))}</Group>
          </Section>
        ))}

        {!isLoading && !hasAny && (
          <Empty>
            Боргів поки немає. Натисніть «+», щоб записати, кому позичили або в
            кого взяли.
          </Empty>
        )}
        {!isLoading && hasAny && shown.length === 0 && (
          <Empty>Нікого не знайдено</Empty>
        )}
      </Body>

      {adding && (
        <AddSheet
          open={adding}
          onOpenChange={(open) => !open && setAdding(false)}
          onOpenReceiptImport={() => undefined}
          title="Новий борг"
          prefill={{ ...emptyInitial(), kind: "debt", debtType: "loan_give" }}
        />
      )}
    </Page>
  );
}
