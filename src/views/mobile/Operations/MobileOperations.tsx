import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { format, isToday, isYesterday, isThisYear, type Locale } from "date-fns";
import { uk, enUS } from "date-fns/locale";
import { HiOutlineCamera, HiOutlineReceiptPercent } from "react-icons/hi2";

import { usePageTitle } from "../../../hooks/usePageTitle";
import { useDebounce } from "../../../hooks/useDebounce";
import { useInfiniteTransactionsData } from "../../../hooks/Transactions/useInfiniteTransactionsData";
import { useSettings } from "../../../context/SettingsContext";
import { getAccountsApi } from "../../../services/apiAccounts";
import { getCategoriesApi } from "../../../services/apiCategories";
import {
  getInboxApi,
  getInboxPendingCountApi,
  PENDING_INBOX_STATUSES,
  type InboxEntry,
} from "../../../services/apiInbox";
import { formatMoney, sortTransactions } from "../../../utils/helpers";
import { collapseTransfers, type DisplayTransaction } from "../../../mobile/transfers";
import type { Account, Category } from "../../../types";
import type { TransactionListItem } from "../../../hooks/Transactions/useTransactionItem";
import { Screen, LargeTitle } from "../../../mobile/ui/Screen";
import { Section, Group, Row, Amount, Meta } from "../../../mobile/ui/Group";
import { Segmented } from "../../../mobile/ui/Segmented";
import { SearchField } from "../../../mobile/ui/SearchField";
import { Tile } from "../../../mobile/ui/Tile";
import { TxRow } from "../../../mobile/ui/TxRow";

type Filter = "all" | "expense" | "income" | "inbox";

const INBOX_STATUS: Record<string, string> = {
  new: "Новий",
  needs_account: "Оберіть рахунок",
  needs_link: "Звʼяжіть з операцією",
  needs_review: "Перевірте",
};

const Controls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: -8px;
`;

const Note = styled.p`
  margin: -8px 4px 0;
  font-size: 13px;
  color: var(--m-label-2);
`;

const Empty = styled.p`
  margin: 48px 16px;
  text-align: center;
  font-size: 15px;
  color: var(--m-label-2);
`;

const Sentinel = styled.div`
  height: 1px;
