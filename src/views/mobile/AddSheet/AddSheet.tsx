import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import toast from "react-hot-toast";
import axios from "axios";
import styled from "styled-components";
import { HiOutlineCamera, HiOutlineReceiptPercent } from "react-icons/hi2";

import { useSettings } from "../../../context/SettingsContext";
import { getAccountsApi } from "../../../services/apiAccounts";
import { getCategoriesApi } from "../../../services/apiCategories";
import { createCounterpartyApi, getCounterpartiesApi } from "../../../services/apiCounterparties";
import { createTransactionApi, getTransactionsApi } from "../../../services/apiTransactions";
import { createInboxPhotoApi } from "../../../services/apiInbox";
import { compressImage } from "../../../utils/compressor";
import { CURRENCY_SYMBOLS } from "../../../utils/currency";
import type { Category, Transaction } from "../../../types";
import { Sheet, PrimaryButton } from "../../../mobile/ui/Sheet";
import { Group, Row, Meta } from "../../../mobile/ui/Group";
import { Segmented } from "../../../mobile/ui/Segmented";
import { CategoryPicker, AccountPicker, CounterpartyPicker } from "./Pickers";

type Kind = "expense" | "income" | "transfer" | "debt";
type DebtType = "loan_give" | "loan_repay" | "debt_take" | "debt_repay";
type Picker = null | "category" | "account" | "target" | "person";

const LAST_ACCOUNT_KEY = "m-last-account";

const DEBT_TYPES: { value: DebtType; label: string }[] = [
  { value: "loan_give", label: "Я позичив" },
  { value: "loan_repay", label: "Мені повернули" },
  { value: "debt_take", label: "Я взяв у борг" },
  { value: "debt_repay", label: "Я повернув" },
];

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
`;

const QuickAction = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 44px;
  border: none;
  border-radius: 12px;
  background: var(--m-surface);
  color: var(--m-accent);
  font: inherit;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
  }
`;

const AmountField = styled.label`
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 6px;
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

// Чипи одним рядком з горизонтальною прокруткою — не з'їдають висоту.
const ChipRow = styled.div`
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
  height: 36px;
  padding: 0 14px;
  border: none;
  border-radius: 18px;
  font: inherit;
  font-size: 15px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  color: ${(p) => (p.$active ? "var(--m-on-accent)" : "var(--m-label)")};
  background: ${(p) => (p.$active ? "var(--m-accent)" : "var(--m-surface)")};
`;

const FieldInput = styled.input`
  flex: 1;
  width: 100%;
  min-width: 0;
  border: none;
  background: none;
  outline: none;
  font: inherit;
  font-size: 17px;
  color: var(--m-label);
  text-align: right;

  &::placeholder {
    color: var(--m-label-3);
  }
`;

const DateInput = styled(FieldInput)`
  color: var(--m-label-2);
`;

const Hint = styled.p`
  margin: -8px 4px 0;
  font-size: 13px;
  color: var(--m-label-2);
