import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import styled from "styled-components";
import {
  HiOutlineArrowTopRightOnSquare,
  HiOutlineBanknotes,
  HiOutlineClock,
  HiOutlineDocumentText,
} from "react-icons/hi2";
import { useTranslation } from "react-i18next";

import MobilePageHeader from "../../components/mobile/MobilePageHeader";
import { useIsMobile } from "../../hooks/useIsMobile";
import { usePageTitle } from "../../hooks/usePageTitle";
import { getInboxApi, type InboxEntry } from "../../services/apiInbox";
import { formatDate, formatMoney } from "../../utils/helpers";
import { inboxBadgeStyles } from "./inboxBadgeStyles";

const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.5rem;

  @media (max-width: 768px) {
    padding: 1rem;
    padding-bottom: 6rem;
  }
`;

const IntroCard = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.9rem 1rem;
  padding: 0.9rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 18px;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--color-brand-500) 8%, var(--color-bg-surface)) 0%,
    var(--color-bg-surface) 100%
  );
  box-shadow: var(--shadow-sm);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    align-items: stretch;
    padding: 0.85rem 0.9rem;
  }
`;

const IntroMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const SummaryRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.55rem;

  @media (max-width: 768px) {
    justify-content: flex-start;
  }
`;

const SummaryPill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.48rem 0.78rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-brand-500) 8%, var(--color-bg-page));
  color: var(--color-text-main);
  font-size: 0.82rem;
  font-weight: 700;
  border: 1px solid color-mix(in srgb, var(--color-brand-500) 12%, var(--color-border));
`;

const IntroEyebrow = styled.span`
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-brand-700);
`;

const IntroTitle = styled.h1`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--color-text-main);

  @media (max-width: 768px) {
    font-size: 1.05rem;
  }
`;

const IntroText = styled.p`
  margin: 0;
  color: var(--color-text-secondary);
  line-height: 1.4;
  font-size: 0.92rem;
`;

const Feed = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
`;

const MessageCard = styled.article`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.95rem 1rem;
  border: 1px solid color-mix(in srgb, var(--color-border) 84%, transparent);
  border-radius: 18px;
  background: var(--color-bg-surface);
  box-shadow: var(--shadow-sm);
`;

const MessageLink = styled(Link)`
  color: inherit;
  text-decoration: none;
`;

const MessageHead = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.7rem;
`;

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 0;
`;

const Merchant = styled.h2`
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text-main);
  word-break: break-word;
`;

const MetaLine = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;

  @media (max-width: 640px) {
    gap: 0.38rem;
  }
`;

const Badge = styled.span<{ $tone?: "default" | "warning" | "success" | "attention"; $emphasis?: boolean }>`
  ${inboxBadgeStyles}
`;

const Amount = styled.div`
  flex-shrink: 0;
  text-align: right;
  font-size: 1rem;
  font-weight: 800;
  color: var(--color-text-main);
`;

const ContextGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.7rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const InfoChip = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 0;
  padding: 0.75rem 0.85rem;
  border-radius: 16px;
  background: var(--color-bg-page);
  color: var(--color-text-secondary);
  overflow: hidden;

  @media (max-width: 640px) {
    padding: 0.68rem 0.78rem;
  }
`;

const InfoIcon = styled.span`
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
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

const InfoText = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: 640px) {
    font-size: 0.9rem;
  }
`;

const ItemsPreview = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding-top: 0.1rem;
`;

const PreviewRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  font-size: 0.94rem;

  @media (max-width: 640px) {
    gap: 0.55rem;
    font-size: 0.88rem;
  }
`;

const ItemName = styled.span`
  min-width: 0;
  color: var(--color-text-main);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ItemMeta = styled.span`
  flex-shrink: 0;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
`;

