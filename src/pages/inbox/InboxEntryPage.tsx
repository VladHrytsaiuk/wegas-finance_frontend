import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import styled from "styled-components";
import {
  HiArrowLeft,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineClock,
  HiOutlineDocumentText,
  HiOutlineFolder,
  HiOutlineLink,
  HiOutlineReceiptPercent,
  HiOutlineSquares2X2,
  HiOutlineTag,
} from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

import MobilePageHeader from "../../components/mobile/MobilePageHeader";
import CreateTransactionModal from "../../components/transactions/CreateTransactionModal";
import { useIsMobile } from "../../hooks/useIsMobile";
import { usePageTitle } from "../../hooks/usePageTitle";
import {
  getInboxEntryApi,
  linkInboxTransactionApi,
} from "../../services/apiInbox";
import { formatDate, formatMoney } from "../../utils/helpers";
import * as PageStyles from "../transactions/TransactionPage.styles";
import * as DetailStyles from "../../components/transactions/TransactionDetails.styles";
import { inboxBadgeStyles } from "./inboxBadgeStyles";

const Header = styled(PageStyles.Header)`
  margin-bottom: 0;
  align-items: flex-start;
`;

const HeaderMain = styled(PageStyles.HeaderMain)`
  gap: 0.65rem;
`;

const HeaderTitle = styled(PageStyles.HeaderTitle)`
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const HeaderSubtitle = styled.p`
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  line-height: 1.35;
`;

const BadgeRow = styled(PageStyles.HeaderMeta)`
  margin-top: 0;
`;

const Badge = styled(PageStyles.HeaderMetaChip)<{
  $tone?: "default" | "warning" | "success" | "attention";
  $emphasis?: boolean;
}>`
  ${inboxBadgeStyles}
`;

const Amount = styled.div`
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: var(--color-text-main);
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 1.55rem;
  }
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.7fr);
  gap: 1rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const SectionCard = styled(PageStyles.Card)`
  padding: 1.15rem;
`;

const PrimaryCard = styled(SectionCard)`
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
`;

const ActionCard = styled(SectionCard)`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 1rem;
  border-color: color-mix(in srgb, var(--color-brand-500) 24%, var(--color-border));
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--color-brand-500) 7%, var(--color-bg-surface)) 0%,
    var(--color-bg-surface) 58%
  );
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    align-items: stretch;
  }
`;

const ActionCopy = styled.div`
  h2 {
    margin: 0;
    color: var(--color-text-main);
    font-size: 1rem;
    font-weight: 800;
  }

  p {
    margin: 0.25rem 0 0;
    color: var(--color-text-secondary);
    font-size: 0.9rem;
    line-height: 1.4;
  }
`;

const CreateActionButton = styled.button`
  min-height: 40px;
  padding: 0.65rem 0.9rem;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--color-brand-500), var(--color-brand-600));
  color: white;
  font-weight: 800;
  white-space: nowrap;
  cursor: pointer;
  box-shadow: 0 5px 14px color-mix(in srgb, var(--color-brand-700) 24%, transparent);
  transition: transform 0.18s ease, box-shadow 0.18s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 7px 18px color-mix(in srgb, var(--color-brand-700) 30%, transparent);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SectionTitle = styled(DetailStyles.SectionTitle)`
  margin: 0 0 0.65rem;
`;

const MetaList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
`;

const MetaRow = styled.div`
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr) minmax(96px, auto);
  align-items: center;
  gap: 0.45rem;
  padding: 0.72rem 0.8rem;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: var(--color-bg-page);
  overflow: hidden;

  @media (max-width: 640px) {
    grid-template-columns: 32px minmax(0, 1fr);
    row-gap: 0.18rem;
    column-gap: 0.45rem;
  }
`;

