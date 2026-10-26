import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import toast from "react-hot-toast";
import axios from "axios";
import styled from "styled-components";
import {
  HiArrowsRightLeft,
  HiExclamationTriangle,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineCamera,
  HiPlus,
} from "react-icons/hi2";

import type { Account } from "../../../types";
import type { TransactionFull } from "./transactionFull";
import { useSettings } from "../../../context/SettingsContext";
import { getAccountsApi } from "../../../services/apiAccounts";
import { getCategoriesApi } from "../../../services/apiCategories";
import {
  deleteReceiptApi,
  deleteTransactionApi,
  deleteTransactionPhotoApi,
  getLinkedReceiptSourcesApi,
  getTransactionApi,
  unlinkReceiptSourceApi,
  uploadReceiptApi,
} from "../../../services/apiTransactions";
import {
  useTransactionItem,
  type TransactionListItem,
} from "../../../hooks/Transactions/useTransactionItem";
import { compressImage } from "../../../utils/compressor";
import { safeExternalUrl } from "../../../utils/safeUrl";
import { formatMoney, getUploadedFileUrl } from "../../../utils/helpers";
import { isDiscountItem } from "../../../components/transactions/form/itemUtils";
import { AccountTile } from "../../../mobile/accountTile";
import { categoryLabel } from "../../../mobile/categoryLabel";
import { Section, Group, Row, Amount, Meta } from "../../../mobile/ui/Group";
import { NavBar, NavButton } from "../../../mobile/ui/NavBar";
import {
  ConfirmSheet,
  type ConfirmAction,
} from "../../../mobile/ui/ConfirmSheet";
import { PhotoViewer } from "../../../mobile/ui/PhotoViewer";
import { Tile } from "../../../mobile/ui/Tile";
import { AddSheet } from "../AddSheet/AddSheet";

// Операція в стилі iOS: шапка із сумою, фото, деталі, товари, чек.
// Усе, що вміла стара сторінка (TransactionPage + TransactionDetails), — тут.

const TYPE_LABEL: Record<string, string> = {
  expense: "Витрата",
  income: "Дохід",
  transfer: "Переказ",
  transfer_out: "Переказ",
  transfer_in: "Переказ",
  loan_give: "Я позичив",
  loan_repay: "Мені повернули",
  debt_take: "Я взяв у борг",
  debt_repay: "Я повернув",
};
const INCOMING = new Set(["income", "transfer_in", "loan_repay", "debt_take"]);
const DEBT = new Set(["loan_give", "loan_repay", "debt_take", "debt_repay"]);

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

const HeroAmount = styled.p<{ $tone: "income" | "default" | "muted" }>`
  margin: 0;
  font-size: 40px;
  line-height: 1.1;
  font-weight: 700;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  color: ${(p) => (p.$tone === "income" ? "var(--m-accent)" : p.$tone === "muted" ? "var(--m-label-2)" : "var(--m-label)")};
  text-decoration: ${(p) => (p.$tone === "muted" ? "line-through" : "none")};
`;

const HeroMeta = styled.p`
  margin: 0;
  font-size: 15px;
  color: var(--m-label-2);
`;

const Exchange = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  border-radius: var(--m-radius-group);
  background: var(--m-surface);
  text-align: center;

  small {
    display: block;
    font-size: 12px;
    color: var(--m-label-2);
  }

  strong {
    font-size: 17px;
    font-variant-numeric: tabular-nums;
  }
`;

const Rate = styled.p`
  margin: -16px 0 0;
  text-align: center;
  font-size: 13px;
  color: var(--m-label-2);
`;

const Photos = styled.div`
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

const PhotoThumb = styled.button`
  flex: 0 0 auto;
  width: 88px;
  height: 88px;
  padding: 0;
  border: none;
  border-radius: 12px;
  overflow: hidden;
  background: var(--m-fill);
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const AddPhoto = styled(PhotoThumb)`
  display: grid;
  place-items: center;
  background: var(--m-surface);
  color: var(--m-accent);

  &:disabled {
    color: var(--m-label-3);
  }
`;

const Chips = styled.span`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 4px;
  max-width: 220px;
`;

const TagChip = styled.span<{ $color: string }>`
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 13px;
  color: ${(p) => p.$color};
  background: color-mix(in srgb, ${(p) => p.$color} 14%, transparent);
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

