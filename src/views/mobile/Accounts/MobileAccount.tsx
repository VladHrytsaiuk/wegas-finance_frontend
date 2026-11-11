import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import {
  HiOutlineArrowsRightLeft,
  HiOutlineArrowTrendingDown,
  HiOutlineArrowTrendingUp,
  HiOutlineCreditCard,
} from "react-icons/hi2";
import styled from "styled-components";

import type { Account as StoreAccount } from "../../../types";
import { useAccountDetails } from "../../../hooks/Accounts/useAccountDetails";
import { useExchangeRates } from "../../../hooks/useExchangeRates";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { useSettings } from "../../../context/SettingsContext";
import { useSync } from "../../../context/SyncContext";
import type { TransactionListItem } from "../../../hooks/Transactions/useTransactionItem";
import { getAccountsApi } from "../../../services/apiAccounts";
import { monobankApi } from "../../../services/apiMonobank";
import { formatMoney } from "../../../utils/helpers";
import { BANK_GROUPS } from "../../../components/accounts/bankSkins";
import { AccountTile } from "../../../mobile/accountTile";
import { ConfirmSheet } from "../../../mobile/ui/ConfirmSheet";
import { Footnote } from "../../../mobile/ui/Field";
import { Amount, Group, Meta, Row, Section } from "../../../mobile/ui/Group";
import { ScreenState } from "../../../mobile/ui/Loader";
import { NavBar, NavButton } from "../../../mobile/ui/NavBar";
import { TxRow } from "../../../mobile/ui/TxRow";
import { AddSheet } from "../AddSheet/AddSheet";
import { emptyInitial, type Kind } from "../AddSheet/editState";
import Modal, { useModal } from "../../../components/ui/Modal";
import ImportModal from "../../../components/import/ImportModal";
import { AccountSheet } from "./AccountSheet";

// Рахунок: сума, швидкі дії (дохід / витрата / переказ), місяць, ціль чи сховище,
// останні операції, експорт, видалення.

const Page = styled.div.attrs<{ "data-m-screen"?: string }>({ "data-m-screen": "" })`
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
  padding: 8px 16px 32px;
`;

const Hero = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;
`;

const HeroTitle = styled.h1`
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.01em;
`;

const Balance = styled.strong`
  font-size: 34px;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
`;

const Actions = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
`;

const ActionButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 0;
  border: none;
  border-radius: var(--m-radius-group);
  font: inherit;
  font-size: 13px;
  color: var(--m-accent);
  background: var(--m-surface);
  cursor: pointer;

  &:disabled {
    color: var(--m-label-3);
    cursor: default;
  }
`;

const Progress = styled.span`
  display: block;
  width: 100%;
  height: 6px;
  margin: 6px 0 2px;
  border-radius: 3px;
  background: var(--m-fill);
  overflow: hidden;
`;

const Fill = styled.span<{ $pct: number; $color: string }>`
  display: block;
  height: 100%;
  width: ${(p) => p.$pct}%;
  border-radius: 3px;
  background: ${(p) => p.$color};
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

// Імпорт виписки поки що в старому вікні (буде перероблено разом з імпортом).
function ImportRow() {
  const { open } = useModal();
  return <Row onClick={() => open("import-statement")} title="Імпорт виписки" chevron />;
}

const TYPE_LABEL: Record<string, string> = {
  card: "Картка",
  cash: "Готівка",
  piggy_bank: "Накопичення",
  savings: "Накопичення",
  crypto: "Крипта",
};