`;

function dayLabel(date: Date, locale: Locale) {
  if (isToday(date)) return "Сьогодні";
  if (isYesterday(date)) return "Вчора";
  return format(date, isThisYear(date) ? "d MMMM" : "d MMMM yyyy", { locale });
}

function MobileOperations() {
  usePageTitle("Операції");
  const { currency, language } = useSettings();
  const locale = language === "uk" ? uk : enUS;

  const [searchParams, setSearchParams] = useSearchParams();
  const filter = (searchParams.get("filter") as Filter) || "all";
  const setFilter = (value: Filter) =>
    setSearchParams(value === "all" ? {} : { filter: value }, { replace: true });

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 300);

  const { data: accounts = [] } = useQuery({ queryKey: ["accounts"], queryFn: getAccountsApi });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: getCategoriesApi });
  const { data: inboxCount = 0 } = useQuery({
    queryKey: ["inbox", "pending-count"],
    queryFn: getInboxPendingCountApi,
    staleTime: 30 * 1000,
  });

  const isInbox = filter === "inbox";
  const list = useInfiniteTransactionsData({
    type: filter === "expense" || filter === "income" ? filter : undefined,
    search: debouncedSearch || undefined,
  });
  const inbox = useQuery({
    queryKey: ["inbox", "mobile-pending"],
    queryFn: () => getInboxApi({ status: [...PENDING_INBOX_STATUSES], limit: 100 }),
    enabled: isInbox,
  });

  // Групи по днях; підсумок дня — доходи мінус витрати в базовій валюті.
  const groups = useMemo(() => {
    const byDay = new Map<string, { label: string; total: number; items: DisplayTransaction[] }>();
    const sorted = sortTransactions(list.transactions as TransactionListItem[]);
    for (const tx of collapseTransfers(sorted, accounts as unknown as Account[])) {
      const date = new Date(tx.date);
      const key = format(date, "yyyy-MM-dd");
      if (!byDay.has(key)) byDay.set(key, { label: dayLabel(date, locale), total: 0, items: [] });
      const group = byDay.get(key)!;
      group.items.push(tx);
      const txCurrency =
        (accounts as unknown as Account[]).find((a) => a.id === tx.account_id)?.currency ||
        tx.currency ||
        currency;
      if (txCurrency === currency) {
        if (tx.type === "income") group.total += tx.amount;
        if (tx.type === "expense") group.total -= tx.amount;
      }
    }
    return [...byDay.values()];
  }, [list.transactions, accounts, currency, locale]);

  // Довантаження, коли низ списку доходить до екрана.
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = list;
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || isInbox) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
      },
      { rootMargin: "400px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, isInbox]);

  const signed = (amount: number) =>
    `${amount > 0 ? "+" : amount < 0 ? "−" : ""}${formatMoney(Math.abs(amount), currency, language)}`;

  const inboxRow = (entry: InboxEntry) => {
    const title = entry.merchant || entry.receipt_source?.merchant || entry.note || "Новий чек";
    const when = entry.occurred_at ?? entry.created_at;
    const subtitle = [
      INBOX_STATUS[entry.status] ?? entry.status,
      when ? format(new Date(when), "d MMM, HH:mm", { locale }) : null,
    ]
      .filter(Boolean)
      .join(" · ");
    return (
      <Row
        key={entry.id}
        to={`/inbox/${entry.id}`}
        leading={
          <Tile
            tint="green"
            icon={
              entry.source_type === "photo" ? (
                <HiOutlineCamera size={20} />
              ) : (
                <HiOutlineReceiptPercent size={20} />
              )
            }
          />
        }
        title={title}
        subtitle={subtitle}
        trailing={
          entry.total !== null ? (
            <Amount>{formatMoney(entry.total, entry.currency || currency, language)}</Amount>
          ) : undefined
        }
        chevron
      />
    );
  };

  return (
    <Screen>
      <LargeTitle title="Операції" />

      <Controls>
        {!isInbox && <SearchField value={search} onChange={setSearch} label="Пошук операцій" />}
        <Segmented
          label="Що показати"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "Усі" },
            { value: "expense", label: "Витрати" },
            { value: "income", label: "Доходи" },
            { value: "inbox", label: inboxCount > 0 ? `Чеки · ${inboxCount}` : "Чеки" },
          ]}
        />
      </Controls>

      {isInbox ? (
        <>
          <Note>Чеки з Telegram-бота, фото й файлів. Відкрийте чек, щоб звʼязати його з операцією.</Note>
          {inbox.data?.data.length ? (
            <Group>{inbox.data.data.map(inboxRow)}</Group>
          ) : (
            !inbox.isLoading && <Empty>Усі чеки розібрано</Empty>
          )}
        </>
      ) : (
        <>
          {groups.map((group) => (
            <Section
              key={group.label}
              caption={group.label}
              action={
                group.total !== 0 ? <Meta>{signed(group.total)}</Meta> : undefined
              }
            >
              <Group>
                {group.items.map((tx) => (
                  <TxRow
                    key={tx.id}
                    transaction={tx}
                    categories={categories as Category[]}
                    accounts={accounts as unknown as Account[]}
                    subtitle={tx.displaySubtitle}
                    showTime
                  />
                ))}
              </Group>
            </Section>
          ))}
          {!list.isLoading && groups.length === 0 && (
            <Empty>{debouncedSearch ? "Нічого не знайдено" : "Операцій поки немає"}</Empty>
          )}
          <Sentinel ref={sentinelRef} />
        </>
      )}
    </Screen>
  );
}

export default MobileOperations;
