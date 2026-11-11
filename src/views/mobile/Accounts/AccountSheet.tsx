import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { HiCheck } from "react-icons/hi2";

import { BANK_GROUPS, BANK_SKINS, PAYMENT_SYSTEMS } from "../../../components/accounts/bankSkins";
import { useUserRole } from "../../../hooks/useUserRole";
import {
  createAccountApi,
  updateAccountApi,
  type Account,
  type AccountPayload,
} from "../../../services/apiAccounts";
import { getGoalsApi } from "../../../services/apiGoals";
import { createStorageTypeApi, getStorageTypesApi } from "../../../services/apiStorageTypes";
import { getUsersApi } from "../../../services/apiUsers";
import { ColorSwatches } from "../../../mobile/ui/AppearancePicker";
import { ConfirmSheet } from "../../../mobile/ui/ConfirmSheet";
import { Footnote, RowInput } from "../../../mobile/ui/Field";
import { Group, Meta, Row, Section } from "../../../mobile/ui/Group";
import { Segmented } from "../../../mobile/ui/Segmented";
import { PrimaryButton, Sheet, SheetTextButton } from "../../../mobile/ui/Sheet";
import { Tile } from "../../../mobile/ui/Tile";

// Рахунок: створення й зміна. Картка (банк і вигляд, останні цифри, додаткові номери,
// платіжна система), готівка (колір), накопичення (тип сховища, ціль). Для рахунку,
// що синхронізується з банком, валюта, баланс і вигляд картки заблоковані.

type Mode = "card" | "cash" | "savings";
const MODES = [
  { value: "card" as Mode, label: "Картка" },
  { value: "cash" as Mode, label: "Готівка" },
  { value: "savings" as Mode, label: "Накопичення" },
];
const CURRENCIES = [
  { value: "UAH", label: "₴ UAH" },
  { value: "USD", label: "$ USD" },
  { value: "EUR", label: "€ EUR" },
];
const PAYMENTS = [{ value: "", label: "—" }, ...PAYMENT_SYSTEMS];

const modeOf = (account?: Account): Mode =>
  !account ? "card" : account.type === "piggy_bank" ? "savings" : (account.type as Mode) === "cash" ? "cash" : "card";

const Check = () => <HiCheck size={20} color="var(--m-accent)" aria-label="Обрано" />;

interface AccountSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Без рахунку — створюємо новий. */
  account?: Account;
  onCreated?: (account: Account) => void;
}

