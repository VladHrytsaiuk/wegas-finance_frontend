import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axios from "axios";
import styled from "styled-components";

import type { Account, CounterpartyBalance, Transaction } from "../../../types";
import {
  getCounterpartyApi,
  getCpCategoriesApi,
  updateCounterpartyApi,
} from "../../../services/apiCounterparties";
import { getAccountsApi } from "../../../services/apiAccounts";
import { getCategoriesApi } from "../../../services/apiCategories";
import {
  createTransactionApi,
  getTransactionsApi,
} from "../../../services/apiTransactions";
import { getUsersApi } from "../../../services/apiUsers";
import { useUserRole } from "../../../hooks/useUserRole";
import { useSettings } from "../../../context/SettingsContext";
import { formatMoney, sortTransactions } from "../../../utils/helpers";
import type { TransactionListItem } from "../../../hooks/Transactions/useTransactionItem";
import { CounterpartyTile } from "../../../mobile/counterpartyTile";
import { Section, Group, Row, Meta } from "../../../mobile/ui/Group";
import { NavBar, NavButton } from "../../../mobile/ui/NavBar";
import { Segmented } from "../../../mobile/ui/Segmented";
import { PrimaryButton, Sheet } from "../../../mobile/ui/Sheet";
import { TxRow } from "../../../mobile/ui/TxRow";
import { AddSheet } from "../AddSheet/AddSheet";
import { AccountPicker } from "../AddSheet/Pickers";
import { emptyInitial, type DebtType } from "../AddSheet/editState";
import { minorToInput } from "../AddSheet/items";

// Людина в боргах: баланси по валютах з діями, списання, історія, редагування.
// Усе, що вміла стара сторінка DebtorDetails.

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
  padding: 8px 16px 32px;
`;

const Hero = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;

  h2 {
    margin: 6px 0 0;
    font-size: 22px;
    font-weight: 700;
  }

  p {
    margin: 0;
    font-size: 15px;
    color: var(--m-label-2);
  }
`;

const BalanceCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-radius: var(--m-radius-group);
  background: var(--m-surface);
`;

const BalanceLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: var(--m-label-2);
`;

const BalanceAmount = styled.strong<{ $positive: boolean }>`
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  color: ${(p) => (p.$positive ? "var(--m-accent)" : "var(--m-label)")};
`;

const Actions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  min-height: 44px;
  padding: 0 12px;
  border: none;
  border-radius: 12px;
  font: inherit;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  color: ${(p) => (p.$primary ? "var(--m-on-accent)" : "var(--m-accent)")};
  background: ${(p) => (p.$primary ? "var(--m-accent)" : "var(--m-accent-soft)")};
`;

const TextAction = styled.button`
  align-self: center;
  padding: 2px 0;
  border: none;
  background: none;
  font: inherit;
  font-size: 15px;
  color: var(--m-label-2);
  cursor: pointer;
`;

const Note = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: 1.4;
  color: var(--m-label-2);
  text-align: center;
`;

const NameInput = styled.input`
  flex: 1;
  width: 100%;
  min-width: 0;
  border: none;
  background: none;
  outline: none;
  font: inherit;
  font-size: 17px;
  color: var(--m-label);
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Chip = styled.button<{ $active: boolean }>`
  height: 34px;
  padding: 0 14px;
  border: none;
  border-radius: 17px;
  font: inherit;
  font-size: 15px;
  cursor: pointer;
  color: ${(p) => (p.$active ? "var(--m-on-accent)" : "var(--m-label)")};
  background: ${(p) => (p.$active ? "var(--m-accent)" : "var(--m-surface)")};
`;

const Center = styled.p`
  margin: 40vh 0 0;
  text-align: center;
  color: var(--m-label-2);
