import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { HiCheck, HiOutlineClock, HiOutlineExclamationCircle } from "react-icons/hi2";
import styled from "styled-components";

import { useMonobank } from "../../../hooks/Settings/useMonobank";
import { getAccountsApi } from "../../../services/apiAccounts";
import type { MonoAccount } from "../../../services/apiMonobank";
import { ConfirmSheet } from "../../../mobile/ui/ConfirmSheet";
import { Footnote, RowInput, Switch } from "../../../mobile/ui/Field";
import { Group, Meta, Row, Section } from "../../../mobile/ui/Group";
import { ActivityIndicator } from "../../../mobile/ui/Loader";
import { PrimaryButton, Sheet, SheetTextButton } from "../../../mobile/ui/Sheet";

// Підключення Monobank: токен → вибір рахунків (прив'язка до наявних або новий,
// назва, з якої дати імпортувати, для банки — створити ціль) → імпорт у фоні.

const Center = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px 8px;
  text-align: center;
  color: var(--m-label-2);
`;

const ErrorText = styled.p`
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin: 8px 16px 0;
  font-size: 13px;
  line-height: 1.4;
  color: #ff3b30;
`;

const CURRENCY: Record<number, string> = { 980: "UAH", 840: "USD", 978: "EUR" };
const currencyOf = (code: number) => CURRENCY[code] ?? "EUR";
const last4 = (acc: MonoAccount) => {
  const pan = acc.maskedPan?.[0] ?? "";
  return pan.length >= 4 ? pan.slice(-4) : "";
};
const money = (minor: number, currency: string) =>
  `${(minor / 100).toLocaleString("uk-UA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;

interface MonobankSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MonobankSheet({ open, onOpenChange }: MonobankSheetProps) {
  const { state, actions } = useMonobank();
  const { step, token, isPending, accounts, mapping, error, hasExistingConnection } = state;
  const { data: ferpAccounts = [] } = useQuery({ queryKey: ["accounts"], queryFn: getAccountsApi });
  const [pickFor, setPickFor] = useState<string | null>(null);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const anySelected = Object.values(mapping).some((m) => m.isEnabled);
  const close = () => onOpenChange(false);

  const footer =
    step === "input" ? (
      <PrimaryButton type="button" disabled={!token.trim() || isPending} onClick={() => void actions.handleConnect()}>
        Підключити
      </PrimaryButton>
    ) : step === "selection" ? (
      <PrimaryButton type="button" disabled={!anySelected || isPending} onClick={() => void actions.confirmSync()}>
        Почати імпорт
      </PrimaryButton>
    ) : step === "active" || step === "rate_limit" ? (
      <PrimaryButton type="button" onClick={close}>
        {step === "active" ? "Зрозуміло" : "Закрити"}
      </PrimaryButton>
    ) : undefined;

  const picking = pickFor ? accounts.find((a) => a.id === pickFor) : undefined;
  const compatible = picking ? ferpAccounts.filter((a) => a.currency === currencyOf(picking.currencyCode)) : [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Monobank" footer={footer}>
      {step === "loading" && (
        <Center>
          <ActivityIndicator />
          <span>Завантажуємо рахунки…</span>
        </Center>
      )}

      {step === "input" && (
        <Section>
          <Group>
            <Row
              title="X-Token"
              trailing={
                <RowInput
                  type="password"
                  aria-label="Токен Monobank"
                  autoCapitalize="none"
                  autoComplete="off"
                  placeholder="Вставте токен"
                  value={token}
                  disabled={isPending}
                  onChange={(e) => actions.setToken(e.target.value)}
                />
              }
            />
          </Group>
          {error && (
            <ErrorText role="alert">
              <HiOutlineExclamationCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} /> {error}
            </ErrorText>
          )}
          <Footnote>
            Відкрийте{" "}
            <a href="https://api.monobank.ua/" target="_blank" rel="noreferrer" style={{ color: "var(--m-accent)" }}>
              api.monobank.ua
            </a>
            , скопіюйте токен і вставте його сюди.
          </Footnote>
        </Section>
      )}

      {step === "rate_limit" && (
        <Center>
          <HiOutlineExclamationCircle size={40} color="#f59e0b" />
          <strong style={{ color: "var(--m-label)" }}>Забагато запитів до банку</strong>
          <span>Спробуйте ще раз через 60 секунд.</span>
        </Center>
      )}

      {step === "selection" && (
        <>
          <Footnote style={{ margin: "0 16px" }}>Оберіть рахунки для синхронізації.</Footnote>
          {accounts.map((acc) => {
            const config = mapping[acc.id];
            if (!config) return null;
            const currency = currencyOf(acc.currencyCode);
            const isJar = acc.type === "jar";
            const locked = !!config.internalId && config.isEnabled;
            const linked = ferpAccounts.find((a) => a.id === config.internalId);
            const label = isJar ? `Банка · ${currency}` : `${last4(acc) ? `•••• ${last4(acc)}` : "Рахунок"} · ${currency}`;
            return (
              <Section key={acc.id}>
                <Group>
                  <Row
                    title={label}
                    subtitle={`${money(acc.balance, currency)}${locked ? " · вже синхронізовано" : ""}`}
                    trailing={
                      <Switch
                        label={`Синхронізувати ${label}`}
                        checked={config.isEnabled}
                        onChange={() => actions.toggleAccount(acc.id, last4(acc))}
                      />
                    }
                  />
                  {config.isEnabled && (
                    <>
                      <Row
                        onClick={locked ? undefined : () => setPickFor(acc.id)}
                        title="Прив'язати до"
                        trailing={<Meta>{linked?.name ?? "Створити новий"}</Meta>}
                        chevron={!locked}
                      />
                      <Row
                        title="Назва в FERP"
                        trailing={
                          <RowInput
                            aria-label={`Назва для ${label}`}
                            value={config.name}
                            disabled={!!config.internalId}
                            onChange={(e) => actions.updateAccountName(acc.id, e.target.value)}
                          />
                        }
                      />
                      <Row
                        title="Імпорт з"
                        trailing={
                          <RowInput
                            type="date"
                            aria-label={`Імпорт з дати для ${label}`}
                            value={config.syncFrom}
                            onChange={(e) => e.target.value && actions.setAccountSyncDate(acc.id, e.target.value)}
                          />
                        }
                      />
                      {isJar && (
                        <Row
                          title="Створити фінансову ціль"
                          trailing={
                            <Switch
                              label="Створити фінансову ціль"
                              checked={config.createGoal ?? false}
                              onChange={() => actions.toggleCreateGoal(acc.id)}
                            />
                          }
                        />
                      )}
                    </>
                  )}
                </Group>
              </Section>
            );
          })}
          <Footnote style={{ margin: "0 16px", display: "flex", alignItems: "center", gap: 6 }}>
            <HiOutlineClock size={14} /> Приблизно 1 хвилина завантаження на місяць історії.
          </Footnote>
          {hasExistingConnection && (
            <Section>
              <Group>
                <Row onClick={() => setConfirmDisconnect(true)} title={<span style={{ color: "#ff3b30" }}>Відключити Monobank</span>} />
              </Group>
            </Section>
          )}
        </>
      )}

      {step === "active" && (
        <Center>
          <HiCheck size={44} color="var(--m-accent)" />
          <strong style={{ color: "var(--m-label)", fontSize: 20 }}>Синхронізацію розпочато</strong>
          <span>Операції завантажуються у фоновому режимі.</span>
          <Footnote style={{ textAlign: "left" }}>
            <strong>Це займе час:</strong> через ліміти банку дані завантажуються порціями.
            <br />
            <strong>Можна закрити вікно:</strong> процес триватиме сам.
          </Footnote>
        </Center>
      )}

      <Sheet
        nested
        open={!!pickFor}
        onOpenChange={(o) => !o && setPickFor(null)}
        title="Прив'язати до"
        hideCancel
        trailing={
          <SheetTextButton type="button" $bold onClick={() => setPickFor(null)}>
            Готово
          </SheetTextButton>
        }
      >
        <Group>
          <Row
            onClick={() => {
              if (pickFor) actions.setInternalId(pickFor, "");
              setPickFor(null);
            }}
            title="Створити новий рахунок"
            trailing={pickFor && !mapping[pickFor]?.internalId ? <HiCheck size={20} color="var(--m-accent)" aria-label="Обрано" /> : undefined}
          />
          {compatible.map((a) => (
            <Row
              key={a.id}
              onClick={() => {
                if (pickFor) actions.setInternalId(pickFor, a.id);
                setPickFor(null);
              }}
              title={a.name}
              subtitle={money(a.calculated_balance ?? a.balance ?? 0, a.currency)}
              trailing={pickFor && mapping[pickFor]?.internalId === a.id ? <HiCheck size={20} color="var(--m-accent)" aria-label="Обрано" /> : undefined}
            />
          ))}
        </Group>
        {compatible.length === 0 && <Footnote>Рахунків у цій валюті ще немає — буде створено новий.</Footnote>}
      </Sheet>

      <ConfirmSheet
        open={confirmDisconnect}
        onOpenChange={setConfirmDisconnect}
        message="Відключити Monobank? Автоматична синхронізація зупиниться, уже завантажені транзакції залишаться."
        actions={[{ label: "Відключити", destructive: true, onSelect: () => void actions.handleDisconnect() }]}
      />
    </Sheet>
  );
}
