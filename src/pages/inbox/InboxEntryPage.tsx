import { useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import styled from "styled-components";
import {
  HiArrowLeft,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineFolder,
  HiOutlineLink,
  HiOutlineSquares2X2,
  HiOutlineTag,
} from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

import Modal from "../../components/ui/Modal";
import ConfirmDelete from "../../components/ui/ConfirmDelete";
import MobilePageHeader from "../../components/mobile/MobilePageHeader";
import CreateTransactionModal from "../../components/transactions/CreateTransactionModal";
import { useIsMobile } from "../../hooks/useIsMobile";
import { usePageTitle } from "../../hooks/usePageTitle";
import {
  getInboxAccountCandidatesApi,
  getInboxEntryApi,
  getInboxTransactionCandidatesApi,
  linkInboxTransactionApi,
  selectInboxAccountApi,
  deleteInboxItemApi,
} from "../../services/apiInbox";
import { formatDate, formatMoney, getUploadedFileUrl } from "../../utils/helpers";
import { SmartIcon } from "../../utils/IconMap";
import { BANK_SKINS } from "../../components/accounts/bankSkins";
import * as PageStyles from "../transactions/TransactionPage.styles";
import * as DetailStyles from "../../components/transactions/TransactionDetails.styles";
import { inboxBadgeStyles } from "./inboxBadgeStyles";
import { ReceiptViewer } from "../../components/transactions/ReceiptViewer";
import { getTransactionsApi } from "../../services/apiTransactions";
import type { Transaction } from "../../types";

const Header = styled(PageStyles.Header)`
  margin-bottom: 0;
  align-items: flex-start;
`;

const HeaderMain = styled(PageStyles.HeaderMain)`
  gap: 0.65rem;
`;

const HeaderTitle = styled(PageStyles.HeaderTitle)`
  margin: 0;
  word-break: break-word;
  overflow-wrap: anywhere;

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

const Badge = styled(PageStyles.HeaderMetaChip) <{
  $tone?: "default" | "warning" | "success" | "attention";
  $emphasis?: boolean;
}>`
  ${inboxBadgeStyles}
`;

const AccountHighlightBox = styled.div<{ $color: string; $hasImage?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  padding: 2px 0 2px 14px;
  margin-left: 4px;
  border-left: 2px solid var(--color-border);
  color: var(--color-text-main);
  font-size: 0.9rem;
  font-weight: 600;

  .icon-box {
    width: 26px;
    height: 26px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${(p) => (p.$hasImage ? "transparent" : `${p.$color}15`)};
    color: ${(p) => p.$color};
    flex-shrink: 0;

    svg {
      width: 16px;
      height: 16px;
    }
  }
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

const AccountSuggestion = styled(SectionCard)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  padding: 0.8rem 0.9rem;
  border-color: color-mix(in srgb, var(--color-yellow-500) 34%, var(--color-border));
  background: color-mix(in srgb, var(--color-yellow-500) 9%, var(--color-bg-surface));

  @media (max-width: 640px) {
    align-items: stretch;
    flex-direction: column;
  }
`;

const AccountSuggestionCopy = styled.div`
  min-width: 0;

  span,
  small {
    display: block;
  }

  span {
    color: var(--color-text-secondary);
    font-size: 0.76rem;
    font-weight: 700;
  }

  strong {
    display: block;
    margin-top: 0.1rem;
    color: var(--color-text-main);
    font-size: 0.92rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  small {
    margin-top: 0.14rem;
    color: var(--color-text-secondary);
    font-size: 0.75rem;
  }
`;

const ConfirmAccountButton = styled.button`
  min-height: 36px;
  padding: 0.5rem 0.72rem;
  border: 1px solid color-mix(in srgb, var(--color-brand-500) 42%, var(--color-border));
  border-radius: 10px;
  background: var(--color-bg-surface);
  color: var(--color-brand-700);
  font-size: 0.8rem;
  font-weight: 800;
  white-space: nowrap;
  cursor: pointer;

  &:disabled {
    cursor: wait;
    opacity: 0.65;
  }
`;

const TransactionMatches = styled(SectionCard)`
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding: 0.8rem 0.9rem;
`;

const TransactionMatchesTitle = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;

  strong {
    color: var(--color-text-main);
    font-size: 0.9rem;
  }

  span {
    color: var(--color-text-secondary);
    font-size: 0.75rem;
  }
`;

const TransactionMatch = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 0.7rem;
  min-width: 0;
  padding: 0.58rem 0;
  border-top: 1px solid var(--color-border);

  @media (max-width: 640px) {
    grid-template-columns: minmax(0, 1fr) auto;
    row-gap: 0.25rem;
  }
`;

const TransactionMatchCopy = styled.div`
  min-width: 0;

  strong,
  span {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    color: var(--color-text-main);
    font-size: 0.86rem;
  }

  span {
    margin-top: 0.1rem;
    color: var(--color-text-secondary);
    font-size: 0.73rem;
  }
`;

const TransactionMatchAmount = styled.strong`
  color: var(--color-text-main);
  font-size: 0.85rem;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
`;

const LinkTransactionButton = styled.button`
  min-height: 34px;
  padding: 0.45rem 0.65rem;
  border: 1px solid color-mix(in srgb, var(--color-brand-500) 42%, var(--color-border));
  border-radius: 9px;
  background: var(--color-bg-surface);
  color: var(--color-brand-700);
  font-size: 0.76rem;
  font-weight: 800;
  white-space: nowrap;
  cursor: pointer;

  &:disabled {
    cursor: wait;
    opacity: 0.65;
  }
`;

const ShowMoreCandidatesButton = styled.button`
  align-self: flex-start;
  padding: 0.2rem 0;
  border: 0;
  background: transparent;
  color: var(--color-brand-700);
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
`;
const ManualSearch = styled.div`display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 0.45rem; padding-top: 0.4rem; border-top: 1px solid var(--color-border);`;
const ManualSearchInput = styled.input`min-width: 0; padding: 0.5rem 0.6rem; border: 1px solid var(--color-border); border-radius: 9px; background: var(--color-bg-page); color: var(--color-text-main);`;
const ReceiptPhotoButton = styled.button`padding: 0.65rem 0.8rem; border: 1px solid var(--color-brand-300); border-radius: 10px; background: var(--color-brand-50); color: var(--color-brand-700); font-weight: 800; cursor: pointer;`;

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
  grid-template-columns: 36px minmax(0, 1fr) minmax(120px, 1fr);
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

    > :first-child {
      grid-row: 1 / span 2;
    }

    > :nth-child(2) {
      grid-column: 2;
      grid-row: 1;
    }

    > :nth-child(3) {
      grid-column: 2;
      grid-row: 2;
    }
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: 640px) {
    grid-column: 2;
    grid-row: 2;
    text-align: left;
    font-size: 0.9rem;
  }