`;

const EPS = 1;
type CpType = "person" | "shop" | "other";

const errorMessage = (error: unknown) =>
  (axios.isAxiosError(error) && error.response?.data?.error) ||
  "Не вдалося виконати дію";

export default function MobileDebtor() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { language } = useSettings();
  const { user: me, isStartupper: isChild } = useUserRole();

  const [operation, setOperation] = useState<null | {
    type: DebtType;
    amount?: number;
    currency?: string;
  }>(null);
  const [forgive, setForgive] = useState<CounterpartyBalance | null>(null);
  const [forgiveAccount, setForgiveAccount] = useState("");
  const [accountPicker, setAccountPicker] = useState(false);
  const [editing, setEditing] = useState<null | {
    name: string;
    type: CpType;
    category_id?: string;
  }>(null);

  const {
    data: cp,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["counterparty", id],
    queryFn: () => getCounterpartyApi(id),
    enabled: !!id,
  });
  const { data: history = [] } = useQuery({
    queryKey: ["transactions", "counterparty", id],
    queryFn: async () => {
      const res = await getTransactionsApi({
        counterparty_id: [id],
        limit: 100,
      });
      return (Array.isArray(res) ? res : res.data || []) as Transaction[];
    },
    enabled: !!id,
  });
  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccountsApi,
  });
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategoriesApi,
  });
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: getUsersApi,
  });
  const { data: cpCategories = [] } = useQuery({
    queryKey: ["cp-categories-for-select"],
    queryFn: getCpCategoriesApi,
    staleTime: 5 * 60 * 1000,
  });

  const refresh = () => {
    for (const key of [
      "counterparty",
      "counterparties",
      "transactions",
      "transactions-infinite",
      "accounts",
      "stats",
    ]) {
      queryClient.invalidateQueries({ queryKey: [key] });
    }
  };

  const forgiveMutation = useMutation({
    mutationFn: (balance: CounterpartyBalance) =>
      createTransactionApi({
        account_id: forgiveAccount,
        counterparty_id: id,
        amount: Math.abs(balance.balance),
        type: balance.balance > 0 ? "loan_repay" : "debt_repay",
        date: Date.now(),
        note: "Списання боргу (Forgiveness)",
        // Прощення не рухає гроші на рахунку — лише обнуляє борг.
        is_forgiveness: true,
      }),
    onSuccess: () => {
      toast.success("Борг успішно списано");
      setForgive(null);
      refresh();
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { name: string; type: CpType; category_id?: string }) =>
      // Бекенд замінює контрагента цілком — іконку й логотип передаємо як є.
      updateCounterpartyApi({
        id,
        ...data,
        icon: cp?.icon ?? "",
        logo: cp?.logo ?? "",
      }),
    onSuccess: () => {
      toast.success("Збережено");
      setEditing(null);
      refresh();
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const back = () =>
    window.history.length > 1 ? navigate(-1) : navigate("/debts");

  if (isLoading) {
    return (
      <Page>
        <NavBar backLabel="Борги" onBack={back} />
        <Center>Завантаження…</Center>
      </Page>
    );
  }
  if (isError || !cp) {
    return (
      <Page>
        <NavBar backLabel="Борги" onBack={back} />
        <Center>Не знайдено</Center>
      </Page>
    );
  }

  const money = (minor: number, cur: string) =>
    formatMoney(minor, cur, language);
  const active = (cp.balances ?? []).filter((b) => Math.abs(b.balance) > EPS);
  const hasPositive = active.some((b) => b.balance > 0);
  const hasNegative = active.some((b) => b.balance < 0);
  const status =
    [hasPositive ? "Мені винні" : "", hasNegative ? "Я винен" : ""]
      .filter(Boolean)
      .join(" • ") || "Боргів немає";
  const category = cpCategories.find((c) => c.id === cp.category_id);
  const forgiveAccountObj = accounts.find((a) => a.id === forgiveAccount);
  const sortedHistory = sortTransactions(
    history as TransactionListItem[],
  ) as TransactionListItem[];

  const startOperation = (type: DebtType, balance?: CounterpartyBalance) =>
    setOperation({
      type,
      amount: balance ? Math.abs(balance.balance) : undefined,
      currency: balance?.currency,
    });

  return (
    <Page>
      <NavBar
        backLabel="Борги"
        onBack={back}
        trailing={
          !isChild && (
            <NavButton
              type="button"
              onClick={() =>
                setEditing({
                  name: cp.name,
                  type: (cp.type as CpType) || "person",
                  category_id: cp.category_id ?? undefined,
                })
              }
            >
              Змінити
            </NavButton>
          )
        }
      />
      <Body>
        <Hero>
          <CounterpartyTile cp={cp} category={category} size={64} />
          <h2>{cp.name}</h2>
          <p>{status}</p>
        </Hero>

        {active.map((b) => {
          const positive = b.balance > 0;
          return (
            <BalanceCard key={b.currency}>
              <BalanceLabel>{positive ? "Мені винні" : "Я винен"}</BalanceLabel>
              <BalanceAmount $positive={positive}>
                {money(Math.abs(b.balance), b.currency)}
              </BalanceAmount>
              <Actions>
                <ActionButton
                  type="button"
                  $primary
                  onClick={() =>
                    startOperation(positive ? "loan_repay" : "debt_repay", b)
                  }
                >
                  {positive ? "Мені повернули" : "Повернути борг"}
                </ActionButton>
                <ActionButton
                  type="button"
                  onClick={() =>
                    startOperation(positive ? "loan_give" : "debt_take")
                  }
                >
                  {positive ? "Позичити ще" : "Взяти ще"}
                </ActionButton>
              </Actions>
              <TextAction
                type="button"
                onClick={() => {
                  setForgiveAccount("");
                  setForgive(b);
                }}
              >
                Списати борг
              </TextAction>
            </BalanceCard>
          );
        })}

        {active.length === 0 && (
          <Actions>
            <ActionButton
              type="button"
              $primary
              onClick={() => startOperation("loan_give")}
            >
              Позичити
            </ActionButton>
            <ActionButton
              type="button"
              onClick={() => startOperation("debt_take")}
            >
              Взяти в борг
            </ActionButton>
          </Actions>
        )}

        <Section
          caption={history.length ? `Історія · ${history.length}` : "Історія"}
        >
          {history.length ? (
            <Group>
              {sortedHistory.map((tx) => (
                <TxRow
                  key={tx.id}
                  transaction={tx}
                  categories={categories}
                  accounts={accounts as unknown as Account[]}
                  showTime
                />
              ))}
            </Group>
          ) : (
            <Note>Операцій з цією людиною ще немає.</Note>
          )}
        </Section>
      </Body>

      {operation && (
        <AddSheet
          open
          onOpenChange={(open) => {
            if (!open) {
              setOperation(null);
              refresh();
            }
          }}
          onOpenReceiptImport={() => undefined}
          title={cp.name}
          prefill={{
            ...emptyInitial(),
            kind: "debt",
            debtType: operation.type,
            counterpartyId: id,
            amount: operation.amount ? minorToInput(operation.amount) : "",
            // Як на старій сторінці: повернення всього боргу підписується.
            note:
              operation.amount && operation.currency
                ? `Погашення балансу: ${money(operation.amount, operation.currency)}`
                : "",
          }}
        />
      )}

      <Sheet
        open={!!forgive}
        onOpenChange={(open) => !open && setForgive(null)}
        title="Списати борг"
        footer={
          <PrimaryButton
            type="button"
            disabled={!forgiveAccount || forgiveMutation.isPending}
            onClick={() => forgive && forgiveMutation.mutate(forgive)}
          >
            {forgiveMutation.isPending ? "Списуємо…" : "Списати назавжди"}
          </PrimaryButton>
        }
      >
        {forgive && (
          <>
            <Note>
              {forgive.balance > 0
                ? `${cp.name} більше не винен вам ${money(Math.abs(forgive.balance), forgive.currency)}.`
                : `Ви більше не винні ${cp.name} ${money(Math.abs(forgive.balance), forgive.currency)}.`}{" "}
              Баланс боргу стане 0, а баланс ваших рахунків не зміниться.
            </Note>
            <Section caption="Технічний рахунок (формальність)">
              <Group>
                <Row
                  onClick={() => setAccountPicker(true)}
                  title="Рахунок"
                  trailing={<Meta>{forgiveAccountObj?.name ?? "Оберіть"}</Meta>}
                  chevron
                />
              </Group>
            </Section>
          </>
        )}
        <AccountPicker
          open={accountPicker}
          onOpenChange={setAccountPicker}
          title="Рахунок"
          accounts={accounts.filter((a) => !a.is_group && !a.is_archived)}
          users={users}
          currentUserId={me?.id}
          value={forgiveAccount}
          onSelect={setForgiveAccount}
          language={language}
        />
      </Sheet>

      <Sheet
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
        title="Контрагент"
        footer={
          <PrimaryButton
            type="button"
            disabled={!editing?.name.trim() || updateMutation.isPending}
            onClick={() =>
              editing &&
              updateMutation.mutate({ ...editing, name: editing.name.trim() })
            }
          >
            {updateMutation.isPending ? "Збереження…" : "Зберегти"}
          </PrimaryButton>
        }
      >
        {editing && (
          <>
            <Group>
              <Row
                title={
                  <NameInput
                    type="text"
                    aria-label="Імʼя"
                    value={editing.name}
                    onChange={(e) =>
                      setEditing({ ...editing, name: e.target.value })
                    }
                  />
                }
              />
            </Group>
            <Segmented
              label="Тип"
              value={editing.type}
              onChange={(type) =>
                setEditing({ ...editing, type, category_id: undefined })
              }
              options={[
                { value: "person", label: "Людина" },
                { value: "shop", label: "Магазин" },
                { value: "other", label: "Інше" },
              ]}
            />
            {cpCategories.some((c) => c.type === editing.type) && (
              <Section caption="Категорія">
                <ChipRow role="group" aria-label="Категорія контрагента">
                  {cpCategories
                    .filter((c) => c.type === editing.type)
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((c) => (
                      <Chip
                        key={c.id}
                        type="button"
                        $active={editing.category_id === c.id}
                        onClick={() =>
                          setEditing({
                            ...editing,
                            category_id:
                              editing.category_id === c.id ? undefined : c.id,
                          })
                        }
                      >
                        {c.name}
                      </Chip>
                    ))}
                </ChipRow>
              </Section>
            )}
            <Group>
              <Row
                onClick={() => navigate("/counterparties")}
                title="Іконка, колір і логотип"
                subtitle="У розділі «Контрагенти»"
                chevron
              />
            </Group>
          </>
        )}
      </Sheet>
    </Page>
  );
}