export default function MobileAccount() {
  const navigate = useNavigate();
  const { currency, language } = useSettings();
  const { convert } = useExchangeRates();
  const { statusData, startPolling, stopPolling } = useSync();
  const details = useAccountDetails();
  const { account, accountId, linkedGoal, users, categories, recentTransactions, monthlyStats, isLoading, deleteAccount, isDeleting } = details;
  const { data: accounts = [] } = useQuery({ queryKey: ["accounts"], queryFn: getAccountsApi });
  const [editing, setEditing] = useState(false);
  const [operation, setOperation] = useState<Kind | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [syncing, setSyncing] = useState(false);
  usePageTitle(account?.name ?? "Рахунок");

  if (isLoading || !account) {
    return (
      <Page>
        <NavBar backLabel="Рахунки" onBack={() => navigate("/accounts")} />
        <ScreenState loading={isLoading}>{isLoading ? "Завантаження…" : "Рахунок не знайдено"}</ScreenState>
      </Page>
    );
  }

  const money = (minor: number) => formatMoney(minor, account.currency, language, false);
  const locked = !!account.is_synced;
  const owner = users.find((u) => u.id === account.user_id)?.name;
  const base = account.currency !== currency ? convert(account.balance, account.currency, currency) : undefined;
  const lastDigits = account.card_number ? `•••• ${account.card_number.slice(-4)}` : "";
  const extraCards = Array.from(new Set(account.card_numbers ?? [])).filter((m) => m && m !== account.card_number);
  const recent = recentTransactions.slice(0, 5);
  const hasMore = recentTransactions.length > 5;
  const bankLabel = account.bank_name ? (BANK_GROUPS[account.bank_name as keyof typeof BANK_GROUPS]?.label ?? account.bank_name) : "";
  const meta = [TYPE_LABEL[account.type] ?? "Рахунок", bankLabel, lastDigits, owner].filter(Boolean).join(" · ");
  const pct = linkedGoal && linkedGoal.target_amount > 0 ? Math.min(100, (linkedGoal.current_amount / linkedGoal.target_amount) * 100) : 0;
  const isSyncingNow = syncing || statusData.is_running;
  const isImportable =
    account.type === "card" &&
    !locked &&
    ["privat", "monobank"].some((bank) => [account.name, account.bank_name, account.icon].some((v) => v?.toLowerCase().includes(bank)));

  const sync = async () => {
    if (isSyncingNow) return;
    setSyncing(true);
    try {
      startPolling();
      await monobankApi.forceSync(account.id);
    } catch (err) {
      stopPolling();
      toast.error((axios.isAxiosError(err) && err.response?.data?.error) || "Не вдалося синхронізувати");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Modal>
    <Page>
      <NavBar
        backLabel="Рахунки"
        onBack={() => navigate("/accounts")}
        trailing={
          <NavButton type="button" onClick={() => setEditing(true)}>
            Змінити
          </NavButton>
        }
      />
      <Body>
        <Hero>
          <AccountTile account={account} size={64} />
          <HeroTitle>{account.name}</HeroTitle>
          <Meta>{meta}</Meta>
          <Balance>{formatMoney(account.balance, account.currency, language)}</Balance>
          {base !== undefined && <Meta>≈ {formatMoney(base, currency, language, false)}</Meta>}
          {locked && <Meta>Синхронізується з банком</Meta>}
        </Hero>

        <div>
          <Actions>
            <ActionButton type="button" disabled={locked} onClick={() => setOperation("income")}>
              <HiOutlineArrowTrendingUp size={22} /> Дохід
            </ActionButton>
            <ActionButton type="button" disabled={locked} onClick={() => setOperation("expense")}>
              <HiOutlineArrowTrendingDown size={22} /> Витрата
            </ActionButton>
            <ActionButton type="button" disabled={locked} onClick={() => setOperation("transfer")}>
              <HiOutlineArrowsRightLeft size={22} /> Переказ
            </ActionButton>
          </Actions>
          {locked && <Footnote>Рахунок синхронізується з банком, тому операції додаються автоматично.</Footnote>}
        </div>

        {(locked || isImportable) && (
          <Group>
            {isImportable && <ImportRow />}
            {locked && (
              <Row
                onClick={isSyncingNow ? undefined : () => void sync()}
                leading={<HiOutlineCreditCard size={22} color="var(--m-label-2)" />}
                title="Синхронізувати зараз"
                trailing={isSyncingNow ? <Meta>Триває…</Meta> : undefined}
                inset={52}
              />
            )}
          </Group>
        )}

        <Section caption="Цей місяць">
          <Group>
            <Row
              to={`/transactions?filter=income&account=${accountId}`}
              title="Доходи"
              trailing={<Amount $tone="income">+{money(monthlyStats.income)}</Amount>}
              chevron
            />
            <Row
              to={`/transactions?filter=expense&account=${accountId}`}
              title="Витрати"
              trailing={<Amount>−{money(monthlyStats.expense)}</Amount>}
              chevron
            />
            <Row title="Загальний оборот" trailing={<Meta>{money(monthlyStats.totalTurnover)}</Meta>} />
          </Group>
        </Section>

        {linkedGoal && (
          <Section caption="Прив'язана ціль">
            <Group>
              <Row
                to={`/goals/${linkedGoal.id}`}
                title={linkedGoal.name}
                subtitle={
                  <>
                    <Progress>
                      <Fill $pct={pct} $color={linkedGoal.color || "var(--m-accent)"} />
                    </Progress>
                    {formatMoney(linkedGoal.current_amount, linkedGoal.currency, language, false)} з{" "}
                    {formatMoney(linkedGoal.target_amount, linkedGoal.currency, language, false)} · {Math.round(pct)}%
                  </>
                }
                chevron
              />
            </Group>
          </Section>
        )}
        {!linkedGoal && (account.type === "piggy_bank" || (account.type as string) === "savings") && account.storage_type && (
          <Section caption="Тип сховища">
            <Group>
              <Row title={account.storage_type.name} />
            </Group>
          </Section>
        )}

        {account.type === "card" && extraCards.length > 0 && (
          <Section caption="Додаткові номери картки">
            <Group>
              {extraCards.map((mask) => (
                <Row key={mask} title={`•••• ${mask}`} />
              ))}
            </Group>
          </Section>
        )}

        <Section caption={recentTransactions.length ? "Останні операції" : "Операції"}>
          {recent.length > 0 ? (
            <Group>
              {recent.map((tx: TransactionListItem) => (
                <TxRow
                  key={tx.id}
                  transaction={tx as unknown as TransactionListItem}
                  categories={categories}
                  accounts={accounts as unknown as StoreAccount[]}
                  showTime
                />
              ))}
              {hasMore && <Row to={`/transactions?account=${accountId}`} title="Усі операції рахунку" chevron />}
            </Group>
          ) : (
            <Empty>На цьому рахунку ще немає операцій.</Empty>
          )}
        </Section>

        <Group>
          <Row
            onClick={() => navigate("/settings/export", { state: { export: { initialAccountIds: [account.id] } } })}
            title="Експорт операцій рахунку"
            chevron
          />
          <Row
            onClick={() => setConfirmDelete(true)}
            title={<span style={{ color: "#ff3b30" }}>Видалити рахунок</span>}
            trailing={isDeleting ? <Meta>…</Meta> : undefined}
          />
        </Group>
      </Body>

      {editing && <AccountSheet open={editing} onOpenChange={(open) => !open && setEditing(false)} account={account} />}
      {operation && (
        <AddSheet
          open
          onOpenChange={(open) => !open && setOperation(null)}
          onOpenReceiptImport={() => undefined}
          prefill={{ ...emptyInitial(), kind: operation, accountId: account.id }}
        />
      )}
      <ConfirmSheet
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        message={`Видалити рахунок «${account.name}»?`}
        actions={[{ label: "Видалити", destructive: true, onSelect: () => deleteAccount(account.id) }]}
      />
      {isImportable && (
        <Modal.Window name="import-statement" padding="0">
          <ImportModal account={account as unknown as import("../../../services/apiAccounts").Account} />
        </Modal.Window>
      )}
    </Page>
    </Modal>
  );
}