const RowIcon = styled.div<{ $color: string }>`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: color-mix(in srgb, var(--color-brand-500) 12%, var(--color-bg-page));
  border: 1px solid color-mix(in srgb, var(--color-brand-500) 18%, var(--color-border));
  color: var(--color-brand-700);
  overflow: hidden;

  svg {
    width: 1rem;
    height: 1rem;
  }

  @media (max-width: 640px) {
    width: 32px;
    height: 32px;
    border-radius: 9px;
  }
`;

const RowContent = styled.div`
  min-width: 0;

  .label {
    display: block;
    font-size: 0.88rem;
    font-weight: 800;
    color: var(--color-text-secondary);
    line-height: 1.2;
  }
`;

const RowValue = styled.div`
  min-width: 0;
  text-align: right;
  color: var(--color-text-main);
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.25;
  word-break: break-word;

  @media (max-width: 640px) {
    grid-column: 2;
    text-align: left;
    font-size: 0.9rem;
  }
`;

const ReceiptStats = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const ReceiptStat = styled.div`
  padding: 0.85rem 0.9rem;
  border-radius: 16px;
  background: var(--color-bg-page);
  border: 1px solid var(--color-border);

  .label {
    display: block;
    margin-bottom: 0.3rem;
    font-size: 0.8rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-tertiary);
  }

  .value {
    display: block;
    font-size: 1.04rem;
    font-weight: 800;
    color: var(--color-text-main);
    word-break: normal;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  @media (max-width: 640px) {
    padding: 0.72rem 0.75rem;

    .label {
      font-size: 0.7rem;
      margin-bottom: 0.18rem;
    }

    .value {
      font-size: 0.86rem;
    }
  }
`;

const MaskValue = styled.span`
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: normal;
`;

const SingleLineValue = styled(MaskValue)``;

const NoteBox = styled(DetailStyles.NoteBox)`
  margin-top: 0;
  font-style: normal;
  border-radius: 16px;
  background: var(--color-bg-page);
`;

const ItemsTable = styled(DetailStyles.ItemsTable)`
  th:nth-child(2),
  td:nth-child(2),
  th:nth-child(3),
  td:nth-child(3) {
    text-align: right;
    white-space: nowrap;
  }

  td:first-child {
    font-weight: 600;
    color: var(--color-text-main);
  }

  @media (max-width: 640px) {
    font-size: 0.84rem;

    th,
    td {
      padding: 0.7rem 0.55rem;
    }
  }
`;

const ItemsSummary = styled.div`
  margin-top: 0.9rem;
  padding: 0.95rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--color-brand-500) 3%, var(--color-bg-page)) 0%,
    var(--color-bg-page) 100%
  );
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
`;

const SummaryRow = styled.div<{ $strong?: boolean; $discount?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  font-size: ${({ $strong }) => ($strong ? "1.05rem" : "0.92rem")};
  font-weight: ${({ $strong }) => ($strong ? 800 : 600)};
  color: ${({ $discount }) =>
    $discount ? "var(--color-green-700)" : "var(--color-text-main)"};

  span:last-child {
    font-weight: ${({ $strong }) => ($strong ? 900 : 700)};
    color: ${({ $strong, $discount }) =>
      $discount
        ? "var(--color-green-700)"
        : $strong
          ? "var(--color-brand-700)"
          : "var(--color-text-main)"};
  }
`;

const SummaryDivider = styled.div`
  height: 2px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-brand-500) 12%, var(--color-border));
  margin: 0.2rem 0 0.1rem;
`;

const EmptyState = styled(PageStyles.NotFoundContainer)`
  margin-top: 0;
  padding: 1rem 0;