const StateCard = styled.div`
  padding: 1.2rem;
  border: 1px solid var(--color-border);
  border-radius: 20px;
  background: var(--color-bg-surface);
  color: var(--color-text-secondary);
  text-align: center;
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

function buildTitle(entry: InboxEntry) {
  return (
    entry.merchant ||
    entry.receipt_source?.merchant ||
    entry.note ||
    "Новий чек"
  );
}

function buildItemsPreview(entry: InboxEntry) {
  return entry.receipt_source?.items?.slice(0, 3) ?? [];
}

function shouldShowNote(entry: InboxEntry) {
  const note = entry.note?.trim();
  if (!note) return false;

  const title = buildTitle(entry).trim().toLowerCase();
  return note.toLowerCase() !== title;
}

function Inbox() {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  usePageTitle(t("navigation:general.inbox", "Inbox"));

  const { data, isLoading, isError } = useQuery({
    queryKey: ["inbox"],
    queryFn: () => getInboxApi(),
  });

  const entries = useMemo(() => data?.data ?? [], [data]);
  const needsAccountCount = entries.filter((entry) => entry.status === "needs_account").length;
  const needsReviewCount = entries.filter((entry) => entry.status === "needs_review").length;

  return (
    <Page>
      {isMobile ? (
        <MobilePageHeader title={t("navigation:general.inbox", "Inbox")} />
      ) : null}

      <IntroCard>
        <IntroMain>
          {!isMobile ? <IntroEyebrow>Inbox</IntroEyebrow> : null}
          <IntroTitle>{t("navigation:general.inbox", "Вхідні чеки")}</IntroTitle>
          <IntroText>Чеки та імпорти, які ще треба підтвердити або дозаповнити.</IntroText>
        </IntroMain>
        {!isLoading && !isError ? (
          <SummaryRow>
            {needsAccountCount > 0 ? <SummaryPill>{needsAccountCount} без рахунку</SummaryPill> : null}
            {needsReviewCount > 0 ? <SummaryPill>{needsReviewCount} на перевірці</SummaryPill> : null}
            {needsAccountCount === 0 && needsReviewCount === 0 ? (
              <SummaryPill>{entries.length} чеків готові до зв&apos;язування</SummaryPill>
            ) : null}
          </SummaryRow>
        ) : null}
      </IntroCard>

      {isLoading ? (
        <StateCard>Завантаження вхідних...</StateCard>
      ) : isError ? (
        <StateCard>Не вдалося завантажити Inbox.</StateCard>
      ) : entries.length === 0 ? (
        <StateCard>Поки що тут порожньо.</StateCard>
      ) : (
        <Feed>
          {entries.map((entry) => {
            const items = buildItemsPreview(entry);
            const itemCount = entry.receipt_source?.items?.length ?? 0;
            const occurredAt =
              entry.occurred_at ?? entry.receipt_source?.receipt_date ?? null;

            return (
              <MessageLink key={entry.id} to={`/inbox/${entry.id}`}>
                <MessageCard>
                  <MessageHead>
                    <TitleBlock>
                      <Merchant>{buildTitle(entry)}</Merchant>
                      <MetaLine>
                        <Badge $tone={statusToneMap[entry.status] ?? "default"} $emphasis>
                          {statusLabelMap[entry.status] ?? entry.status}
                        </Badge>
                        <Badge>{sourceLabelMap[entry.source_type] ?? entry.source_type}</Badge>
                        {itemCount > 0 ? <Badge>{itemCount} позицій</Badge> : null}
                      </MetaLine>
                    </TitleBlock>

                    <Amount>
                      {entry.total != null
                        ? formatMoney(
                            entry.total,
                            entry.currency || entry.receipt_source?.currency || "UAH",
                            i18n.language,
                          )
                        : "—"}
                    </Amount>
                  </MessageHead>

                  <ContextGrid>
                    <InfoChip>
                      <InfoIcon>
                        <HiOutlineClock />
                      </InfoIcon>
                      <InfoText>
                        {occurredAt
                          ? formatDate(occurredAt, i18n.language)
                          : "Дата ще не визначена"}
                      </InfoText>
                    </InfoChip>

                    <InfoChip>
                      <InfoIcon>
                        <HiOutlineBanknotes />
                      </InfoIcon>
                      <InfoText>
                        {entry.selected_account?.name || "Рахунок не обрано"}
                      </InfoText>
                    </InfoChip>

                    {entry.receipt_source?.source_url ? (
                      <InfoChip>
                        <InfoIcon>
                          <HiOutlineArrowTopRightOnSquare />
                        </InfoIcon>
                        <InfoText>Є посилання на чек</InfoText>
                      </InfoChip>
                    ) : null}
                  </ContextGrid>

                  {shouldShowNote(entry) ? (
                    <InfoChip>
                      <InfoIcon>
                        <HiOutlineDocumentText />
                      </InfoIcon>
                      <InfoText>{entry.note}</InfoText>
                    </InfoChip>
                  ) : null}

                  {items.length > 0 ? (
                    <ItemsPreview>
                      {items.map((item) => (
                        <PreviewRow key={item.id}>
                          <ItemName>{item.name}</ItemName>
                          <ItemMeta>
                            {item.quantity}x {formatMoney(item.total_amount, entry.currency || "UAH", i18n.language)}
                          </ItemMeta>
                        </PreviewRow>
                      ))}
                      {itemCount > items.length ? (
                        <PreviewRow>
                          <ItemName>Ще {itemCount - items.length} позицій...</ItemName>
                          <ItemMeta />
                        </PreviewRow>
                      ) : null}
                    </ItemsPreview>
                  ) : null}
                </MessageCard>
              </MessageLink>
            );
          })}
        </Feed>
      )}
    </Page>
  );
}

export default Inbox;
