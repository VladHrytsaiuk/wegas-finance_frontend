import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import toast from "react-hot-toast";
import axios from "axios";
import styled from "styled-components";
import {
  HiOutlineArrowTopRightOnSquare,
  HiOutlineCamera,
  HiOutlineReceiptPercent,
} from "react-icons/hi2";

import {
  deleteInboxItemApi,
  getInboxAccountCandidatesApi,
  getInboxEntryApi,
  getInboxTransactionCandidatesApi,
  linkInboxTransactionApi,
  selectInboxAccountApi,
} from "../../../services/apiInbox";
import { getCategoriesApi } from "../../../services/apiCategories";
import { getTransactionsApi } from "../../../services/apiTransactions";
import type { Transaction } from "../../../types";
import { useSettings } from "../../../context/SettingsContext";
import { formatMoney, getUploadedFileUrl } from "../../../utils/helpers";
import { safeExternalUrl } from "../../../utils/safeUrl";
import { categoryLabel } from "../../../mobile/categoryLabel";
import { Section, Group, Row, Amount, Meta } from "../../../mobile/ui/Group";
import { NavBar } from "../../../mobile/ui/NavBar";
import {
  ConfirmSheet,
  type ConfirmAction,
} from "../../../mobile/ui/ConfirmSheet";
import { PhotoViewer } from "../../../mobile/ui/PhotoViewer";
import { SearchField } from "../../../mobile/ui/SearchField";
import { PrimaryButton } from "../../../mobile/ui/Sheet";
import { Tile } from "../../../mobile/ui/Tile";
import { AddSheet } from "../AddSheet/AddSheet";
import { initialFromReceipt } from "./receiptPrefill";
import { INBOX_STATUS, receiptTitle } from "./inboxLabels";

// Розбір чека: підтвердити рахунок, зв'язати з операцією або створити її з чека.
// Усе, що вміла стара сторінка InboxEntryPage, — у порядку, в якому це роблять.

const SOURCE_LABEL: Record<string, string> = {
  xml: "XML чек",
  url: "Чек за посиланням",
  pdf: "PDF чек",
  photo: "Фото чека",
};

const CONFIDENCE: Record<string, string> = {
  high: "висока впевненість",
  medium: "середня впевненість",
  low: "низька впевненість",
};

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
`;

const HeroTitle = styled.h2`
  margin: 6px 0 0;
  font-size: 17px;
  font-weight: 600;
`;

const HeroAmount = styled.p`
  margin: 0;
  font-size: 40px;
  line-height: 1.1;
  font-weight: 700;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
`;

const HeroMeta = styled.p`
  margin: 0;
  font-size: 15px;
  color: var(--m-label-2);
`;

const Badge = styled.span<{ $tone: "accent" | "warning" | "muted" }>`
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  color: ${(p) => (p.$tone === "accent" ? "var(--m-accent)" : p.$tone === "warning" ? "#c2410c" : "var(--m-label-2)")};
  background: ${(p) =>
    p.$tone === "accent"
      ? "var(--m-accent-soft)"
      : p.$tone === "warning"
        ? "#fdf0e6"
        : "var(--m-fill)"};
`;

const SmallButton = styled.button`
  flex-shrink: 0;
  height: 32px;
  padding: 0 14px;
  border: none;
  border-radius: 16px;
  font: inherit;
  font-size: 15px;
  font-weight: 600;
  color: var(--m-on-accent);
  background: var(--m-accent);
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
  }
`;

const LinkButton = styled.button`
  align-self: center;
  padding: 6px 0;
  border: none;
  background: none;
  font: inherit;
  font-size: 15px;
  color: var(--m-accent);
  cursor: pointer;
`;

const DestructiveButton = styled.button`
  width: 100%;
  min-height: 48px;
  border: none;
  border-radius: var(--m-radius-group);
  background: var(--m-surface);
  font: inherit;
  font-size: 17px;
  color: #ff3b30;
  cursor: pointer;

  &:disabled {
    color: var(--m-label-3);
  }
`;

const Note = styled.p`
  margin: 0;
  padding: 12px 16px;
  border-radius: var(--m-radius-group);
  background: var(--m-surface);
  font-size: 16px;
  line-height: 1.4;
  white-space: pre-wrap;
