import { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import toast from "react-hot-toast";
import axios from "axios";
import styled from "styled-components";
import {
  HiOutlineCamera,
  HiOutlineReceiptPercent,
  HiChevronRight,
} from "react-icons/hi2";

import { useSettings } from "../../../context/SettingsContext";
import { getAccountsApi } from "../../../services/apiAccounts";
import { getCategoriesApi } from "../../../services/apiCategories";
import { createTransactionApi, getTransactionsApi } from "../../../services/apiTransactions";
import { setPendingReceiptPhoto } from "../../../utils/pendingReceiptPhoto";
import { CURRENCY_SYMBOLS } from "../../../utils/currency";
import type { Category, Transaction } from "../../../types";
import { Sheet, PrimaryButton } from "../../../mobile/ui/Sheet";
import { Group, Row, Meta } from "../../../mobile/ui/Group";
import { Segmented } from "../../../mobile/ui/Segmented";
import { Tile } from "../../../mobile/ui/Tile";
import { CategoryPicker, AccountPicker } from "./Pickers";

type TxType = "expense" | "income" | "transfer";
type Picker = null | "category" | "account" | "target";

const LAST_ACCOUNT_KEY = "m-last-account";

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
`;

const QuickAction = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 56px;
  padding: 12px;
  border: none;
  border-radius: var(--m-radius-group);
  background: var(--m-surface);
  color: var(--m-label);
  font: inherit;
  text-align: left;
  cursor: pointer;

  & strong {
    display: block;
    font-size: 15px;
    font-weight: 600;
  }

  & small {
    display: block;
    font-size: 12px;
    color: var(--m-label-2);
  }
`;

const Hint = styled.p`
  margin: -8px 4px 0;
  font-size: 13px;
  color: var(--m-label-2);
`;

const AmountField = styled.label`
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 6px;
  padding: 4px 0;
`;

const AmountInput = styled.input<{ $size: number }>`
  width: 100%;
  max-width: 260px;
  border: none;
  background: none;
  outline: none;
  text-align: right;
  font: inherit;
  font-size: ${(p) => p.$size}px;
  line-height: 1.15;
  font-weight: 600;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
  color: var(--m-label);

  &::placeholder {
    color: var(--m-label-3);
  }
`;

const CurrencyMark = styled.span`
  min-width: 80px;
  font-size: 30px;
  font-weight: 600;
  color: var(--m-label-2);
`;

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Chip = styled.button<{ $active: boolean }>`
  height: 36px;
  padding: 0 14px;
  border: none;
  border-radius: 18px;
  font: inherit;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  color: ${(p) => (p.$active ? "var(--m-on-accent)" : "var(--m-label)")};
  background: ${(p) => (p.$active ? "var(--m-accent)" : "var(--m-surface)")};
`;

const DateInput = styled.input`
  border: none;
  background: none;
  font: inherit;
  font-size: 17px;
  color: var(--m-label-2);
  text-align: right;
`;

const NoteInput = styled.input`
  flex: 1;
  width: 100%;
  border: none;
  background: none;
  outline: none;
  font: inherit;
  font-size: 17px;
  color: var(--m-label);
  text-align: right;
`;

const Chevron = styled(HiChevronRight)`
  width: 16px;
  height: 16px;
  color: var(--m-label-3);
`;

// Сума з будь-яким роздільником → копійки.
function toMinor(value: string) {
  const normalized = value.replace(/\s/g, "").replace(",", ".");
  const number = Number.parseFloat(normalized);
  return Number.isFinite(number) && number > 0 ? Math.round(number * 100) : 0;
}

function errorMessage(error: unknown) {
  if (axios.isAxiosError(error)) return error.response?.data?.error || error.message;
  return "Не вдалося зберегти";
}

interface AddSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenReceiptImport: () => void;
}