`;

const SourceLink = styled.a`
  display: block;
  min-width: 0;
  overflow: hidden;
  color: var(--color-brand-700);
  font: inherit;
  text-align: inherit;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    text-decoration: underline;
  }
`;

const ReceiptStats = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-auto-rows: 1fr;
  gap: 0.75rem;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const ReceiptStat = styled.div`
  min-width: 0;
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
  table-layout: fixed;

  th:nth-child(2),
  td:nth-child(2),
  th:nth-child(3),
  td:nth-child(3) {
    text-align: right;
    white-space: nowrap;
    width: 25%;
  }

  td:first-child {
    font-weight: 600;
    color: var(--color-text-main);
    word-break: break-word;
    overflow-wrap: anywhere;
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
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const [isCreateTransactionOpen, setIsCreateTransactionOpen] = useState(false);
  const [showLowConfidenceCandidates, setShowLowConfidenceCandidates] = useState(false);
  const [isManualSearchOpen, setIsManualSearchOpen] = useState(false);
  const [manualSearch, setManualSearch] = useState("");
  const [isReceiptViewerOpen, setIsReceiptViewerOpen] = useState(false);

  usePageTitle("Inbox");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["inbox", inboxId],
    queryFn: () => getInboxEntryApi(inboxId),
    enabled: Boolean(inboxId),
  });

  const { data: accountCandidates = [] } = useQuery({
    queryKey: ["inbox", inboxId, "account-candidates"],
    queryFn: () => getInboxAccountCandidatesApi(inboxId),
    enabled: Boolean(
      inboxId && data?.receipt_source?.payment_mask && !data.selected_account_id,
    ),
  });

  const { data: transactionCandidates = [] } = useQuery({
    queryKey: ["inbox", inboxId, "transaction-candidates"],
    queryFn: () => getInboxTransactionCandidatesApi(inboxId),
    enabled: Boolean(
      inboxId && data?.selected_account_id && data.status !== "linked",
    ),
  });
  const { data: manualSearchResponse } = useQuery({
    queryKey: ["inbox", inboxId, "manual-transactions", manualSearch],
    queryFn: () => getTransactionsApi({
      account_id: data?.selected_account_id ?? "",
      min_amount: data?.total ?? undefined,
      max_amount: data?.total ?? undefined,
      search: manualSearch,
      limit: 10,
    }) as Promise<{ data: Transaction[] }>,
    enabled: isManualSearchOpen && Boolean(data?.selected_account_id && data?.total != null),
  });

  const selectAccountMutation = useMutation({
    mutationFn: (accountId: string) => selectInboxAccountApi(inboxId, accountId),
    onSuccess: (entry) => {
      queryClient.setQueryData(["inbox", inboxId], entry);
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
      queryClient.invalidateQueries({ queryKey: ["inbox", "pending-count"] });
      toast.success("Рахунок підтверджено");
    },
    onError: () => toast.error("Не вдалося підтвердити рахунок"),
  });

  const linkCandidateMutation = useMutation({
    mutationFn: (transactionId: string) =>
      linkInboxTransactionApi(inboxId, transactionId),
    onSuccess: (entry, transactionId) => {
      queryClient.setQueryData(["inbox", inboxId], entry);
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
      queryClient.invalidateQueries({ queryKey: ["inbox", "pending-count"] });
      queryClient.invalidateQueries({
        queryKey: ["inbox", inboxId, "transaction-candidates"],
      });
      queryClient.invalidateQueries({
        queryKey: ["transaction", transactionId],
      });
      queryClient.invalidateQueries({
        queryKey: ["transaction", transactionId, "receipt-sources"],
      });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactions-infinite"] });
      toast.success("Чек зв'язано з операцією");
    },
    onError: () => toast.error("Не вдалося зв'язати чек з операцією"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteInboxItemApi(inboxId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
      queryClient.invalidateQueries({ queryKey: ["inbox", "pending-count"] });
      toast.success("Чек видалено з Inbox");
      navigate("/inbox");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || "Не вдалося видалити чек");
    }
  });

  const items = useMemo(() => data?.receipt_source?.items ?? [], [data]);
  const occurredAt =
    data?.occurred_at ?? data?.receipt_source?.receipt_date ?? null;
  const visibleTransactionCandidates = transactionCandidates.filter(
    (candidate) => showLowConfidenceCandidates || candidate.confidence !== "low",
  );
  const lowConfidenceCandidateCount = transactionCandidates.filter(
    (candidate) => candidate.confidence === "low",
  ).length;
  const title =
    data?.merchant || data?.receipt_source?.merchant || data?.note || "Чек";
  const receiptPhotoUrls = useMemo(() => {
    const source = data?.receipt_source;
    if (!source) return [];
    let paths = source.file_path ? [source.file_path] : [];
    try {
      const extra = source.file_paths ? JSON.parse(source.file_paths) : [];
      if (Array.isArray(extra)) paths = [...paths, ...extra];
    } catch { /* Legacy receipt with no photo list. */ }
    return [...new Set(paths.filter(Boolean))]
      .map((path) => getUploadedFileUrl(path))
      .filter((path): path is string => Boolean(path));
  }, [data?.receipt_source]);

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
  const paymentMask = data.receipt_source?.payment_mask?.trim()?.slice(-5) || null;
  const showReceiptNote = shouldShowReceiptNote(data.note, title);
  const canCreateTransaction = data.status !== "linked";
  const recommendedAccount = accountCandidates.find(
    (candidate) => candidate.recommended,
  );
  const selectedAccountLabel = data.selected_account
    ? `${data.selected_account.name} · ${data.selected_account.currency}`
    : null;

  let bankLogo: string | undefined;
  if (data.selected_account) {
    const skinKey =
      data.selected_account.bank_name && data.selected_account.card_type
        ? `${data.selected_account.bank_name}-${data.selected_account.card_type}`
        : data.selected_account.icon;
    const skin = BANK_SKINS[skinKey as string] || BANK_SKINS["default"];
    if (skin.miniLogoFile?.startsWith("icon_") && data.selected_account.type === "card") {
      bankLogo = skin.miniLogoFile;
    }
  }


  return (
    <>
      {isMobile ? (
        <MobilePageHeader title="Деталі чека" />
      ) : null}
      <PageStyles.PageContainer style={{ paddingBottom: isMobile ? "120px" : undefined }}>
        {!isMobile ? (
          <PageStyles.BackButton as={Link} to="/inbox">
            <HiArrowLeft />
            До Inbox
          </PageStyles.BackButton>
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
              {selectedAccountLabel && data.selected_account ? (
                <AccountHighlightBox $color={data.selected_account.color || "var(--color-brand-600)"} $hasImage={!!bankLogo}>
                  <div className="icon-box">
                    <SmartIcon
                      logo={bankLogo}
                      iconName={data.selected_account.icon || "HiCreditCard"}
                      size={bankLogo ? 28 : 16}
                      color={data.selected_account.color || "var(--color-brand-600)"}
                    />
                  </div>
                  {selectedAccountLabel}
                </AccountHighlightBox>
              ) : null}
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

        {receiptPhotoUrls.length > 0 ? (
          <ReceiptPhotoButton type="button" onClick={() => setIsReceiptViewerOpen(true)}>
            Переглянути фото чека{receiptPhotoUrls.length > 1 ? ` (${receiptPhotoUrls.length})` : ""}
          </ReceiptPhotoButton>
        ) : null}
      </PrimaryCard>

      {recommendedAccount && !data.selected_account_id ? (
        <AccountSuggestion>
          <AccountSuggestionCopy>
            <span>Ймовірний рахунок за ЕПЗ</span>
            <strong>
              {recommendedAccount.bank_name || recommendedAccount.account_name}
              {recommendedAccount.bank_name && recommendedAccount.account_name !== recommendedAccount.bank_name
                ? ` · ${recommendedAccount.account_name}`
                : ""}
              {` ·•••• ${recommendedAccount.matched_card_number}`}
            </strong>
            <small>Точний збіг 4 цифр і валюти чека</small>
          </AccountSuggestionCopy>
          <ConfirmAccountButton
            type="button"
            disabled={selectAccountMutation.isPending}
            onClick={() => selectAccountMutation.mutate(recommendedAccount.account_id)}
          >
            {selectAccountMutation.isPending ? "Збереження..." : "Підтвердити"}
          </ConfirmAccountButton>
        </AccountSuggestion>
      ) : null}

      {data.selected_account_id && transactionCandidates.length > 0 ? (
        <TransactionMatches>
          <TransactionMatchesTitle>
            <strong>Можливі банківські операції</strong>
            <span>Перевірте перед зв&apos;язуванням</span>
          </TransactionMatchesTitle>
          {visibleTransactionCandidates.slice(0, 3).map((candidate) => (
            <TransactionMatch key={candidate.transaction_id}>
              <TransactionMatchCopy>
                <strong>
                  {candidate.counterparty_name || candidate.note || "Банківська операція"}
                </strong>
                <span>
                  {new Intl.DateTimeFormat(i18n.language, {
                    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                  }).format(new Date(candidate.date))} · {candidate.matched_by.join(", ")}
                </span>
                <span>
                  {candidate.confidence === "high"
                    ? "Висока впевненість"
                    : candidate.confidence === "medium"
                      ? "Середня впевненість"
                      : "Низька впевненість"}
                  {occurredAt
                    ? ` · ${Math.round(Math.abs(candidate.date - occurredAt) / 60000)} хв від чека`
                    : ""}
                </span>
              </TransactionMatchCopy>
              <TransactionMatchAmount>
                {formatMoney(candidate.amount, candidate.currency || data.currency || "UAH", i18n.language)}
              </TransactionMatchAmount>
              <LinkTransactionButton
                type="button"
                disabled={linkCandidateMutation.isPending}
                onClick={() => linkCandidateMutation.mutate(candidate.transaction_id)}
              >
                {linkCandidateMutation.isPending ? "Зв'язування..." : "Зв'язати чек"}
              </LinkTransactionButton>
            </TransactionMatch>
          ))}
          {!showLowConfidenceCandidates && lowConfidenceCandidateCount > 0 ? (
            <ShowMoreCandidatesButton
              type="button"
              onClick={() => setShowLowConfidenceCandidates(true)}
            >
              Показати менш імовірні варіанти ({lowConfidenceCandidateCount})
            </ShowMoreCandidatesButton>
          ) : null}
        </TransactionMatches>
      ) : null}

      {data.selected_account_id && data.total != null ? (
        <TransactionMatches>
          <TransactionMatchesTitle>
            <strong>Не знайшли потрібну операцію?</strong>
            <span>Пошук серед усіх операцій з цією сумою</span>
          </TransactionMatchesTitle>
          {!isManualSearchOpen ? (
            <ShowMoreCandidatesButton type="button" onClick={() => setIsManualSearchOpen(true)}>
              Знайти іншу операцію
            </ShowMoreCandidatesButton>
          ) : (
            <>
              <ManualSearch>
                <ManualSearchInput value={manualSearch} onChange={(e) => setManualSearch(e.target.value)} placeholder="Назва, магазин або нотатка" />
                <ShowMoreCandidatesButton type="button" onClick={() => setIsManualSearchOpen(false)}>Закрити</ShowMoreCandidatesButton>
              </ManualSearch>
              {(manualSearchResponse?.data ?? []).slice(0, 5).map((transaction) => (
                <TransactionMatch key={transaction.id}>
                  <TransactionMatchCopy><strong>{transaction.counterparty?.name || transaction.note || "Операція"}</strong><span>{formatDate(transaction.date, i18n.language)}</span></TransactionMatchCopy>
                  <TransactionMatchAmount>{formatMoney(transaction.amount, transaction.currency || data.currency || "UAH", i18n.language)}</TransactionMatchAmount>
                  <LinkTransactionButton type="button" disabled={linkCandidateMutation.isPending} onClick={() => linkCandidateMutation.mutate(transaction.id)}>Зв'язати чек</LinkTransactionButton>
                </TransactionMatch>
              ))}
            </>
          )}
        </TransactionMatches>
      ) : null}

      {canCreateTransaction ? (
        <ActionCard>
          <ActionCopy>
            <h2>Оформіть транзакцію за цим чеком</h2>
            <p>
              {selectedAccountLabel
                ? `Рахунок оплати: ${selectedAccountLabel}. Дані чека вже заповнені.`
                : "Поля чека вже будуть заповнені. Залишиться перевірити дані та обрати рахунок оплати."}
            </p>
          </ActionCopy>
          <CreateActionButton type="button" onClick={() => setIsCreateTransactionOpen(true)}>
            Створити транзакцію
          </CreateActionButton>
        </ActionCard>
      ) : null}

      {canCreateTransaction ? (
        <ActionCard>
          <ActionCopy>
            <h2>Помилилися з чеком?</h2>
            <p>
              Якщо це не той чек, ви можете видалити його з Inbox. Цю дію не можна скасувати.
            </p>
          </ActionCopy>
          <Modal>
            <Modal.Open opens="delete-inbox-item">
              <CreateActionButton
                type="button"
                disabled={deleteMutation.isPending}
                style={{ backgroundColor: "var(--color-red-600)" }}
              >
                {deleteMutation.isPending ? "Видалення..." : "Видалити чек"}
              </CreateActionButton>
            </Modal.Open>
            <Modal.Window name="delete-inbox-item">
              <ConfirmDelete
                resourceName="чек"
                onConfirm={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
              />
            </Modal.Window>
          </Modal>
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
              <RowValue>
                {data.receipt_source?.source_url ? (
                  <SourceLink
                    href={data.receipt_source.source_url}
                    target="_blank"
                    rel="noreferrer"
                    title={data.receipt_source.source_url}
                  >
                    {data.receipt_source.source_url}
                  </SourceLink>
                ) : (
                  "—"
                )}
              </RowValue>
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
            account_id: data.selected_account_id || undefined,
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
              category_id: item.category_id,
            })),
          }}
          onSuccess={async (response) => {
            const transactionId = extractTransactionId(response);
            if (!transactionId) {
              toast.error("Транзакцію створено, але чек не вдалося прив'язати автоматично.");
              return;
            }

            try {
              await linkInboxTransactionApi(inboxId, transactionId, {
                applyItems: false,
                learnFromTransaction: true,
              });
              queryClient.invalidateQueries({ queryKey: ["inbox"] });
              queryClient.invalidateQueries({ queryKey: ["inbox", inboxId] });
              queryClient.invalidateQueries({ queryKey: ["inbox", "pending-count"] });
              queryClient.invalidateQueries({
                queryKey: ["transaction", transactionId],
              });
              queryClient.invalidateQueries({
                queryKey: ["transaction", transactionId, "receipt-sources"],
              });
              queryClient.invalidateQueries({ queryKey: ["transactions"] });
              queryClient.invalidateQueries({ queryKey: ["transactions-infinite"] });
              toast.success("Чек прив'язано до транзакції");
            } catch {
              toast.error("Транзакцію створено, але чек не вдалося прив'язати. Він залишився в Inbox.");
            }
          }}
        />
      ) : null}
      {isReceiptViewerOpen ? (
        <div style={{ position: "fixed", inset: 0, zIndex: 12000 }}>
          <ReceiptViewer imageUrls={receiptPhotoUrls} onClose={() => setIsReceiptViewerOpen(false)} />
        </div>
      ) : null}
    </PageStyles.PageContainer>
    </>
  );
}

export default InboxEntryPage;
