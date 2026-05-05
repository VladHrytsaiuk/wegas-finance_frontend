import {
  HiUser,
  HiArchiveBox,
  HiEnvelope,
  HiLockClosed,
  HiBeaker,
  HiBanknotes,
  HiArrowPath,
} from "react-icons/hi2";
import { useTranslation } from "react-i18next"; // Додаємо хук перекладу
import { formatMoney } from "../../utils/helpers";
import * as S from "./AccountCard.styles";
import { BankLogo, PaymentSystemLogo } from "./form/CardStyles";

interface AccountCardProps {
  account: any;
  skin: any;
}

export const AccountCard = ({ account, skin }: AccountCardProps) => {
  const { t } = useTranslation();

  // Helper для іконок
  const renderIcon = (iconType: string) => {
    switch (iconType) {
      case "envelope":
        return <HiEnvelope size={18} />;
      case "safe":
        return <HiLockClosed size={18} />;
      case "jar":
        return <HiBeaker size={18} />;
      case "cash":
        return <HiBanknotes size={18} />;
      default:
        return <HiArchiveBox size={18} />;
    }
  };

  // Helper для назви типу (якщо в skin.label пусто)
  const getTypeName = (iconType: string) => {
    // Якщо skin.label вже переданий з хука useAccountsGrid - використовуємо його
    if (skin.label) return skin.label;

    // Інакше фолбек
    switch (iconType) {
      case "envelope":
        return t("accounts:accountTypes.envelope", "Конверт");
      case "safe":
        return t("accounts:accountTypes.safe", "Сейф");
      case "jar":
        return t("accounts:accountTypes.jar", "Банка");
      case "cash":
        return t("accounts:accountsTable.type_cash");
      default:
        return t("accounts:accountsTable.type_savings");
    }
  };

  // --- ВАРІАНТ 1: БАНКІВСЬКА КАРТКА ---
  if (account.type === "card") {
    // Перевірка на ПриватБанк для шуму
    const isPrivat = skin.bankId === "privat";

    return (
      <S.CreditCardContainer
        $bg={skin.bg}
        $color={skin.color}
        $border={skin.border}
        $isPrivat={isPrivat}
      >
        <S.CardHeader>
          {/* 🔥 Групуємо Лого і Бейдж ЗЛІВА. Правий кут вільний для кнопок. */}
          <S.HeaderLeftGroup>
            <BankLogo skin={skin} />

            {account.is_synced && (
              <S.SyncBadge
                $variant="card"
                title={t("common:common.synced", "Синхронізовано")}
              >
                <HiArrowPath size={14} />
              </S.SyncBadge>
            )}
          </S.HeaderLeftGroup>
        </S.CardHeader>

        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <S.CardChip />
          <S.CardNumber>
            <span
              style={{
                fontSize: "1.4rem",
                letterSpacing: "-2px",
                lineHeight: 0.5,
                marginTop: "-10px",
                display: "inline-block",
                marginRight: "6px",
              }}
            >
              •••• •••• ••••{" "}
            </span>
            <span style={{ fontSize: "1.1rem", letterSpacing: "2px" }}>
              {account.card_number ? account.card_number.slice(-4) : "0000"}
            </span>
          </S.CardNumber>

          <S.CardName>{account.name}</S.CardName>

          {account.owner_name && (
            <S.CardOwner>
              <HiUser size={10} style={{ opacity: 0.7 }} />
              {account.owner_name}
            </S.CardOwner>
          )}
        </div>

        <S.CardFooter>
          <S.CardBalance>
            {formatMoney(
              account.balance || account.calculated_balance || 0,
              account.currency,
            )}
          </S.CardBalance>

          <div
            style={{
              position: "absolute",
              bottom: "0rem",
              right: "0rem",
              opacity: 0.8,
            }}
          >
            <PaymentSystemLogo
              system={account.payment_system || "mastercard"}
              color={skin.color}
            />
          </div>
        </S.CardFooter>
      </S.CreditCardContainer>
    );
  }

  // --- ВАРІАНТ 2: ГОТІВКА ТА СКАРБНИЧКИ ---
  return (
    <S.CashCardStyled $color={skin.bg}>
      {/* 🔥 НОВИЙ ХЕДЕР: Назва зверху, під нею Тип */}
      <S.CashCardHeader>
        <S.CashName title={account.name}>{account.name}</S.CashName>

        {/* Показуємо іконку + підпис, якщо це не проста готівка або якщо хочемо показати "Готівка" */}
        <S.TypeBadge>
          {renderIcon(skin.iconType)}
          <span>{getTypeName(skin.iconType)}</span>
        </S.TypeBadge>
      </S.CashCardHeader>

      <div style={{ marginTop: "auto" }}>
        <S.CardBalance
          style={{ color: "var(--color-text-main)", fontSize: "1.3rem" }}
        >
          {formatMoney(
            account.balance || account.calculated_balance || 0,
            account.currency,
          )}
        </S.CardBalance>

        {account.owner_name && (
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--color-text-tertiary)",
              marginTop: "0.4rem",
              display: "flex",
              gap: "0.4rem",
              alignItems: "center",
            }}
          >
            <HiUser /> {account.owner_name}
          </div>
        )}
      </div>
    </S.CashCardStyled>
  );
};