`;

// Сума з будь-яким роздільником → копійки.
function toMinor(value: string) {
  const number = Number.parseFloat(value.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(number) && number > 0 ? Math.round(number * 100) : 0;
}

function errorMessage(error: unknown) {
  if (axios.isAxiosError(error)) return error.response?.data?.error || error.message;
  return "Не вдалося зберегти";
}

const onlyAmount = (value: string) => value.replace(/[^\d.,\s]/g, "");

interface AddSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenReceiptImport: () => void;
}

export function AddSheet({ open, onOpenChange, onOpenReceiptImport }: AddSheetProps) {
  const queryClient = useQueryClient();
  const { language } = useSettings();
  const photoInput = useRef<HTMLInputElement>(null);

  const [kind, setKind] = useState<Kind>("expense");
  const [debtType, setDebtType] = useState<DebtType>("loan_give");
  const [amount, setAmount] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [pickedCategoryId, setCategoryId] = useState("");
  const [pickedAccountId, setAccountId] = useState("");
  const [targetAccountId, setTargetAccountId] = useState("");
  const [counterpartyId, setCounterpartyId] = useState("");
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [note, setNote] = useState("");
  const [picker, setPicker] = useState<Picker>(null);

  const { data: allAccounts = [] } = useQuery({ queryKey: ["accounts"], queryFn: getAccountsApi, enabled: open });
  const { data: allCategories = [] } = useQuery({ queryKey: ["categories"], queryFn: getCategoriesApi, enabled: open });
  const { data: counterparties = [] } = useQuery({
    queryKey: ["counterparties"],
    queryFn: getCounterpartiesApi,
    enabled: open && kind === "debt",
  });

  // Вручну не можна писати на рахунки, що синхронізуються з банком.
  const accounts = useMemo(
    () => allAccounts.filter((a) => !a.is_group && !a.is_archived && !a.is_synced),
    [allAccounts],
  );
  const categories = useMemo(
    () => (allCategories as Category[]).filter((c) => c.type === (kind === "income" ? "income" : "expense")),
    [allCategories, kind],
  );
  // Позичають зазвичай людям; решту контрагентів показуємо після них.
  const people = useMemo(
    () => [...counterparties].sort((a, b) => Number(b.type === "person") - Number(a.type === "person")),
    [counterparties],
  );

  // Найчастіші категорії з останніх операцій — вибір в один дотик.
  const chipsType = kind === "income" ? "income" : "expense";
  const { data: recentOfType = [] } = useQuery({
    queryKey: ["transactions", "chips", chipsType],
    queryFn: async () => {
      const res = await getTransactionsApi({ type: chipsType, limit: 200 });
      return (Array.isArray(res) ? res : res.data || []) as Transaction[];
    },
    enabled: open && (kind === "expense" || kind === "income"),
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
    return [...frequent, ...fallback].slice(0, 8);
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
  const person = people.find((p) => p.id === counterpartyId);
  const needsTargetAmount = kind === "transfer" && !!account && !!target && account.currency !== target.currency;

  const reset = () => {
    setKind("expense");
    setAmount("");
    setTargetAmount("");
    setTargetAccountId("");
    setCounterpartyId("");
    setNote("");
    setDate(format(new Date(), "yyyy-MM-dd"));
  };

  const close = () => {
    onOpenChange(false);
    reset();
  };

  const invalidate = (keys: string[]) => {
    for (const key of keys) queryClient.invalidateQueries({ queryKey: [key] });
  };

  const mutation = useMutation({
    mutationFn: createTransactionApi,
    onSuccess: () => {
      invalidate(["transactions", "transactions-infinite", "accounts", "account", "stats", "goals", "goal", "counterparties"]);
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

  const createPerson = useMutation({
    mutationFn: (name: string) => createCounterpartyApi({ name, type: "person" }),
    onSuccess: (created) => {
      invalidate(["counterparties"]);
      setCounterpartyId(created.id);
      setPicker(null);
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  // Фото чека одразу йде в чергу Операції → Чеки; рахунок і суму вкажуть там.
  const photoUpload = useMutation({
    mutationFn: async (photo: File) => {
      const data = new FormData();
      data.append("json", JSON.stringify({}));
      data.append("file", await compressImage(photo));
      return createInboxPhotoApi(data);
    },
    onSuccess: () => {
      invalidate(["inbox"]);
      toast.success("Фото додано в Операції → Чеки");
      close();
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const minor = toMinor(amount);
  const ready = (() => {
    if (minor <= 0 || !accountId) return false;
    if (kind === "transfer")
      return !!targetAccountId && targetAccountId !== accountId && (!needsTargetAmount || toMinor(targetAmount) > 0);
    if (kind === "debt") return !!counterpartyId;
    return !!categoryId;
  })();

  const save = () => {
    // Сьогодні — поточний час; інший день — полудень, щоб не з'їхати на сусідню дату.
    const isToday = date === format(new Date(), "yyyy-MM-dd");
    const timestamp = isToday ? Date.now() : new Date(`${date}T12:00:00`).getTime();
    mutation.mutate({
      type: kind === "debt" ? debtType : kind,
      account_id: accountId,
      target_account_id: kind === "transfer" ? targetAccountId : undefined,
      target_amount: needsTargetAmount ? toMinor(targetAmount) : undefined,
      category_id: kind === "expense" || kind === "income" ? categoryId : undefined,
      counterparty_id: kind === "debt" ? counterpartyId : undefined,
      amount: minor,
      date: timestamp,
      note: note.trim(),
    });
  };

  const onPhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const photo = event.target.files?.[0];
    event.target.value = "";
    if (photo) photoUpload.mutate(photo);
  };

  const symbol = account ? CURRENCY_SYMBOLS[account.currency] || account.currency : "₴";
  const accountLabel = kind === "transfer" ? "Звідки" : "Рахунок";

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(next) => (next ? onOpenChange(true) : close())}
        title="Нова операція"
        footer={
          <PrimaryButton type="button" disabled={!ready || mutation.isPending} onClick={save}>
            {mutation.isPending ? "Збереження…" : "Зберегти"}
          </PrimaryButton>
        }
      >
        <input ref={photoInput} type="file" accept="image/*" hidden onChange={onPhoto} />
        <QuickActions>
          <QuickAction
            type="button"
            disabled={photoUpload.isPending}
            onClick={() => photoInput.current?.click()}
          >
            <HiOutlineCamera size={20} aria-hidden="true" />
            {photoUpload.isPending ? "Завантаження…" : "Фото чека"}
          </QuickAction>
          <QuickAction
            type="button"
            onClick={() => {
              close();
              onOpenReceiptImport();
            }}
          >
            <HiOutlineReceiptPercent size={20} aria-hidden="true" />
            Е-чек
          </QuickAction>
        </QuickActions>

        <Segmented
          label="Тип операції"
          value={kind}
          onChange={setKind}
          options={[
            { value: "expense", label: "Витрата" },
            { value: "income", label: "Дохід" },
            { value: "transfer", label: "Переказ" },
            { value: "debt", label: "Борг" },
          ]}
        />

        <AmountField>
          <AmountInput
            $size={amount.length > 9 ? 40 : 52}
            type="text"
            inputMode="decimal"
            aria-label="Сума"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(onlyAmount(e.target.value))}
          />
          <CurrencyMark>{symbol}</CurrencyMark>
        </AmountField>

        {(kind === "expense" || kind === "income") && chips.length > 0 && (
          <ChipRow role="group" aria-label="Часті категорії">
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
          </ChipRow>
        )}

        {kind === "debt" && (
          <ChipRow role="group" aria-label="Що сталося">
            {DEBT_TYPES.map((d) => (
              <Chip
                key={d.value}
                type="button"
                $active={d.value === debtType}
                aria-pressed={d.value === debtType}
                onClick={() => setDebtType(d.value)}
              >
                {d.label}
              </Chip>
            ))}
          </ChipRow>
        )}

        <Group>
          {(kind === "expense" || kind === "income") && (
            <Row
              onClick={() => setPicker("category")}
              title="Категорія"
              trailing={<Meta>{category?.name ?? "Оберіть"}</Meta>}
              chevron
            />
          )}
          {kind === "debt" && (
            <Row
              onClick={() => setPicker("person")}
              title="Хто"
              trailing={<Meta>{person?.name ?? "Оберіть"}</Meta>}
              chevron
            />
          )}
          <Row
            onClick={() => setPicker("account")}
            title={accountLabel}
            trailing={<Meta>{account?.name ?? "Оберіть"}</Meta>}
            chevron
          />
          {kind === "transfer" && (
            <Row
              onClick={() => setPicker("target")}
              title="Куди"
              trailing={<Meta>{target?.name ?? "Оберіть"}</Meta>}
              chevron
            />
          )}
          {needsTargetAmount && (
            <Row
              title={`Отримано, ${CURRENCY_SYMBOLS[target!.currency] || target!.currency}`}
              trailing={
                <FieldInput
                  type="text"
                  inputMode="decimal"
                  aria-label="Отримана сума"
                  placeholder="0"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(onlyAmount(e.target.value))}
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
              <FieldInput
                type="text"
                aria-label="Нотатка"
                placeholder="Необовʼязково"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            }
          />
        </Group>

        {accounts.length === 0 && (
          <Hint>
            Немає рахунків для ручного введення: рахунки, що синхронізуються з банком, поповнюються
            автоматично.
          </Hint>
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
        title={picker === "target" ? "Куди" : accountLabel}
        accounts={picker === "target" ? accounts.filter((a) => a.id !== accountId) : accounts}
        value={picker === "target" ? targetAccountId : accountId}
        onSelect={picker === "target" ? setTargetAccountId : setAccountId}
        language={language}
      />
      <CounterpartyPicker
        open={picker === "person"}
        onOpenChange={(next) => !next && setPicker(null)}
        people={people}
        value={counterpartyId}
        onSelect={setCounterpartyId}
        onCreate={(name) => createPerson.mutate(name)}
        isCreating={createPerson.isPending}
      />
    </>
  );
}