const Avatar = styled.img`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
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

const Footnote = styled.p`
  margin: -16px 4px 0;
  font-size: 13px;
  color: var(--m-label-2);
`;

const Center = styled.p`
  margin: 40vh 0 0;
  text-align: center;
  color: var(--m-label-2);
`;

// Курс у звичному напрямку: «1 USD ≈ 41,0000 UAH», а не «1 UAH ≈ 0,0244 USD».
function rateText(
  fromAmount: number,
  fromCurrency: string,
  toAmount: number,
  toCurrency: string,
) {
  const forward = toAmount / fromAmount;
  const [unit, rate, other] =
    forward >= 1
      ? [fromCurrency, forward, toCurrency]
      : [toCurrency, fromAmount / toAmount, fromCurrency];
  return `1 ${unit} ≈ ${rate.toFixed(4).replace(".", ",")} ${other}`;
}

const errorMessage = (error: unknown) =>
  axios.isAxiosError(error)
    ? error.response?.data?.error || error.message
    : "Щось пішло не так";

export default function MobileTransaction() {
  const { transactionId = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { language, currency: baseCurrency } = useSettings();
  const photoInput = useRef<HTMLInputElement>(null);

  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [confirm, setConfirm] = useState<null | {
    message: string;
    actions: ConfirmAction[];
  }>(null);
  const [editing, setEditing] = useState(false);

  const {
    data: tx,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["transaction", transactionId],
    queryFn: () => getTransactionApi(transactionId) as Promise<TransactionFull>,
    enabled: !!transactionId,
  });
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategoriesApi,
  });
  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccountsApi,
  });
  const { data: receiptSources = [] } = useQuery({
    queryKey: ["transaction", transactionId, "receipt-sources"],
    queryFn: () => getLinkedReceiptSourcesApi(transactionId),
    enabled: !!tx,
  });

  // Ті самі назва, іконка й логотип, що й у рядку списку операцій.
  const view = useTransactionItem({
    transaction: (tx ?? {
      id: "",
      amount: 0,
      type: "expense",
      date: 0,
    }) as TransactionListItem,
    categories,
    accounts: accounts as unknown as Account[],
    baseCurrency,
    language,
  });

  const refresh = () => {
    for (const key of [
      "transaction",
      "transactions",
      "transactions-infinite",
      "accounts",
      "account",
      "stats",
      "inbox",
    ]) {
      queryClient.invalidateQueries({ queryKey: [key] });
    }
  };
  const back = () =>
    window.history.length > 1 ? navigate(-1) : navigate("/transactions");

  const remove = useMutation({
    mutationFn: () => deleteTransactionApi(transactionId),
    onSuccess: () => {
      toast.success("Операцію видалено");
      refresh();
      navigate("/transactions", { replace: true });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const addPhotos = useMutation({
    mutationFn: async (files: File[]) => {
      for (const file of files)
        await uploadReceiptApi({
          id: transactionId,
          file: await compressImage(file),
        });
    },
    onSuccess: () => {
      toast.success("Фото додано");
      queryClient.invalidateQueries({
        queryKey: ["transaction", transactionId],
      });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const deletePhoto = useMutation({
    mutationFn: async (target: { photoId?: string; all?: boolean }) =>
      target.photoId && !target.all
        ? deleteTransactionPhotoApi(target.photoId)
        : deleteReceiptApi(transactionId),
    onSuccess: () => {
      toast.success("Фото видалено");
      setViewerIndex(null);
      queryClient.invalidateQueries({
        queryKey: ["transaction", transactionId],
      });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const unlinkReceipt = useMutation({
    mutationFn: (sourceId: string) =>
      unlinkReceiptSourceApi(transactionId, sourceId),
    onSuccess: () => {
      toast.success("Чек відкріплено й повернуто в «Чеки»");
      refresh();
    },
    onError: () => toast.error("Не вдалося відкріпити чек"),
  });

  if (isLoading) {
    return (
      <Page>
        <NavBar backLabel="Операції" onBack={back} />
        <Center>Завантаження…</Center>
      </Page>
    );
  }
  if (isError || !tx) {
    return (
      <Page>
        <NavBar backLabel="Операції" onBack={back} />
        <Center>Операцію не знайдено</Center>
      </Page>
    );
  }

  const type = (tx.type || "").toLowerCase();
  const isTransfer = type.startsWith("transfer");
  const isDebt = DEBT.has(type);
  const isBank = !!tx.external_id;
  const account = accounts.find((a) => a.id === tx.account_id);
  const currency = account?.currency || tx.currency || baseCurrency;
  const money = (minor: number, cur = currency) =>
    formatMoney(minor, cur, language);

  const sign = isTransfer ? "" : INCOMING.has(type) ? "+" : "−";
  const tone = tx.is_forgiveness
    ? "muted"
    : type === "income"
      ? "income"
      : "default";
  const date = new Date(tx.date);
  const typeLabel = tx.is_forgiveness
    ? "Прощення боргу"
    : (TYPE_LABEL[type] ?? "Операція");

  // Переказ: рахунок-партнер і сума на його боці
  const partner = isTransfer
    ? accounts.find((a) => a.id === tx.related_transaction?.account_id)
    : undefined;
  const partnerAmount = Math.abs(tx.related_transaction?.amount ?? 0);
  const [fromAcc, toAcc] =
    type === "transfer_in" ? [partner, account] : [account, partner];
  const [fromAmount, toAmount] =
    type === "transfer_in"
      ? [partnerAmount, Math.abs(tx.amount)]
      : [Math.abs(tx.amount), partnerAmount];
  const multiCurrency =
    isTransfer && !!fromAcc && !!toAcc && fromAcc.currency !== toAcc.currency;

  const category = categories.find((c) => c.id === tx.category_id);
  const counterparty =
    tx.counterparty_id && tx.counterparty?.name ? tx.counterparty : null;
  const bankDescription = !counterparty && isBank && tx.note ? tx.note : "";

  const photoUrls = tx.photos?.length
    ? tx.photos
        .map((p) => getUploadedFileUrl(p.path))
        .filter((u): u is string => !!u)
    : tx.receipt_img
      ? [getUploadedFileUrl(tx.receipt_img)].filter((u): u is string => !!u)
      : [];

  const items = (tx.items || []).filter((i) => i && (i.name || i.total_amount));
  const itemsTotal = items.reduce((sum, i) => sum + (i.total_amount || 0), 0);
  const receiptUrl = safeExternalUrl(
    receiptSources.find((s) => s.source_type === "url" && s.source_url)
      ?.source_url,
  );
  const receiptDiscount = receiptSources.find(
    (s) => (s.discount_total || 0) > 0,
  );
  const discountItemized = items.some((i) => i.name === "Знижка за чеком");
  const uncategorized = items.filter(
    (i) => i.receipt_source_id && !i.category_id && !isDiscountItem(i),
  ).length;

  const askDeletePhoto = (index: number) => {
    const photo = tx.photos?.[index];
    const actions: ConfirmAction[] = [
      {
        label: "Видалити це фото",
        destructive: true,
        onSelect: () => deletePhoto.mutate({ photoId: photo?.id }),
      },
    ];
    if (photoUrls.length > 1) {
      actions.push({
        label: "Видалити всі фото",
        destructive: true,
        onSelect: () => deletePhoto.mutate({ all: true }),
      });
    }
    setConfirm({ message: "Фото буде видалено з операції.", actions });
  };

  return (
    <Page>
      <NavBar
        backLabel="Операції"
        onBack={back}
        trailing={
          <NavButton type="button" onClick={() => setEditing(true)}>
            Змінити
          </NavButton>
        }
      />
      <Body>
        <Hero>
          <Tile
            logo={isTransfer || isDebt ? null : view.logoUrl}
            iconName={view.iconName}
            icon={isTransfer ? <HiArrowsRightLeft size={28} /> : undefined}
            color={view.color}
            tint={isTransfer ? "gray" : "green"}
            size={56}
          />
          <HeroTitle>{view.title}</HeroTitle>
          <HeroAmount $tone={tone}>
            {sign}
            {money(Math.abs(tx.amount))}
          </HeroAmount>
          <HeroMeta>
            {typeLabel} · {format(date, "d MMMM yyyy, HH:mm", { locale: uk })}
          </HeroMeta>
        </Hero>

        {multiCurrency && fromAcc && toAcc && (
          <>
            <Exchange>
              <div>
                <small>Списано</small>
                <strong>{money(fromAmount, fromAcc.currency)}</strong>
                <small>{fromAcc.name}</small>
              </div>
              <HiArrowsRightLeft size={18} color="var(--m-label-2)" />
              <div>
                <small>Зараховано</small>
                <strong>{money(toAmount, toAcc.currency)}</strong>
                <small>{toAcc.name}</small>
              </div>
            </Exchange>
            {fromAmount > 0 && toAmount > 0 && (
              <Rate>
                {rateText(
                  fromAmount,
                  fromAcc.currency,
                  toAmount,
                  toAcc.currency,
                )}
              </Rate>
            )}
          </>
        )}

        {photoUrls.length === 0 ? (
          <Group>
            <Row
              onClick={() => photoInput.current?.click()}
              leading={<HiOutlineCamera size={22} color="var(--m-accent)" />}
              title={addPhotos.isPending ? "Завантаження…" : "Додати фото чека"}
              inset={50}
            />
          </Group>
        ) : (
          <Section caption={`Фото · ${photoUrls.length}`}>
            <Photos>
              {photoUrls.map((url, index) => (
                <PhotoThumb
                  key={url}
                  type="button"
                  aria-label={`Фото ${index + 1}`}
                  onClick={() => setViewerIndex(index)}
                >
                  <img src={url} alt="" />
                </PhotoThumb>
              ))}
              <AddPhoto
                type="button"
                aria-label="Додати фото"
                disabled={addPhotos.isPending}
                onClick={() => photoInput.current?.click()}
              >
                <HiPlus size={26} />
              </AddPhoto>
            </Photos>
          </Section>
        )}
        <input
          ref={photoInput}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            e.target.value = "";
            if (files.length) addPhotos.mutate(files);
          }}
        />

        <Group>
          {!isTransfer && !isDebt && (
            <Row
              leading={
                <Tile
                  iconName={category?.icon}
                  color={category?.color}
                  size={30}
                />
              }
              title="Категорія"
              trailing={
                <Meta>
                  {categoryLabel(categories, tx.category_id) ?? "Без категорії"}
                </Meta>
              }
              inset={58}
            />
          )}
          {counterparty && (
            <Row
              leading={
                <Tile
                  logo={counterparty.logo}
                  iconName={counterparty.icon || "HiOutlineUser"}
                  size={30}
                />
              }
              title={isDebt ? "Хто" : type === "income" ? "Від кого" : "Де"}
              trailing={<Meta>{counterparty.name}</Meta>}
              inset={58}
            />
          )}
          {bankDescription && (
            <Row title="Опис банку" subtitle={bankDescription} />
          )}
          {isTransfer ? (
            <>
              <Row
                leading={
                  fromAcc ? (
                    <AccountTile account={fromAcc} size={30} />
                  ) : undefined
                }
                title="Звідки"
                trailing={<Meta>{fromAcc?.name ?? "Видалений рахунок"}</Meta>}
                inset={58}
              />
              <Row
                leading={
                  toAcc ? <AccountTile account={toAcc} size={30} /> : undefined
                }
                title="Куди"
                trailing={<Meta>{toAcc?.name ?? "Видалений рахунок"}</Meta>}
                inset={58}
              />
            </>
          ) : (
            <Row
              leading={
                account ? (
                  <AccountTile account={account} size={30} />
                ) : undefined
              }
              title="Рахунок"
              trailing={<Meta>{account?.name ?? "Видалений рахунок"}</Meta>}
              inset={58}
            />
          )}
          {!!tx.tags?.length && (
            <Row
              title="Теги"
              trailing={
                <Chips>
                  {tx.tags.map((t) => (
                    <TagChip key={t.id} $color={t.color || "#6366f1"}>
                      {t.name}
                    </TagChip>
                  ))}
                </Chips>
              }
            />
          )}
          {tx.asset && (
            <Row
              title="Актив"
              trailing={
                <Meta>
                  {tx.asset.name}
                  {tx.mileage
                    ? ` · ${tx.mileage.toLocaleString("uk-UA")} км`
                    : ""}
                </Meta>
              }
            />
          )}
          {tx.user && (
            <Row
              leading={
                tx.user.avatar_url ? (
                  <Avatar src={getUploadedFileUrl(tx.user.avatar_url)} alt="" />
                ) : undefined
              }
              title="Додав"
              trailing={<Meta>{tx.user.name}</Meta>}
              inset={tx.user.avatar_url ? 58 : 16}
            />
          )}
        </Group>

        {tx.note && !bankDescription && <Note>{tx.note}</Note>}

        {items.length > 0 && (
          <Section caption={`Товари · ${items.length}`}>
            <Group>
              {items.map((item, index) => {
                const discount = isDiscountItem(item) || item.total_amount < 0;
                const itemCategory = item.category_id
                  ? categoryLabel(categories, item.category_id)
                  : undefined;
                return (
                  <Row
                    key={item.id || index}
                    title={item.name}
                    subtitle={
                      [
                        itemCategory,
                        item.quantity > 1
                          ? `${item.quantity} × ${money(item.price_per_unit)}`
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" · ") || undefined
                    }
                    trailing={
                      <Amount $tone={discount ? "income" : "default"}>
                        {item.total_amount < 0 ? "−" : ""}
                        {money(Math.abs(item.total_amount))}
                      </Amount>
                    }
                  />
                );
              })}
              <Row
                title="Разом"
                trailing={<Amount>{money(itemsTotal)}</Amount>}
              />
            </Group>
          </Section>
        )}

        {(receiptUrl ||
          (receiptDiscount && !discountItemized) ||
          uncategorized > 0 ||
          receiptSources.length > 0) && (
          <Section caption="Чек">
            <Group>
              {receiptUrl && (
                <Row
                  onClick={() => window.open(receiptUrl, "_blank", "noopener")}
                  leading={
                    <HiOutlineArrowTopRightOnSquare
                      size={20}
                      color="var(--m-accent)"
                    />
                  }
                  title="Електронний чек"
                  subtitle={receiptUrl}
                  inset={48}
                />
              )}
              {receiptDiscount && !discountItemized && (
                <Row
                  title="Знижка в чеку"
                  subtitle="Вже врахована в цінах"
                  trailing={
                    <Meta>
                      −
                      {money(
                        receiptDiscount.discount_total || 0,
                        receiptDiscount.currency || currency,
                      )}
                    </Meta>
                  }
                />
              )}
              {uncategorized > 0 && (
                <Row
                  leading={<HiExclamationTriangle size={20} color="#ff9500" />}
                  title={`${uncategorized} ${uncategorized === 1 ? "позиція" : "позицій"} з чека без категорії`}
                  inset={48}
                />
              )}
              {receiptSources.length > 0 && (
                <Row
                  onClick={() =>
                    setConfirm({
                      message:
                        "Чек відкріпиться від операції й повернеться в «Чеки».",
                      actions: [
                        {
                          label: "Відкріпити чек",
                          destructive: true,
                          onSelect: () =>
                            unlinkReceipt.mutate(receiptSources[0].id),
                        },
                      ],
                    })
                  }
                  title="Відкріпити чек"
                />
              )}
            </Group>
          </Section>
        )}

        <DestructiveButton
          type="button"
          disabled={isBank || remove.isPending}
          onClick={() =>
            setConfirm({
              message: isTransfer
                ? "Переказ буде видалено з обох рахунків."
                : "Операцію буде видалено, баланс рахунку повернеться.",
              actions: [
                {
                  label: "Видалити операцію",
                  destructive: true,
                  onSelect: () => remove.mutate(),
                },
              ],
            })
          }
        >
          Видалити операцію
        </DestructiveButton>
        {isBank && (
          <Footnote>Це банківська операція — видалення заборонено.</Footnote>
        )}
      </Body>

      {viewerIndex !== null && (
        <PhotoViewer
          urls={photoUrls}
          startIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
          onDelete={askDeletePhoto}
        />
      )}
      <ConfirmSheet
        open={!!confirm}
        onOpenChange={(open) => !open && setConfirm(null)}
        message={confirm?.message ?? ""}
        actions={confirm?.actions ?? []}
      />
      {editing && (
        <AddSheet
          open={editing}
          onOpenChange={(open) => {
            if (!open) {
              setEditing(false);
              refresh();
            }
          }}
          onOpenReceiptImport={() => undefined}
          transaction={tx}
        />
      )}
    </Page>
  );
}