`;

const statusToneMap: Record<string, "default" | "warning" | "success" | "attention"> = {
  new: "default",
  needs_account: "attention",
  needs_link: "warning",
  needs_review: "warning",
  linked: "success",
  unlinked: "default",
};

const statusLabelMap: Record<string, string> = {
  new: "Нове",
  needs_account: "Очікує обробки",
  needs_link: "Потрібно зв'язати",
  needs_review: "Потрібна перевірка",
  linked: "Зв'язано",
  unlinked: "Відкріплено",
};

const sourceLabelMap: Record<string, string> = {
  xml: "XML чек",
  url: "Чек за посиланням",
  pdf: "PDF чек",
  photo: "Фото чека",
};

function formatPaymentProvider(provider?: string | null) {
  const cleanProvider = provider?.trim();
  return cleanProvider || null;
}

function shouldShowReceiptNote(note?: string | null, title?: string | null) {
  const cleanNote = note?.trim();
  if (!cleanNote) return false;

  return cleanNote.toLowerCase() !== (title?.trim().toLowerCase() || "");
}

function extractTransactionId(response: unknown): string | null {
  if (typeof response === "string") return response;
  if (!response || typeof response !== "object") return null;

  const payload = response as { id?: unknown; data?: { id?: unknown } };
  if (typeof payload.id === "string") return payload.id;
  return typeof payload.data?.id === "string" ? payload.data.id : null;
}

function InboxEntryPage() {
  const { i18n } = useTranslation();
  const { inboxId = "" } = useParams();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const [isCreateTransactionOpen, setIsCreateTransactionOpen] = useState(false);

  usePageTitle("Inbox");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["inbox", inboxId],
    queryFn: () => getInboxEntryApi(inboxId),
    enabled: Boolean(inboxId),
  });

  const items = useMemo(() => data?.receipt_source?.items ?? [], [data]);
  const occurredAt =
    data?.occurred_at ?? data?.receipt_source?.receipt_date ?? null;
  const title =
    data?.merchant || data?.receipt_source?.merchant || data?.note || "Чек";

  if (isLoading) {
    return (
      <PageStyles.PageContainer>
        <SectionCard>Завантаження деталей...</SectionCard>
      </PageStyles.PageContainer>
    );
  }

  if (isError || !data) {
    return (
      <PageStyles.PageContainer>
        {isMobile ? (
          <MobilePageHeader title="Деталі чека" />
        ) : (
          <PageStyles.BackButton as={Link} to="/inbox">
            <HiArrowLeft />
            До Inbox
          </PageStyles.BackButton>
        )}
        <SectionCard>
          <EmptyState>
            <h3>Не вдалося відкрити чек</h3>
            <p>Спробуйте оновити сторінку або поверніться до списку Inbox.</p>
          </EmptyState>
        </SectionCard>
      </PageStyles.PageContainer>
    );
  }

  const subtotal = data.receipt_source?.subtotal;
  const discountTotal = data.receipt_source?.discount_total;
  const total = data.total ?? data.receipt_source?.total ?? null;
  const paymentProvider = formatPaymentProvider(
    data.receipt_source?.payment_provider,
  );
  const paymentMask = data.receipt_source?.payment_mask?.trim() || null;
  const showReceiptNote = shouldShowReceiptNote(data.note, title);
  const canCreateTransaction = data.status !== "linked";

  return (
    <PageStyles.PageContainer style={{ paddingBottom: isMobile ? "80px" : undefined }}>
      {isMobile ? (
        <MobilePageHeader title="Деталі чека" />
      ) : (
        <PageStyles.BackButton as={Link} to="/inbox">
          <HiArrowLeft />
          До Inbox
        </PageStyles.BackButton>
      )}

      {isMobile ? (
        <PageStyles.MobileHeaderSpacer>
          <PageStyles.MobileMeta>
            <PageStyles.HeaderMetaChip>
              {sourceLabelMap[data.source_type] ?? data.source_type}
            </PageStyles.HeaderMetaChip>
            {items.length > 0 ? (
              <PageStyles.HeaderMetaChip>{items.length} позицій</PageStyles.HeaderMetaChip>
            ) : null}
          </PageStyles.MobileMeta>
        </PageStyles.MobileHeaderSpacer>
      ) : null}

      <PrimaryCard>
        <Header>
          <HeaderMain>
            <HeaderTitle>{title}</HeaderTitle>
            <HeaderSubtitle>Чек очікує підтвердження та прив&apos;язки.</HeaderSubtitle>
            <BadgeRow>
              <Badge $tone={statusToneMap[data.status] ?? "default"} $emphasis>
                {statusLabelMap[data.status] ?? data.status}
              </Badge>
              <Badge>{sourceLabelMap[data.source_type] ?? data.source_type}</Badge>
              {items.length > 0 ? <Badge>{items.length} позицій</Badge> : null}
            </BadgeRow>
          </HeaderMain>

          <Amount>
            {data.total != null
              ? formatMoney(
                  data.total,
                  data.currency || data.receipt_source?.currency || "UAH",
                  i18n.language,
                )
              : "—"}
          </Amount>
        </Header>
        <ReceiptStats>
          <ReceiptStat>
            <span className="label">Дата</span>
            <span className="value">
              <SingleLineValue>
                {occurredAt ? formatDate(occurredAt, i18n.language) : "Не визначено"}
              </SingleLineValue>
            </span>
          </ReceiptStat>
          <ReceiptStat>
            <span className="label">Оплата</span>
            <span className="value">{paymentProvider || "Не визначено"}</span>
          </ReceiptStat>
          <ReceiptStat>
            <span className="label">Чек</span>
            <span className="value">{data.receipt_source?.receipt_number || "—"}</span>
          </ReceiptStat>
          <ReceiptStat>
            <span className="label">ЕПЗ</span>
            <span className="value">
              <SingleLineValue>{paymentMask || "—"}</SingleLineValue>
            </span>
          </ReceiptStat>
        </ReceiptStats>
      </PrimaryCard>

      {canCreateTransaction ? (
        <ActionCard>
          <ActionCopy>
            <h2>Оформіть транзакцію за цим чеком</h2>
            <p>Поля чека вже будуть заповнені. Залишиться перевірити дані та обрати рахунок оплати.</p>
          </ActionCopy>
          <CreateActionButton type="button" onClick={() => setIsCreateTransactionOpen(true)}>
            Створити транзакцію
          </CreateActionButton>
        </ActionCard>
      ) : null}

      <Layout>
        <SectionCard>
          <SectionTitle>Контекст</SectionTitle>
          <MetaList>
            <MetaRow>
              <RowIcon $color="var(--color-blue-600)">
                <HiOutlineTag />
              </RowIcon>
              <RowContent>
                <span className="label">Контрагент</span>
              </RowContent>
              <RowValue>{data.receipt_source?.counterparty?.name || "Не визначено"}</RowValue>
            </MetaRow>

            <MetaRow>
              <RowIcon $color="var(--color-purple-600, var(--color-brand-600))">
                <HiOutlineSquares2X2 />
              </RowIcon>
              <RowContent>
                <span className="label">Категорія</span>
              </RowContent>
                <RowValue>{data.receipt_source?.category?.name || "Не визначено"}</RowValue>
              </MetaRow>
          </MetaList>
        </SectionCard>

        <SectionCard>
          <SectionTitle>Джерело</SectionTitle>
          <MetaList>
            <MetaRow>
              <RowIcon $color="var(--color-text-secondary)">
                <HiOutlineFolder />
              </RowIcon>
              <RowContent>
                <span className="label">Походження</span>
              </RowContent>
              <RowValue>{data.receipt_source?.origin || "—"}</RowValue>
            </MetaRow>

            <MetaRow>
              <RowIcon $color="var(--color-brand-600)">
                {data.receipt_source?.source_url ? (
                  <HiOutlineArrowTopRightOnSquare />
                ) : (
                  <HiOutlineLink />
                )}
              </RowIcon>
              <RowContent>
                <span className="label">Посилання</span>
              </RowContent>
              <RowValue>{data.receipt_source?.source_url || "—"}</RowValue>
            </MetaRow>
          </MetaList>
        </SectionCard>
      </Layout>

      {showReceiptNote ? <NoteBox>{data.note}</NoteBox> : null}

      <SectionCard>
        <SectionTitle>Деталізація чека</SectionTitle>
        {items.length === 0 ? (
          <>
            <EmptyState>
              <h3>Позиції ще не розпізнані</h3>
              <p>Для цього чека система поки не знайшла окремі товари або послуги.</p>
            </EmptyState>
            <ItemsSummary>
              {subtotal != null ? (
                <SummaryRow>
                  <span>Проміжна сума</span>
                  <span>{formatMoney(subtotal, data.currency || "UAH", i18n.language)}</span>
                </SummaryRow>
              ) : null}
              {discountTotal != null ? (
                <SummaryRow $discount>
                  <span>Знижка</span>
                  <span>-{formatMoney(discountTotal, data.currency || "UAH", i18n.language)}</span>
                </SummaryRow>
              ) : null}
              {(subtotal != null || discountTotal != null) ? <SummaryDivider /> : null}
              <SummaryRow $strong>
                <span>Разом</span>
                <span>
                  {total != null
                    ? formatMoney(total, data.currency || "UAH", i18n.language)
                    : "—"}
                </span>
              </SummaryRow>
            </ItemsSummary>
          </>
        ) : (
          <>
            <ItemsTable>
              <thead>
                <tr>
                  <th>Позиція</th>
                  <th>Кількість</th>
                  <th>Сума</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>
                      {item.quantity} ×{" "}
                      {formatMoney(
                        item.price_per_unit,
                        data.currency || "UAH",
                        i18n.language,
                      )}
                    </td>
                    <td>
                      {formatMoney(
                        item.total_amount,
                        data.currency || "UAH",
                        i18n.language,
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </ItemsTable>
            <ItemsSummary>
              {subtotal != null ? (
                <SummaryRow>
                  <span>Проміжна сума</span>
                  <span>{formatMoney(subtotal, data.currency || "UAH", i18n.language)}</span>
                </SummaryRow>
              ) : null}
              {discountTotal != null ? (
                <SummaryRow $discount>
                  <span>Знижка</span>
                  <span>-{formatMoney(discountTotal, data.currency || "UAH", i18n.language)}</span>
                </SummaryRow>
              ) : null}
              {(subtotal != null || discountTotal != null) ? <SummaryDivider /> : null}
              <SummaryRow $strong>
                <span>Разом</span>
                <span>
                  {total != null
                    ? formatMoney(total, data.currency || "UAH", i18n.language)
                    : "—"}
                </span>
              </SummaryRow>
            </ItemsSummary>
          </>
        )}
      </SectionCard>

      {isCreateTransactionOpen ? (
        <CreateTransactionModal
          isOpen
          onClose={() => setIsCreateTransactionOpen(false)}
          initialData={{
            type: "expense",
            category_id: data.receipt_source?.category?.id,
            counterparty_id: data.receipt_source?.counterparty?.id,
            amount: total ?? undefined,
            date: occurredAt ?? undefined,
            note: data.note || undefined,
            items: items.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              price_per_unit: item.price_per_unit,
              total_amount: item.total_amount,
            })),
          }}
          onSuccess={async (response) => {
            const transactionId = extractTransactionId(response);
            if (!transactionId) {
              toast.error("Транзакцію створено, але чек не вдалося прив'язати автоматично.");
              return;
            }

            try {
              await linkInboxTransactionApi(inboxId, transactionId);
              queryClient.invalidateQueries({ queryKey: ["inbox"] });
              queryClient.invalidateQueries({ queryKey: ["inbox", inboxId] });
              queryClient.invalidateQueries({ queryKey: ["inbox", "pending-count"] });
              toast.success("Чек прив'язано до транзакції");
            } catch {
              toast.error("Транзакцію створено, але чек не вдалося прив'язати. Він залишився в Inbox.");
            }
          }}
        />
      ) : null}
    </PageStyles.PageContainer>
  );
}

export default InboxEntryPage;