export function AddSheet({ open, onOpenChange, onOpenReceiptImport }: AddSheetProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { language } = useSettings();
  const photoInput = useRef<HTMLInputElement>(null);

  const [type, setType] = useState<TxType>("expense");
  const [amount, setAmount] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [pickedCategoryId, setCategoryId] = useState("");
  const [pickedAccountId, setAccountId] = useState("");
  const [targetAccountId, setTargetAccountId] = useState("");
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [note, setNote] = useState("");
  const [picker, setPicker] = useState<Picker>(null);

  const { data: allAccounts = [] } = useQuery({ queryKey: ["accounts"], queryFn: getAccountsApi, enabled: open });
  const { data: allCategories = [] } = useQuery({ queryKey: ["categories"], queryFn: getCategoriesApi, enabled: open });

  // Вручну не можна писати на рахунки, що синхронізуються з банком.
  const accounts = useMemo(
    () => allAccounts.filter((a) => !a.is_group && !a.is_archived && !a.is_synced),
    [allAccounts],
  );
  const categories = useMemo(
    () => (allCategories as Category[]).filter((c) => c.type === (type === "income" ? "income" : "expense")),
    [allCategories, type],
  );

  // Найчастіші категорії з останніх операцій — для вибору в один дотик.
  const { data: recentOfType = [] } = useQuery({
    queryKey: ["transactions", "chips", type],
    queryFn: async () => {
      const res = await getTransactionsApi({ type, limit: 200 });
      return (Array.isArray(res) ? res : res.data || []) as Transaction[];
    },
    enabled: open && type !== "transfer",
    staleTime: 5 * 60 * 1000,
  });
  const chips = useMemo(() => {
    const counts = new Map<string, number>();
    for (const tx of recentOfType) {
      if (tx.category_id) counts.set(tx.category_id, (counts.get(tx.category_id) || 0) + 1);
    }
    const frequent = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => categories.find((c) => c.id === id))
      .filter((c): c is Category => !!c);
    const fallback = categories.filter((c) => c.parent_id && !frequent.includes(c));
    return [...frequent, ...fallback].slice(0, 6);
  }, [recentOfType, categories]);

  // Поки нічого не обрано: останній використаний рахунок і найчастіша категорія.
  const lastAccountId = useMemo(() => {
    try {
      return localStorage.getItem(LAST_ACCOUNT_KEY);
    } catch {
      return null;
    }
  }, []);
  const accountId = accounts.some((a) => a.id === pickedAccountId)
    ? pickedAccountId
    : (accounts.find((a) => a.id === lastAccountId)?.id ?? accounts[0]?.id ?? "");
  const categoryId = categories.some((c) => c.id === pickedCategoryId)
    ? pickedCategoryId
    : (chips[0]?.id ?? "");

  const account = accounts.find((a) => a.id === accountId);
  const target = accounts.find((a) => a.id === targetAccountId);
  const category = categories.find((c) => c.id === categoryId);
  const needsTargetAmount = type === "transfer" && !!account && !!target && account.currency !== target.currency;

  const reset = () => {
    setType("expense");
    setAmount("");
    setTargetAmount("");
    setTargetAccountId("");
    setNote("");
    setDate(format(new Date(), "yyyy-MM-dd"));
  };

  const close = () => {
    onOpenChange(false);
    reset();
  };

  const mutation = useMutation({
    mutationFn: createTransactionApi,
    onSuccess: () => {
      for (const key of ["transactions", "transactions-infinite", "accounts", "account", "stats", "goals", "goal"]) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
      try {
        localStorage.setItem(LAST_ACCOUNT_KEY, accountId);
      } catch {
        // Без збереженого рахунку просто почнемо з першого.
      }
      toast.success("Операцію додано");
      close();
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const minor = toMinor(amount);
  const canSave =
    minor > 0 &&
    !!accountId &&
    (type === "transfer"
      ? !!targetAccountId && targetAccountId !== accountId && (!needsTargetAmount || toMinor(targetAmount) > 0)
      : !!categoryId) &&
    !mutation.isPending;

  const save = () => {
    // Сьогодні — поточний час; інший день — полудень, щоб не з'їхати на сусідню дату.
    const isToday = date === format(new Date(), "yyyy-MM-dd");
    const timestamp = isToday ? Date.now() : new Date(`${date}T12:00:00`).getTime();
    mutation.mutate({
      type,
      account_id: accountId,
      target_account_id: type === "transfer" ? targetAccountId : undefined,
      target_amount: needsTargetAmount ? toMinor(targetAmount) : undefined,
      category_id: type === "transfer" ? undefined : categoryId,
      amount: minor,
      date: timestamp,
      note: note.trim(),
    });
  };

  const openPhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const photo = event.target.files?.[0];
    event.target.value = "";
    if (!photo) return;
    setPendingReceiptPhoto(photo);
    close();
    navigate("/transactions/new?type=expense&photoOnly=1", { state: { background: location } });
  };

  const symbol = account ? CURRENCY_SYMBOLS[account.currency] || account.currency : "₴";
  const amountSize = amount.length > 9 ? 40 : 56;

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(next) => (next ? onOpenChange(true) : close())}
        title="Нова операція"
        footer={
          <PrimaryButton type="button" disabled={!canSave} onClick={save}>
            {mutation.isPending ? "Збереження…" : "Зберегти"}
          </PrimaryButton>
        }
      >
        <input ref={photoInput} type="file" accept="image/*" hidden onChange={openPhoto} />
        <QuickActions>
          <QuickAction type="button" onClick={() => photoInput.current?.click()}>
            <Tile tint="green" size={32} icon={<HiOutlineCamera size={18} />} />
            <span>
              <strong>Фото чека</strong>
              <small>Камера або галерея</small>
            </span>
          </QuickAction>
          <QuickAction
            type="button"
            onClick={() => {
              close();
              onOpenReceiptImport();
            }}
          >
            <Tile tint="green" size={32} icon={<HiOutlineReceiptPercent size={18} />} />
            <span>
              <strong>Е-чек</strong>
              <small>XML або посилання</small>
            </span>
          </QuickAction>
        </QuickActions>
        <Hint>Чек потрапить в Операції → Чеки. Або введіть вручну:</Hint>

        <Segmented
          label="Тип операції"
          value={type}
          onChange={setType}
          options={[
            { value: "expense", label: "Витрата" },
            { value: "income", label: "Дохід" },
            { value: "transfer", label: "Переказ" },
          ]}
        />

        <AmountField>
          <AmountInput
            $size={amountSize}
            type="text"
            inputMode="decimal"
            aria-label="Сума"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.,\s]/g, ""))}
          />
          <CurrencyMark>{symbol}</CurrencyMark>
        </AmountField>

        {type !== "transfer" && chips.length > 0 && (
          <Chips role="group" aria-label="Часті категорії">
            {chips.map((c) => (
              <Chip
                key={c.id}
                type="button"
                $active={c.id === categoryId}
                aria-pressed={c.id === categoryId}
                onClick={() => setCategoryId(c.id)}
              >
                {c.name}
              </Chip>
            ))}
          </Chips>
        )}

        <Group>
          {type === "transfer" ? (
            <>
              <Row
                onClick={() => setPicker("account")}
                title="Звідки"
                trailing={<Meta>{account?.name ?? "Оберіть"}</Meta>}
                chevron
              />
              <Row
                onClick={() => setPicker("target")}
                title="Куди"
                trailing={<Meta>{target?.name ?? "Оберіть"}</Meta>}
                chevron
              />
            </>
          ) : (
            <>
              <Row
                onClick={() => setPicker("category")}
                title="Категорія"
                trailing={<Meta>{category?.name ?? "Оберіть"}</Meta>}
                chevron
              />
              <Row
                onClick={() => setPicker("account")}
                title="Рахунок"
                trailing={<Meta>{account?.name ?? "Оберіть"}</Meta>}
                chevron
              />
            </>
          )}
          {needsTargetAmount && (
            <Row
              title={`Отримано, ${CURRENCY_SYMBOLS[target!.currency] || target!.currency}`}
              trailing={
                <NoteInput
                  type="text"
                  inputMode="decimal"
                  aria-label="Отримана сума"
                  placeholder="0"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value.replace(/[^\d.,\s]/g, ""))}
                />
              }
            />
          )}
          <Row
            title="Дата"
            trailing={
              <DateInput
                type="date"
                aria-label="Дата"
                value={date}
                max={format(new Date(), "yyyy-MM-dd")}
                onChange={(e) => e.target.value && setDate(e.target.value)}
              />
            }
          />
          <Row
            title="Нотатка"
            trailing={
              <NoteInput
                type="text"
                aria-label="Нотатка"
                placeholder="Необовʼязково"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            }
          />
        </Group>

        <Group>
          <Row
            onClick={() => {
              close();
              navigate("/transactions/new", { state: { background: location } });
            }}
            title="Повна форма"
            subtitle="Борг, товари з чека, теги, актив, фото"
            trailing={<Chevron aria-hidden="true" />}
          />
        </Group>
        {accounts.length === 0 && (
          <Hint>Немає рахунків для ручного введення: рахунки, що синхронізуються з банком, поповнюються автоматично.</Hint>
        )}
      </Sheet>

      <CategoryPicker
        open={picker === "category"}
        onOpenChange={(next) => !next && setPicker(null)}
        categories={categories}
        value={categoryId}
        onSelect={setCategoryId}
      />
      <AccountPicker
        open={picker === "account" || picker === "target"}
        onOpenChange={(next) => !next && setPicker(null)}
        title={picker === "target" ? "Куди" : type === "transfer" ? "Звідки" : "Рахунок"}
        accounts={picker === "target" ? accounts.filter((a) => a.id !== accountId) : accounts}
        value={picker === "target" ? targetAccountId : accountId}
        onSelect={picker === "target" ? setTargetAccountId : setAccountId}
        language={language}
      />
    </>
  );
}