export function AccountSheet({ open, onOpenChange, account, onCreated }: AccountSheetProps) {
  const queryClient = useQueryClient();
  const { role } = useUserRole();
  const editing = !!account;
  const synced = !!account?.is_synced;

  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: getUsersApi });
  const { data: goals = [] } = useQuery({ queryKey: ["goals"], queryFn: getGoalsApi });
  const { data: storageTypes = [] } = useQuery({ queryKey: ["storageTypes"], queryFn: getStorageTypesApi, staleTime: 5 * 60 * 1000 });

  const [mode, setMode] = useState<Mode>(modeOf(account));
  const [name, setName] = useState(account?.name ?? "");
  const [skinKey, setSkinKey] = useState(() => {
    if (account?.bank_name && account.card_type && BANK_SKINS[`${account.bank_name}-${account.card_type}`]) return `${account.bank_name}-${account.card_type}`;
    if (account?.icon && BANK_SKINS[account.icon]) return account.icon;
    return "monobank-black";
  });
  const [cardNumber, setCardNumber] = useState(account?.card_number ?? "");
  const [extraCards, setExtraCards] = useState<string[]>((account?.card_numbers ?? []).filter((m) => m !== account?.card_number));
  const [newMask, setNewMask] = useState("");
  const [paymentSystem, setPaymentSystem] = useState(account?.payment_system ?? "");
  const [balance, setBalance] = useState(account ? String(account.initial_balance / 100) : "");
  const [currency, setCurrency] = useState(account?.currency ?? "UAH");
  const [color, setColor] = useState(account?.color && account.type !== "card" ? account.color : "#10b981");
  const [ownerId, setOwnerId] = useState(account?.user_id ?? "");
  const [storageTypeId, setStorageTypeId] = useState(account?.storage_type_id ?? "");
  const [goalId, setGoalId] = useState(account?.goal_id ?? "");
  const [pick, setPick] = useState<null | "skin" | "owner" | "storage" | "goal">(null);
  const [newType, setNewType] = useState("");
  const [pendingMode, setPendingMode] = useState<Mode | null>(null);

  const effectiveStorage = storageTypeId || (mode === "savings" && !editing ? storageTypes[0]?.id ?? "" : "");
  const skin = BANK_SKINS[skinKey];
  const selectedGoal = goals.find((g) => g.id === goalId);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["accounts"] });
    queryClient.invalidateQueries({ queryKey: ["stats"] });
    if (account) {
      queryClient.invalidateQueries({ queryKey: ["account", account.id] });
    }
  };

  const save = useMutation({
    mutationFn: () => {
      const data = {
        name: name.trim(),
        type: (mode === "savings" ? "piggy_bank" : mode) as Account["type"],
        currency,
        initial_balance: Math.round(Number(balance.replace(",", ".") || 0) * 100),
        storage_type_id: mode === "savings" ? effectiveStorage || null : null,
        goal_id: mode === "savings" ? goalId || null : null,
        color: mode === "card" ? "#000000" : color,
        bank_name: mode === "card" ? skin?.bankId : undefined,
        card_type: mode === "card" ? skin?.designId : undefined,
        card_number: mode === "card" ? cardNumber : "",
        card_numbers: mode === "card" ? [...(cardNumber.length === 4 ? [cardNumber] : []), ...extraCards] : [],
        payment_system: mode === "card" ? paymentSystem : "",
        user_id: ownerId || undefined,
      };
      return account ? updateAccountApi({ ...data, id: account.id }) : createAccountApi(data as unknown as AccountPayload);
    },
    onSuccess: (saved) => {
      toast.success(editing ? "Рахунок оновлено" : "Рахунок створено");
      refresh();
      onCreated?.(saved);
      onOpenChange(false);
    },
    onError: () => toast.error(editing ? "Не вдалося оновити рахунок" : "Не вдалося створити рахунок"),
  });

  const createType = useMutation({
    mutationFn: (typeName: string) =>
      createStorageTypeApi({ name: typeName, slug: typeName.toLowerCase().replace(/\s+/g, "_"), icon: "HiArchiveBox" }),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["storageTypes"] });
      setStorageTypeId(created.id);
      setNewType("");
      setPick(null);
    },
    onError: () => toast.error("Не вдалося створити тип"),
  });

  const balanceOk = balance === "" || !Number.isNaN(Number(balance.replace(",", ".")));
  const cardOk = mode !== "card" || cardNumber === "" || cardNumber.length === 4;
  const storageOk = mode !== "savings" || !!effectiveStorage;
  const valid = name.trim() !== "" && balanceOk && cardOk && storageOk;

  const changeMode = (next: Mode) => {
    if (next === mode) return;
    // Зміна виду рахунка зі скарбнички, прив'язаної до цілі, відв'язує ціль
    if (editing && mode === "savings" && goalId) return setPendingMode(next);
    setMode(next);
  };

  const addMask = () => {
    const mask = newMask.replace(/\D/g, "").slice(0, 4);
    if (mask.length !== 4 || extraCards.includes(mask) || mask === cardNumber) return;
    setExtraCards([...extraCards, mask]);
    setNewMask("");
  };

  const skinGroups = useMemo(
    () =>
      Object.values(BANK_GROUPS).map((group) => ({
        group,
        skins: Object.values(BANK_SKINS).filter((s) => s.bankId === group.id),
      })).filter((g) => g.skins.length > 0),
    [],
  );
  const owner = users.find((u) => u.id === ownerId);
  const done = (
    <SheetTextButton type="button" $bold onClick={() => setPick(null)}>
      Готово
    </SheetTextButton>
  );

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Рахунок" : "Новий рахунок"}
      footer={
        <PrimaryButton type="button" disabled={!valid || save.isPending} onClick={() => save.mutate()}>
          {editing ? "Зберегти" : "Додати"}
        </PrimaryButton>
      }
    >
      <Segmented label="Вид рахунку" options={MODES} value={mode} onChange={changeMode} />

      <Section>
        <Group>
          <Row title="Назва" trailing={<RowInput aria-label="Назва рахунку" value={name} onChange={(e) => setName(e.target.value)} />} />
          {mode === "card" && (
            <Row
              onClick={synced ? undefined : () => setPick("skin")}
              leading={<Tile logo={skin?.miniLogoFile ? `${skin.miniLogoFile}.svg` : undefined} size={30} />}
              title="Банк і вигляд"
              trailing={<Meta>{skin ? `${BANK_GROUPS[skin.bankId as keyof typeof BANK_GROUPS]?.label ?? skin.bankId} · ${skin.label}` : "Не обрано"}</Meta>}
              chevron={!synced}
              inset={58}
            />
          )}
          <Row
            title={editing ? "Початковий баланс" : "Баланс"}
            trailing={
              <RowInput
                aria-label="Баланс"
                inputMode="decimal"
                placeholder="0"
                disabled={synced}
                value={balance}
                onChange={(e) => setBalance(e.target.value.replace(/[^\d.,-]/g, ""))}
              />
            }
          />
        </Group>
        {synced && <Footnote>Рахунок синхронізується з банком: валюта, баланс і вигляд картки не змінюються вручну.</Footnote>}
      </Section>

      <Section caption="Валюта">
        <Segmented label="Валюта" options={CURRENCIES} value={currency} onChange={synced ? () => undefined : setCurrency} />
      </Section>

      {mode === "card" && (
        <Section caption="Картка">
          <Group>
            <Row
              title="Цифри картки"
              trailing={
                <RowInput
                  aria-label="Останні цифри картки"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="0000"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 4))}
                />
              }
            />
            {extraCards.map((mask) => (
              <Row key={mask} title={`•••• ${mask}`} trailing={<Meta>Прибрати</Meta>} onClick={() => setExtraCards(extraCards.filter((m) => m !== mask))} />
            ))}
            <Row
              title="Ще номер"
              trailing={
                <RowInput
                  aria-label="Додатковий номер картки"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="0000"
                  value={newMask}
                  onChange={(e) => setNewMask(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  onBlur={addMask}
                  onKeyDown={(e) => e.key === "Enter" && addMask()}
                />
              }
            />
          </Group>
          <Footnote>Додаткові номери — для Apple Pay, Google Pay та токенів: так операції розпізнаються за карткою.</Footnote>
          <div style={{ marginTop: 12 }}>
            <Segmented label="Платіжна система" options={PAYMENTS} value={paymentSystem} onChange={setPaymentSystem} />
          </div>
        </Section>
      )}

      {mode === "cash" && (
        <Section caption="Колір">
          <ColorSwatches color={color} onChange={setColor} />
        </Section>
      )}

      {mode === "savings" && (
        <Section caption="Накопичення">
          <Group>
            <Row
              onClick={() => setPick("storage")}
              title="Тип сховища"
              trailing={<Meta>{storageTypes.find((t) => t.id === effectiveStorage)?.name ?? "Оберіть"}</Meta>}
              chevron
            />
            <Row onClick={() => setPick("goal")} title="Ціль" trailing={<Meta>{selectedGoal?.name ?? "Без цілі"}</Meta>} chevron />
          </Group>
          <Footnote>Якщо прив'язати ціль, баланс рахунку стане прогресом цілі.</Footnote>
        </Section>
      )}

      {role !== "child" && users.length > 1 && (
        <Section>
          <Group>
            <Row onClick={() => setPick("owner")} title="Власник" trailing={<Meta>{owner?.name ?? "Я"}</Meta>} chevron />
          </Group>
        </Section>
      )}

      {/* Вибір вигляду картки */}
      <Sheet nested open={pick === "skin"} onOpenChange={(o) => !o && setPick(null)} title="Банк і вигляд" hideCancel trailing={done}>
        {skinGroups.map(({ group, skins }) => (
          <Section key={group.id} caption={group.label}>
            <Group>
              {skins.map((s) => (
                <Row
                  key={s.id}
                  onClick={() => {
                    setSkinKey(s.id);
                    setPick(null);
                  }}
                  leading={<Tile logo={`${s.miniLogoFile}.svg`} size={30} />}
                  title={s.label}
                  trailing={skinKey === s.id ? <Check /> : undefined}
                  inset={58}
                />
              ))}
            </Group>
          </Section>
        ))}
      </Sheet>

      {/* Власник */}
      <Sheet nested open={pick === "owner"} onOpenChange={(o) => !o && setPick(null)} title="Власник" hideCancel trailing={done}>
        <Group>
          {users.map((u) => (
            <Row
              key={u.id}
              onClick={() => {
                setOwnerId(u.id);
                setPick(null);
              }}
              title={u.name}
              trailing={(ownerId || "") === u.id ? <Check /> : undefined}
            />
          ))}
        </Group>
      </Sheet>

      {/* Тип сховища */}
      <Sheet nested open={pick === "storage"} onOpenChange={(o) => !o && setPick(null)} title="Тип сховища" hideCancel trailing={done}>
        <Group>
          {storageTypes.map((t) => (
            <Row
              key={t.id}
              onClick={() => {
                setStorageTypeId(t.id);
                setPick(null);
              }}
              title={t.name}
              trailing={effectiveStorage === t.id ? <Check /> : undefined}
            />
          ))}
        </Group>
        <Section caption="Новий тип">
          <Group>
            <Row
              title="Назва"
              trailing={
                <RowInput
                  aria-label="Назва нового типу сховища"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && newType.trim() && createType.mutate(newType.trim())}
                />
              }
            />
            <Row onClick={newType.trim() ? () => createType.mutate(newType.trim()) : undefined} title="Створити тип" />
          </Group>
        </Section>
      </Sheet>

      {/* Ціль */}
      <Sheet nested open={pick === "goal"} onOpenChange={(o) => !o && setPick(null)} title="Ціль" hideCancel trailing={done}>
        <Group>
          <Row
            onClick={() => {
              setGoalId("");
              setPick(null);
            }}
            title="Без цілі"
            trailing={!goalId ? <Check /> : undefined}
          />
          {goals
            .filter((g) => g.status === "active" || g.id === goalId)
            .map((g) => (
              <Row
                key={g.id}
                onClick={() => {
                  setGoalId(g.id);
                  setPick(null);
                }}
                title={g.name}
                trailing={goalId === g.id ? <Check /> : undefined}
              />
            ))}
        </Group>
      </Sheet>

      <ConfirmSheet
        open={!!pendingMode}
        onOpenChange={(o) => !o && setPendingMode(null)}
        message={`Рахунок буде відв'язано від цілі «${selectedGoal?.name ?? ""}». Продовжити?`}
        actions={[
          {
            label: "Відв'язати й змінити вид",
            destructive: true,
            onSelect: () => {
              if (pendingMode) setMode(pendingMode);
              setGoalId("");
              setPendingMode(null);
            },
          },
        ]}
      />
    </Sheet>
  );
}