`;

const Hint = styled.p`
  margin: -16px 4px 0;
  font-size: 13px;
  color: var(--m-label-2);
`;

const Empty = styled.p`
  margin: 0;
  padding: 16px;
  border-radius: var(--m-radius-group);
  background: var(--m-surface);
  font-size: 15px;
  color: var(--m-label-2);
  text-align: center;
`;

const Center = styled.p`
  margin: 40vh 0 0;
  text-align: center;
  color: var(--m-label-2);
`;

const errorMessage = (error: unknown, fallback: string) =>
  (axios.isAxiosError(error) && error.response?.data?.error) || fallback;

export default function MobileInboxEntry() {
  const { inboxId = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { language } = useSettings();

  const [showLowConfidence, setShowLowConfidence] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualSearch, setManualSearch] = useState("");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [confirm, setConfirm] = useState<null | {
    message: string;
    actions: ConfirmAction[];
  }>(null);

  const {
    data: entry,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["inbox", inboxId],
    queryFn: () => getInboxEntryApi(inboxId),
    enabled: !!inboxId,
  });
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategoriesApi,
  });
  const { data: accountCandidates = [] } = useQuery({
    queryKey: ["inbox", inboxId, "account-candidates"],
    queryFn: () => getInboxAccountCandidatesApi(inboxId),
    enabled:
      !!entry?.receipt_source?.payment_mask && !entry.selected_account_id,
  });
  const { data: txCandidates = [] } = useQuery({
    queryKey: ["inbox", inboxId, "transaction-candidates"],
    queryFn: () => getInboxTransactionCandidatesApi(inboxId),
    enabled: entry?.total != null && entry.status !== "linked",
  });
  const { data: manualResults } = useQuery({
    queryKey: ["inbox", inboxId, "manual-transactions", manualSearch],
    queryFn: () =>
      getTransactionsApi({
        account_id: entry?.selected_account_id ?? "",
        min_amount: entry?.total ?? undefined,
        max_amount: entry?.total ?? undefined,
        search: manualSearch,
        limit: 10,
      }) as Promise<{ data: Transaction[] }>,
    enabled: manualOpen && entry?.total != null,
  });

  const refreshInbox = () => {
    for (const key of [
      ["inbox"],
      ["inbox", "pending-count"],
      ["transactions"],
      ["transactions-infinite"],
    ]) {
      queryClient.invalidateQueries({ queryKey: key });
    }
  };

  const selectAccount = useMutation({
    mutationFn: (accountId: string) =>
      selectInboxAccountApi(inboxId, accountId),
    onSuccess: (updated) => {
      queryClient.setQueryData(["inbox", inboxId], updated);
      refreshInbox();
      toast.success("Рахунок підтверджено");
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Не вдалося підтвердити рахунок")),
  });

  const link = useMutation({
    mutationFn: (transactionId: string) =>
      linkInboxTransactionApi(inboxId, transactionId),
    onSuccess: (updated, transactionId) => {
      queryClient.setQueryData(["inbox", inboxId], updated);
      queryClient.invalidateQueries({
        queryKey: ["transaction", transactionId],
      });
      refreshInbox();
      toast.success("Чек зв'язано з операцією");
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Не вдалося зв'язати чек з операцією")),
  });

  const remove = useMutation({
    mutationFn: () => deleteInboxItemApi(inboxId),
    onSuccess: () => {
      refreshInbox();
      toast.success("Чек видалено");
      navigate("/transactions?filter=inbox", { replace: true });
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Не вдалося видалити чек")),
  });

  const photoUrls = useMemo(() => {
    const source = entry?.receipt_source;
    if (!source) return [];
    let paths = source.file_path ? [source.file_path] : [];
    try {
      const extra = source.file_paths ? JSON.parse(source.file_paths) : [];
      if (Array.isArray(extra)) paths = [...paths, ...extra];
    } catch {
      // Старий чек без списку фото.
    }
    return [...new Set(paths.filter(Boolean))]
      .map((path) => getUploadedFileUrl(path))
      .filter((url): url is string => !!url);
  }, [entry?.receipt_source]);

  const back = () =>
    window.history.length > 1
      ? navigate(-1)
      : navigate("/transactions?filter=inbox");

  if (isLoading) {
    return (
      <Page>
        <NavBar backLabel="Чеки" onBack={back} />
        <Center>Завантаження…</Center>
      </Page>
    );
  }
  if (isError || !entry) {
    return (
      <Page>
        <NavBar backLabel="Чеки" onBack={back} />
        <Center>Не вдалося відкрити чек</Center>
      </Page>
    );
  }

  const source = entry.receipt_source;
  const currency = entry.currency || source?.currency || "UAH";
  const money = (minor: number) => formatMoney(minor, currency, language);
  const title = receiptTitle(entry);
  const total = entry.total ?? source?.total ?? null;
  const occurredAt = entry.occurred_at ?? source?.receipt_date ?? null;
  const items = source?.items ?? [];
  const linked = entry.status === "linked";
  const recommended = accountCandidates.find((c) => c.recommended);
  const partialAccounts = accountCandidates.filter((c) => !c.recommended);
  const visibleCandidates = txCandidates.filter(
    (c) => showLowConfidence || c.confidence !== "low",
  );
  const lowCount = txCandidates.filter((c) => c.confidence === "low").length;
  const sourceUrl = safeExternalUrl(source?.source_url);
  const showNote =
    !!entry.note?.trim() &&
    entry.note.trim().toLowerCase() !== title.trim().toLowerCase();
  const statusTone = linked
    ? "accent"
    : entry.status === "needs_account" || entry.status === "needs_review"
      ? "warning"
      : "muted";

  const confirmLink = (transactionId: string, label: string) =>
    setConfirm({
      message: `Зв'язати чек з операцією «${label}»? Товари з чека перейдуть в операцію.`,
      actions: [
        { label: "Зв'язати чек", onSelect: () => link.mutate(transactionId) },
      ],
    });

  const accountName = (c: { bank_name: string; account_name: string }) =>
    c.bank_name && c.account_name !== c.bank_name
      ? `${c.bank_name} · ${c.account_name}`
      : c.bank_name || c.account_name;

  return (
    <Page>
      <NavBar backLabel="Чеки" onBack={back} />
      <Body>
        <Hero>
          <Tile
            tint="green"
            size={56}
            icon={
              entry.source_type === "photo" ? (
                <HiOutlineCamera size={28} />
              ) : (
                <HiOutlineReceiptPercent size={28} />
              )
            }
          />
          <HeroTitle>{title}</HeroTitle>
          <HeroAmount>{total != null ? money(total) : "—"}</HeroAmount>
          <HeroMeta>
            {[
              SOURCE_LABEL[entry.source_type] ?? entry.source_type,
              occurredAt
                ? format(new Date(occurredAt), "d MMMM yyyy, HH:mm", {
                    locale: uk,
                  })
                : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </HeroMeta>
          <Badge $tone={statusTone}>
            {INBOX_STATUS[entry.status] ?? entry.status}
          </Badge>
        </Hero>

        {photoUrls.length > 0 && (
          <Group>
            <Row
              onClick={() => setViewerOpen(true)}
              leading={<HiOutlineCamera size={22} color="var(--m-accent)" />}
              title={
                photoUrls.length > 1
                  ? `Фото чека · ${photoUrls.length}`
                  : "Фото чека"
              }
              chevron
              inset={50}
            />
          </Group>
        )}

        {/* 1. Рахунок оплати за маскою картки */}
        {!entry.selected_account_id &&
          (recommended || partialAccounts.length > 0) && (
            <Section caption="Рахунок оплати">
              <Group>
                {recommended && (
                  <Row
                    title={accountName(recommended)}
                    subtitle={`•••• ${recommended.matched_card_number} · точний збіг картки й валюти`}
                    trailing={
                      <SmallButton
                        type="button"
                        disabled={selectAccount.isPending}
                        onClick={() =>
                          selectAccount.mutate(recommended.account_id)
                        }
                      >
                        Підтвердити
                      </SmallButton>
                    }
                  />
                )}
                {partialAccounts.map((c) => (
                  <Row
                    key={c.account_id}
                    title={accountName(c)}
                    subtitle={`•••• ${c.matched_card_number} · збіг ${c.matched_digits} цифр`}
                    trailing={
                      <SmallButton
                        type="button"
                        disabled={selectAccount.isPending}
                        onClick={() => selectAccount.mutate(c.account_id)}
                      >
                        Обрати
                      </SmallButton>
                    }
                  />
                ))}
              </Group>
            </Section>
          )}
        {!entry.selected_account_id &&
          partialAccounts.length > 0 &&
          !recommended && (
            <Hint>
              Збіг неповний, тому підтвердьте потрібний рахунок вручну.
            </Hint>
          )}

        {/* 2. Операція, з якою зв'язати */}
        {!linked && txCandidates.length > 0 && (
          <Section caption="Можливі операції">
            <Group>
              {visibleCandidates.slice(0, 3).map((c) => {
                const minutes = occurredAt
                  ? Math.round(Math.abs(c.date - occurredAt) / 60000)
                  : null;
                const label =
                  c.counterparty_name || c.note || "Банківська операція";
                return (
                  <Row
                    key={c.transaction_id}
                    onClick={() => confirmLink(c.transaction_id, label)}
                    title={label}
                    subtitle={[
                      format(new Date(c.date), "d MMM, HH:mm", { locale: uk }),
                      CONFIDENCE[c.confidence],
                      minutes != null ? `${minutes} хв від чека` : null,
                      c.matched_by.length
                        ? `збіг: ${c.matched_by.join(", ")}`
                        : null,
                      c.is_synced ? "з банку" : "вручну",
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                    wrapSubtitle
                    trailing={
                      <Amount>
                        {formatMoney(
                          c.amount,
                          c.currency || currency,
                          language,
                        )}
                      </Amount>
                    }
                    chevron
                  />
                );
              })}
            </Group>
          </Section>
        )}
        {!linked && !showLowConfidence && lowCount > 0 && (
          <LinkButton type="button" onClick={() => setShowLowConfidence(true)}>
            Показати менш імовірні ({lowCount})
          </LinkButton>
        )}

        {/* 3. Зв'язати вручну */}
        {!linked && total != null && (
          <Section caption="Зв'язати вручну">
            {!manualOpen ? (
              <Group>
                <Row
                  onClick={() => setManualOpen(true)}
                  title="Знайти операцію"
                  subtitle={
                    entry.selected_account_id
                      ? `На обраному рахунку з сумою ${money(total)}`
                      : `Серед усіх операцій з сумою ${money(total)}`
                  }
                  chevron
                />
              </Group>
            ) : (
              <>
                <SearchField
                  value={manualSearch}
                  onChange={setManualSearch}
                  placeholder="Магазин або нотатка"
                  label="Пошук операції для чека"
                />
                <Group>
                  {(manualResults?.data ?? []).slice(0, 5).map((tx) => {
                    const label =
                      tx.counterparty?.name || tx.note || "Операція";
                    return (
                      <Row
                        key={tx.id}
                        onClick={() => confirmLink(tx.id, label)}
                        title={label}
                        subtitle={format(
                          new Date(tx.date),
                          "d MMM yyyy, HH:mm",
                          { locale: uk },
                        )}
                        trailing={
                          <Amount>
                            {formatMoney(
                              tx.amount,
                              tx.currency || currency,
                              language,
                            )}
                          </Amount>
                        }
                        chevron
                      />
                    );
                  })}
                  {!manualResults?.data?.length && (
                    <Row title="Нічого не знайдено" />
                  )}
                </Group>
              </>
            )}
          </Section>
        )}

        {/* 4. Або створити операцію з чека */}
        {!linked && (
          <>
            <PrimaryButton type="button" onClick={() => setCreating(true)}>
              Створити операцію з чека
            </PrimaryButton>
            <Hint>
              {entry.selected_account
                ? `Рахунок: ${entry.selected_account.name}. Усі дані чека вже заповнені.`
                : "Дані чека вже заповнені — залишиться обрати рахунок."}
            </Hint>
          </>
        )}

        <Group>
          <Row
            title="Магазин"
            trailing={
              <Meta>{source?.counterparty?.name || "Не визначено"}</Meta>
            }
          />
          <Row
            title="Категорія"
            trailing={<Meta>{source?.category?.name || "Не визначено"}</Meta>}
          />
          {entry.selected_account && (
            <Row
              title="Рахунок"
              trailing={<Meta>{entry.selected_account.name}</Meta>}
            />
          )}
          <Row
            title="Оплата"
            trailing={
              <Meta>{source?.payment_provider?.trim() || "Не визначено"}</Meta>
            }
          />
          {source?.payment_mask?.trim() && (
            <Row
              title="Картка (ЕПЗ)"
              trailing={
                <Meta>
                  •••• {source.payment_mask.trim().replace(/\D/g, "").slice(-4)}
                </Meta>
              }
            />
          )}
          {source?.receipt_number && (
            <Row
              title="Номер чека"
              trailing={<Meta>{source.receipt_number}</Meta>}
            />
          )}
          {source?.origin && (
            <Row title="Походження" trailing={<Meta>{source.origin}</Meta>} />
          )}
          {sourceUrl && (
            <Row
              onClick={() => window.open(sourceUrl, "_blank", "noopener")}
              leading={
                <HiOutlineArrowTopRightOnSquare
                  size={20}
                  color="var(--m-accent)"
                />
              }
              title="Чек на сайті"
              subtitle={source?.source_url}
              inset={48}
            />
          )}
        </Group>

        {showNote && <Note>{entry.note}</Note>}

        <Section caption={items.length ? `Товари · ${items.length}` : "Товари"}>
          {items.length === 0 ? (
            <Empty>
              Позиції ще не розпізнані — система не знайшла в чеку окремих
              товарів.
            </Empty>
          ) : null}
          <Group>
            {items.map((item) => {
              const itemCategory = item.category_id
                ? categoryLabel(categories, item.category_id)
                : undefined;
              return (
                <Row
                  key={item.id}
                  title={item.name}
                  subtitle={
                    [
                      itemCategory,
                      `${item.quantity} × ${money(item.price_per_unit)}`,
                    ]
                      .filter(Boolean)
                      .join(" · ") || undefined
                  }
                  trailing={<Amount>{money(item.total_amount)}</Amount>}
                />
              );
            })}
            {source?.subtotal != null && (
              <Row
                title="Проміжна сума"
                trailing={<Meta>{money(source.subtotal)}</Meta>}
              />
            )}
            {source?.discount_total != null && (
              <Row
                title="Знижка"
                trailing={
                  <Amount $tone="income">
                    −{money(Math.abs(source.discount_total))}
                  </Amount>
                }
              />
            )}
            <Row
              title="Разом"
              trailing={<Amount>{total != null ? money(total) : "—"}</Amount>}
            />
          </Group>
        </Section>

        {!linked && (
          <DestructiveButton
            type="button"
            disabled={remove.isPending}
            onClick={() =>
              setConfirm({
                message:
                  "Чек буде видалено з «Чеків». Цю дію не можна скасувати.",
                actions: [
                  {
                    label: "Видалити чек",
                    destructive: true,
                    onSelect: () => remove.mutate(),
                  },
                ],
              })
            }
          >
            Видалити чек
          </DestructiveButton>
        )}
        {linked && entry.matched_transaction_id && (
          <Group>
            <Row
              to={`/transactions/${entry.matched_transaction_id}`}
              title="Відкрити операцію"
              chevron
            />
          </Group>
        )}
      </Body>

      {viewerOpen && (
        <PhotoViewer
          urls={photoUrls}
          startIndex={0}
          onClose={() => setViewerOpen(false)}
        />
      )}
      <ConfirmSheet
        open={!!confirm}
        onOpenChange={(open) => !open && setConfirm(null)}
        message={confirm?.message ?? ""}
        actions={confirm?.actions ?? []}
      />
      {creating && (
        <AddSheet
          open={creating}
          onOpenChange={(open) => !open && setCreating(false)}
          onOpenReceiptImport={() => undefined}
          title="Операція з чека"
          prefill={initialFromReceipt(entry)}
          onCreated={async (transactionId) => {
            try {
              // Як на старій сторінці: товари вже в операції, а вибір категорій
              // з форми запам'ятовується для наступних чеків цього магазину.
              await linkInboxTransactionApi(inboxId, transactionId, {
                applyItems: false,
                learnFromTransaction: true,
              });
              queryClient.invalidateQueries({ queryKey: ["inbox", inboxId] });
              queryClient.invalidateQueries({
                queryKey: ["transaction", transactionId],
              });
              refreshInbox();
              toast.success("Операцію створено, чек прив'язано");
            } catch {
              toast.error(
                "Операцію створено, але чек не вдалося прив'язати — він лишився в «Чеках».",
              );
            }
          }}
        />
      )}
    </Page>
  );
}
