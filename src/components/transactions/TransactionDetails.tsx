import { useState, useEffect } from "react";
import { format } from "date-fns";
import { uk, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import {
  HiUserCircle,
  HiTrash,
  HiTag,
  HiArrowsRightLeft,
  HiArrowLongRight,
} from "react-icons/hi2";

import { CategoryIcon, SmartIcon } from "../../utils/IconMap";
import { formatMoney } from "../../utils/helpers";
import Modal from "../ui/Modal";
import { ReceiptViewer } from "./ReceiptViewer";
import { DeleteReceiptDialog } from "../ui/DeleteReceiptDialog";

import { useTransactionDetails } from "../../hooks/Transactions/useTransactionDetails";
import * as S from "./TransactionDetails.styles";

interface TransactionDetailsProps {
  transaction: any;
  categories: any[];
  accounts: any[];
  counterparties?: any[];
}

function TransactionDetails({
  transaction,
  categories,
  accounts,
  hasCounterparty,
  counterparties = [],
}: TransactionDetailsProps) {
  const { t } = useTranslation();
  const { state, actions } = useTransactionDetails({
    transaction,
    categories,
    accounts,
    counterparties,
  });

  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [transaction?.id, state.counterparty?.id]);

  // Шлях до зображень
  const getLogoUrl = (filename: string) => {
    if (!filename) return "";
    if (filename.startsWith("http")) return filename;
    return `/brands/${filename}`;
  };

  const {
    account,
    category,
    counterparty,
    config,
    rawType,
    isTransfer,
    isDebt,
    isMultiCurrency,
    myCurrency,
    partnerCurrency,
    amountMain,
    amountSecondary,
    partnerAccountName,
    exchangeRate,
    allReceiptUrls,
    hasImages,
    isDeleting,
  } = state;

  const currentLocale = state.locale === "uk" ? uk : enUS;

  // Визначаємо, чи показувати логотип
  const shouldShowLogo = counterparty?.logo && !imgError;

  return (
    <S.Container>
      <S.Layout $hasImage={hasImages}>
        {/* --- LEFT COLUMN: IMAGES --- */}
        {hasImages && (
          <S.ImageSide>
            <S.ViewerWrapper>
              <ReceiptViewer
                imageUrls={allReceiptUrls}
                onClose={() => {}}
                onIndexChange={actions.setPhotoIndex}
              />
            </S.ViewerWrapper>
            <Modal>
              <Modal.Open opens="del-photo">
                <S.DeleteOverlayButton disabled={isDeleting}>
                  <HiTrash size={20} />
                </S.DeleteOverlayButton>
              </Modal.Open>
              <Modal.Window name="del-photo">
                <DeleteReceiptDialog
                  onDeleteCurrent={actions.handleDeleteCurrent}
                  onDeleteAll={actions.handleDeleteAll}
                  isDeleting={isDeleting}
                  isSinglePhoto={allReceiptUrls.length === 1}
                />
              </Modal.Window>
            </Modal>
          </S.ImageSide>
        )}

        {/* --- RIGHT COLUMN: DETAILS --- */}
        <S.ContentSide>
          <S.Header>
            <S.TypeBadge
              style={{
                color: config.color,
                background: `color-mix(in srgb, ${config.color}, transparent 90%)`,
                borderColor: `color-mix(in srgb, ${config.color}, transparent 80%)`,
              }}
            >
              {config.label}
            </S.TypeBadge>

            {!isMultiCurrency && (
              <S.AmountDisplay $type={rawType} style={{ color: config.color }}>
                {config.sign}
                {formatMoney(
                  Math.abs(transaction.amount),
                  myCurrency,
                  state.language,
                )}
              </S.AmountDisplay>
            )}

            <S.DateText>
              {format(new Date(transaction.date), "dd MMMM yyyy, HH:mm", {
                locale: currentLocale,
              })}
            </S.DateText>
          </S.Header>
          <S.Section>
            {/* MULTI-CURRENCY BLOCK */}
            {isMultiCurrency && (
              <S.ExchangeContainer>
                <S.ExchangeRow>
                  <S.ExchangeBox
                    className="out"
                    $isCurrent={
                      account.currency ===
                      (rawType === "transfer_in" ? partnerCurrency : myCurrency)
                    }
                  >
                    <div className="label">
                      {rawType === "transfer_in"
                        ? t("common.sender")
                        : t("common.you")}
                      {account.currency ===
                        (rawType === "transfer_in"
                          ? partnerCurrency
                          : myCurrency) && (
                        <span
                          style={{
                            color: "var(--color-brand-600)",
                            background: "var(--color-brand-50)",
                            padding: "1px 4px",
                            borderRadius: 4,
                            fontSize: "0.65rem",
                          }}
                        >
                          {t("common.current")}
                        </span>
                      )}
                    </div>
                    <span className="val">
                      -{" "}
                      {formatMoney(
                        rawType === "transfer_in"
                          ? amountSecondary
                          : amountMain,
                        rawType === "transfer_in"
                          ? partnerCurrency
                          : myCurrency,
                        state.language,
                      )}
                    </span>
                  </S.ExchangeBox>

                  <HiArrowLongRight
                    size={24}
                    color="var(--color-text-tertiary)"
                  />

                  <S.ExchangeBox
                    className="in"
                    $isCurrent={
                      account.currency ===
                      (rawType === "transfer_in" ? myCurrency : partnerCurrency)
                    }
                  >
                    <div className="label">
                      {rawType === "transfer_in"
                        ? t("common.you")
                        : t("common.recipient")}
                      {account.currency ===
                        (rawType === "transfer_in"
                          ? myCurrency
                          : partnerCurrency) && (
                        <span
                          style={{
                            color: "var(--color-brand-600)",
                            background: "var(--color-brand-50)",
                            padding: "1px 4px",
                            borderRadius: 4,
                            fontSize: "0.65rem",
                          }}
                        >
                          {t("common.current")}
                        </span>
                      )}
                    </div>
                    <span className="val">
                      +{" "}
                      {formatMoney(
                        rawType === "transfer_in"
                          ? amountMain
                          : amountSecondary,
                        rawType === "transfer_in"
                          ? myCurrency
                          : partnerCurrency,
                        state.language,
                      )}
                    </span>
                  </S.ExchangeBox>
                </S.ExchangeRow>

                {exchangeRate && (
                  <S.ExchangeRateBadge>
                    <HiArrowsRightLeft size={14} />1{" "}
                    {rawType === "transfer_in" ? partnerCurrency : myCurrency} ≈{" "}
                    {exchangeRate}{" "}
                    {rawType === "transfer_in" ? myCurrency : partnerCurrency}
                  </S.ExchangeRateBadge>
                )}
              </S.ExchangeContainer>
            )}

            {/* DETAILS LIST */}
            <S.DetailsList>
              {/* Знайди блок відображення рахунку (account) у DetailsList */}
              <S.DetailRow>
                <S.RowIcon
                  $color={account?.color}
                  // 🔥 Додаємо пропс для прибирання фону, якщо це логотип банку
                  $hasImage={account?.displayIcon?.startsWith("icon_")}
                >
                  <SmartIcon
                    // Якщо починається на icon_ — це логотип
                    logo={
                      account?.displayIcon?.startsWith("icon_")
                        ? account.displayIcon
                        : undefined
                    }
                    // Інакше — звичайна іконка
                    iconName={
                      !account?.displayIcon?.startsWith("icon_")
                        ? account?.displayIcon || "HiCreditCard"
                        : undefined
                    }
                    color={account?.color}
                    size={account?.displayIcon?.startsWith("icon_") ? 32 : 20}
                  />
                </S.RowIcon>
                <S.RowContent>
                  <div className="label">{t("common.account")}</div>
                  <div className="value">
                    {account?.name || t("common.deleted_account")}
                  </div>
                </S.RowContent>
              </S.DetailRow>

              {isDebt ? (
                <S.DetailRow>
                  <S.RowIcon $color="var(--color-yellow-600)">
                    <SmartIcon name={counterparty?.icon || "HiUser"} />
                  </S.RowIcon>
                  <S.RowContent>
                    <div className="label">
                      {t("transactions.counterparty")}
                    </div>
                    <div className="value">
                      {counterparty?.name || t("shared.not_found")}
                    </div>
                    <div className="sub-value">
                      {t("transactions.debt_person")}
                    </div>
                  </S.RowContent>
                </S.DetailRow>
              ) : isTransfer ? (
                <S.DetailRow>
                  <S.RowIcon $color="var(--color-transfer-out)">
                    <HiArrowsRightLeft />
                  </S.RowIcon>
                  <S.RowContent>
                    <div className="label">
                      {rawType === "transfer_in"
                        ? t("common.received_from")
                        : t("common.transferred_to")}
                    </div>
                    <div className="value">
                      {partnerAccountName || t("common.deleted_account")}
                    </div>
                  </S.RowContent>
                </S.DetailRow>
              ) : (
                <>
                  {/* --- ПРОДАВЕЦЬ (MERCHANT) --- */}
                  <S.DetailRow>
                    <S.RowIcon
                      $color={
                        hasCounterparty
                          ? "var(--color-yellow-600)"
                          : "var(--color-grey-100)"
                      }
                      $hasImage={shouldShowLogo}
                    >
                      {shouldShowLogo ? (
                        <img
                          src={getLogoUrl(counterparty.logo)}
                          alt={counterparty.name}
                        />
                      ) : (
                        <SmartIcon
                          // Якщо немає в базі — ставимо нейтральну іконку (наприклад, будівлю)
                          name={
                            hasCounterparty
                              ? counterparty?.icon || "HiUser"
                              : "HiOutlineBuildingStorefront"
                          }
                        />
                      )}
                    </S.RowIcon>
                    <S.RowContent>
                      <div className="label">
                        {t("transactions.counterparty")}
                      </div>
                      <div className="value">
                        {/* 🟢 ТУТ ЗМІНА: Тільки реальний контрагент або "Не вказано" */}
                        {counterparty?.name || (
                          <span
                            style={{
                              color: "var(--color-text-tertiary)",
                              fontStyle: "italic",
                            }}
                          >
                            {t("shared.not_specified")}
                          </span>
                        )}
                      </div>

                      {/* 🟢 НОВИЙ БЛОК: Показуємо "сирі" дані банку окремо, якщо немає контрагента */}
                      {!hasCounterparty && transaction.note && (
                        <div className="sub-value" style={{ marginTop: "4px" }}>
                          <span style={{ opacity: 0.7 }}>
                            {t("transactions.bank_description")}:
                          </span>{" "}
                          {transaction.note}
                        </div>
                      )}
                    </S.RowContent>
                  </S.DetailRow>

                  {/* --- КАТЕГОРІЯ (CATEGORY) --- */}
                  <S.DetailRow>
                    <S.RowIcon $color={category?.color || "#123123"}>
                      <CategoryIcon name={category?.icon || "HiTag"} />
                    </S.RowIcon>
                    <S.RowContent>
                      <div className="label">{t("common.category")}</div>
                      <div className="value">
                        {category?.name ||
                          t("transactionsTable.default_category")}
                      </div>
                    </S.RowContent>
                  </S.DetailRow>
                </>
              )}
            </S.DetailsList>

            {/* --- ТЕГИ --- */}
            {transaction.tags && transaction.tags.length > 0 && (
              <S.TagsWrapper>
                {transaction.tags
                  .filter((tag: any) => tag && tag.id && tag.name)
                  .map((tag: any) => (
                    <S.TagChip key={tag.id} $color={tag.color}>
                      <HiTag size={12} />
                      {tag.name}
                    </S.TagChip>
                  ))}
              </S.TagsWrapper>
            )}

            {/* --- NOTE --- */}
            {transaction.note && <S.NoteBox>{transaction.note}</S.NoteBox>}

            {/* --- CREATED BY --- */}
            {transaction.user && (
              <S.UserInfo>
                <span>{t("transactionDetails.created_by")}</span>
                <S.UserName>
                  {transaction.user.avatar_url ? (
                    <img
                      src={transaction.user.avatar_url}
                      style={{ width: 24, height: 24 }}
                      alt=""
                    />
                  ) : (
                    <HiUserCircle size={24} />
                  )}
                  {transaction.user.name}
                </S.UserName>
              </S.UserInfo>
            )}
          </S.Section>
          {/* --- ITEMS TABLE --- */}
          {transaction.items && transaction.items.length > 0 && (
            <S.Section>
              <S.SectionTitle>
                {t("transactionDetails.section_items_title", {
                  count: transaction.items.length,
                })}
              </S.SectionTitle>
              <S.ItemsTable>
                <thead>
                  <tr>
                    <th>{t("transactionDetails.items_header_name")}</th>
                    <th style={{ textAlign: "right" }}>
                      {t("transactionDetails.items_header_amount")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transaction.items.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{item.name}</div>
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 600 }}>
                        {formatMoney(
                          item.quantity * item.price_per_unit,
                          myCurrency,
                          state.language,
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </S.ItemsTable>
            </S.Section>
          )}
        </S.ContentSide>
      </S.Layout>
    </S.Container>
  );
}

export default TransactionDetails;
