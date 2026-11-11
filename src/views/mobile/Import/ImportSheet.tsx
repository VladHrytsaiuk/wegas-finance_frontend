import { useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { HiCheck, HiOutlineDocumentArrowUp } from "react-icons/hi2";
import styled from "styled-components";

import { useImportModal } from "../../../hooks/Import/useImportModal";
import { useSettings } from "../../../context/SettingsContext";
import { createCounterpartyApi } from "../../../services/apiCounterparties";
import type { Account } from "../../../services/apiAccounts";
import type { Counterparty } from "../../../types";
import { formatMoney } from "../../../utils/helpers";
import { categoryLabel } from "../../../mobile/categoryLabel";
import { Footnote, TextAction } from "../../../mobile/ui/Field";
import { Group, Meta, Row, Section } from "../../../mobile/ui/Group";
import { ActivityIndicator } from "../../../mobile/ui/Loader";
import { Segmented } from "../../../mobile/ui/Segmented";
import { PrimaryButton, Sheet, SheetTextButton } from "../../../mobile/ui/Sheet";
import type { NewCounterparty } from "../AddSheet/CounterpartyPicker";
import { ImportEditSheet } from "./ImportEditSheet";

// Імпорт виписки: файл → банк визначається за вмістом → перевірка рядків (дублікати,
// категорії, переказ на скарбничку) → «Імпортувати». Усе зі старого вікна імпорту.

const BANK_LABEL: Record<string, string> = { monobank: "Monobank", privatbank: "ПриватБанк" };

const Center = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 8px;
  text-align: center;
  color: var(--m-label-2);
`;

const Line = styled.div<{ $muted: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
  min-height: 60px;
  opacity: ${(p) => (p.$muted ? 0.55 : 1)};

  & + &::before {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    left: 56px;
    height: 0.5px;
    background: var(--m-separator);
  }
`;

const Check = styled.button<{ $on: boolean }>`
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border: none;
  background: none;
  cursor: pointer;

  span {
    display: grid;
    place-items: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 1.5px solid ${(p) => (p.$on ? "var(--m-accent)" : "var(--m-label-3)")};
    background: ${(p) => (p.$on ? "var(--m-accent)" : "transparent")};
    color: #fff;
  }

  &:disabled {
    cursor: default;
  }
`;

const Main = styled.button`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px 8px 0;
  border: none;
  background: none;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
`;

const Text = styled.span`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const Title = styled.span`
  font-size: 16px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Sub = styled.span<{ $warn?: boolean }>`
  font-size: 13px;
  color: ${(p) => (p.$warn ? "#c2410c" : "var(--m-label-2)")};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Amt = styled.span<{ $income: boolean }>`
  flex-shrink: 0;
  font-size: 16px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: ${(p) => (p.$income ? "var(--m-accent)" : "var(--m-label)")};
`;

const Tags = styled.span`
  display: inline-flex;
  gap: 6px;
`;

const Tag = styled.span<{ $color: string }>`
  padding: 0 6px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  color: ${(p) => p.$color};
  background: ${(p) => p.$color}1f;
`;

const Hidden = styled.input`
  display: none;
`;

type Filter = "all" | "nocat" | "dups";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: Account;
}

export function ImportSheet({ open, onOpenChange, account }: Props) {
  const queryClient = useQueryClient();
  const { language } = useSettings();
  const fileInput = useRef<HTMLInputElement>(null);
  const { state, actions, data } = useImportModal({ account, onClose: () => onOpenChange(false), autoDetect: true });
  const { step, isLoading, transactions, selectedIndices, editingTx, detectedBank, invalidTransactionsCount, isSaving, savingsAccounts, roundUpTargetId, hasSelectedTransfers } = state;
  const [filter, setFilter] = useState<Filter>("all");
  const [pickTarget, setPickTarget] = useState(false);
  const money = (minor: number) => formatMoney(minor, account.currency, language);

  const counts = useMemo(() => {
    const exact = transactions.filter((t) => t.is_duplicate).length;
    const similar = transactions.filter((t) => !t.is_duplicate && t.is_potential_duplicate).length;
    const noCat = transactions.filter((t) => !t.is_duplicate && t.type !== "transfer" && !t.category_id).length;
    return { total: transactions.length, exact, similar, fresh: transactions.length - exact - similar, noCat };
  }, [transactions]);

  const visible = useMemo(
    () =>
      transactions
        .map((tx, index) => ({ tx, index }))
        .filter(({ tx }) =>
          filter === "all" ? true : filter === "dups" ? tx.is_duplicate || tx.is_potential_duplicate : !tx.is_duplicate && tx.type !== "transfer" && !tx.category_id,
        ),
    [transactions, filter],
  );

  const createCounterparty = async (draft: NewCounterparty): Promise<Counterparty | undefined> => {
    try {
      const created = await createCounterpartyApi(draft as Partial<Counterparty>);
      queryClient.invalidateQueries({ queryKey: ["counterparties"] });
      return created;
    } catch {
      toast.error("Не вдалося створити контрагента");
      return undefined;
    }
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) void actions.processFile(file);
  };

  const selectable = transactions.filter((t) => !t.is_duplicate).length;
  const allSelected = selectable > 0 && selectedIndices.size === selectable;
  const target = savingsAccounts.find((a) => a.id === roundUpTargetId);
  const blocked = selectedIndices.size === 0 || state.hasInvalidTransactions || isSaving || (hasSelectedTransfers && !roundUpTargetId);

  const footer =
    step === "preview" ? (
      <>
        {state.hasInvalidTransactions && (
          <Footnote style={{ margin: "0 0 8px", color: "#c2410c" }}>
            Оберіть категорію для {invalidTransactionsCount} {invalidTransactionsCount === 1 ? "операції" : "операцій"} або заповніть порожні як «Інше».
          </Footnote>
        )}
        <PrimaryButton type="button" disabled={blocked} onClick={() => actions.importBatch()}>
          {isSaving ? "Зберігаємо…" : `Імпортувати (${selectedIndices.size})`}
        </PrimaryButton>
      </>
    ) : undefined;

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={step === "upload" ? "Імпорт виписки" : "Перевірка"}
      trailing={
        step === "preview" ? (
          <SheetTextButton type="button" onClick={() => actions.setStep("upload")}>
            Інший файл
          </SheetTextButton>
        ) : undefined
      }
      footer={footer}
    >
      {isLoading && (
        <Center>
          <ActivityIndicator />
          <span>Читаємо виписку…</span>
        </Center>
      )}

      {!isLoading && step === "upload" && (
        <>
          <Section>
            <Group>
              <Row title="Рахунок" trailing={<Meta>{account.name}</Meta>} />
            </Group>
          </Section>
          <PrimaryButton type="button" onClick={() => fileInput.current?.click()}>
            <HiOutlineDocumentArrowUp size={20} style={{ verticalAlign: "-4px", marginRight: 8 }} />
            Обрати файл виписки
          </PrimaryButton>
          <Hidden ref={fileInput} type="file" accept=".pdf,.csv,.xls,.xlsx" onChange={onFile} aria-label="Файл виписки" />
          <Footnote style={{ margin: 0 }}>
            Monobank (CSV, PDF, Excel) і ПриватБанк (Excel, PDF). Банк визначається автоматично за вмістом файлу.
          </Footnote>
          <Section caption="Як отримати виписку">
            <Group>
              <Row title="Monobank" subtitle="Застосунок → картка → «Ще» → «Виписка» → період → надіслати собі як CSV (краще) або PDF" wrapSubtitle />
              <Row title="ПриватБанк" subtitle="Приват24 → Сервіси → Послуги → Довідки → «Виписка по картці» → Excel (XLSX) або PDF" wrapSubtitle />
            </Group>
          </Section>
        </>
      )}

      {!isLoading && step === "preview" && (
        <>
          <Section>
            <Group>
              <Row title="Банк" trailing={<Meta>{detectedBank ? BANK_LABEL[detectedBank.bank] ?? detectedBank.bank : "—"}</Meta>} />
              <Row
                title="У файлі"
                subtitle={`${counts.total} · нових ${counts.fresh} · вже в базі ${counts.exact} · схожих ${counts.similar}`}
                wrapSubtitle
              />
            </Group>
            {detectedBank?.corrected && (
              <Footnote>Файл виявився випискою {BANK_LABEL[detectedBank.bank]}, тож розібрано саме так (обрано було інший банк).</Footnote>
            )}
          </Section>

          {hasSelectedTransfers && (
            <Section caption="Куди переказувати">
              <Group>
                <Row onClick={() => setPickTarget(true)} title="Скарбничка" trailing={<Meta>{target?.name ?? "Оберіть"}</Meta>} chevron />
              </Group>
              <Footnote>У виписці є перекази (напр. округлення на скарбничку): оберіть рахунок, на який вони йдуть.</Footnote>
            </Section>
          )}

          <Segmented
            label="Що показати"
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: "Усі" },
              { value: "nocat", label: counts.noCat ? `Без категорії · ${counts.noCat}` : "Без категорії" },
              { value: "dups", label: counts.exact + counts.similar ? `Дублікати · ${counts.exact + counts.similar}` : "Дублікати" },
            ]}
          />

          <div style={{ display: "flex", justifyContent: "space-between", padding: "0 4px" }}>
            <TextAction onClick={actions.handleToggleAll}>{allSelected ? "Зняти все" : "Обрати все"}</TextAction>
            {counts.noCat > 0 && <TextAction onClick={actions.handleFillEmptyCategories}>Порожні категорії — «Інше»</TextAction>}
          </div>

          <Group>
            {visible.length === 0 ? (
              <Row title={<Meta>Нічого немає</Meta>} />
            ) : (
              visible.map(({ tx, index }) => {
                const on = selectedIndices.has(index);
                const income = tx.type === "income" || (tx.type === "transfer" && tx.transfer_direction === "in");
                const label = tx.counterparty_name || tx.description || "Операція";
                const cat = tx.type === "transfer" ? "Переказ" : categoryLabel(data.categories, tx.category_id);
                return (
                  <Line key={index} $muted={tx.is_duplicate}>
                    <Check
                      type="button"
                      $on={on}
                      disabled={tx.is_duplicate}
                      aria-label={on ? "Не імпортувати" : "Імпортувати"}
                      aria-pressed={on}
                      onClick={() => actions.handleToggle(index)}
                    >
                      <span>{on && <HiCheck size={16} />}</span>
                    </Check>
                    <Main type="button" onClick={() => actions.setEditingTx({ index, data: tx })}>
                      <Text>
                        <Title>{label}</Title>
                        <Sub $warn={!cat && tx.type !== "transfer" && !tx.is_duplicate}>
                          {format(new Date(tx.date), "dd.MM HH:mm")} · {cat ?? "Без категорії"}
                        </Sub>
                        {(tx.is_duplicate || tx.is_potential_duplicate) && (
                          <Tags>
                            {tx.is_duplicate ? <Tag $color="#dc2626">Вже в базі</Tag> : <Tag $color={on ? "#16a34a" : "#d97706"}>{on ? "Створити нову" : "Схожа"}</Tag>}
                          </Tags>
                        )}
                      </Text>
                      <Amt $income={income}>
                        {income ? "+" : "−"}
                        {money(Math.abs(tx.amount))}
                      </Amt>
                    </Main>
                  </Line>
                );
              })
            )}
          </Group>
          <Footnote style={{ margin: 0 }}>Категорії й контрагенти визначені автоматично: торкніться рядка, щоб перевірити або змінити.</Footnote>
        </>
      )}

      {editingTx && (
        <ImportEditSheet
          key={editingTx.index}
          open
          onOpenChange={(o) => !o && actions.setEditingTx(null)}
          transaction={editingTx.data}
          categories={data.categories}
          counterparties={data.counterparties}
          currency={account.currency}
          onSave={actions.handleSaveEdit}
          onCreateCounterparty={createCounterparty}
          money={money}
        />
      )}

      <Sheet
        nested
        open={pickTarget}
        onOpenChange={setPickTarget}
        title="Скарбничка"
        hideCancel
        trailing={
          <SheetTextButton type="button" $bold onClick={() => setPickTarget(false)}>
            Готово
          </SheetTextButton>
        }
      >
        <Group>
          {savingsAccounts.map((a) => (
            <Row
              key={a.id}
              onClick={() => {
                void actions.selectRoundUpTarget(a.id);
                setPickTarget(false);
              }}
              title={a.name}
              trailing={roundUpTargetId === a.id ? <HiCheck size={20} color="var(--m-accent)" aria-label="Обрано" /> : undefined}
            />
          ))}
          <Row
            onClick={() => {
              void actions.createRoundUpSavings();
              setPickTarget(false);
            }}
            title="Створити скарбничку"
          />
        </Group>
      </Sheet>
    </Sheet>
  );
}
