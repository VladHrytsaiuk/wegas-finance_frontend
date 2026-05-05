import { memo } from "react";
import { useTransactionItem } from "../../hooks/Transactions/useTransactionItem";
import { TransactionIcon } from "./TransactionIcon";
import * as S from "./TransactionItem.styles";

interface TransactionItemProps {
  transaction: any;
  categories: any[];
  accounts: any[];
  currency: string;
  language: string;
  onClick?: () => void;
  isWidget?: boolean;
  hideAccountColumn?: boolean;
}

export const TransactionItem = memo(
  ({
    transaction,
    categories,
    accounts,
    currency,
    language,
    onClick,
    isWidget = false,
    hideAccountColumn = false,
  }: TransactionItemProps) => {
    const data = useTransactionItem({
      transaction,
      categories,
      accounts,
      baseCurrency: currency,
      language,
    });
    console.log("ITEM DATA:", data.accountName, data.isAccountDeleted);

    return (
      <S.StyledItem
        onClick={onClick}
        $isWidget={isWidget}
        $hideAccount={hideAccountColumn}
      >
        <S.MainSection>
          <TransactionIcon
            logoUrl={data.logoUrl}
            iconName={data.iconName}
            color={data.color}
            isTransfer={data.isTransfer}
            size={isWidget ? 36 : 40}
          />

          <S.TextStack>
            <S.Title>{data.title}</S.Title>
            <S.Subtitle>
              <S.Time>{data.timeFormatted}</S.Time>
              {data.subtitle && (
                <>
                  <span className="dot">•</span>
                  {data.subtitle}
                </>
              )}
            </S.Subtitle>
          </S.TextStack>
        </S.MainSection>

        {!isWidget && !hideAccountColumn && (
          // 🔥 ТУТ ВАЖЛИВО: передаємо $isDeleted
          <S.TableCol className="acc-col" $isDeleted={data.isAccountDeleted}>
            {data.accountName}
          </S.TableCol>
        )}

        {!isWidget && (
          <S.TableCol className="note-col">
            {data.note ? (
              <S.Note title={data.note}>{data.note}</S.Note>
            ) : (
              <span style={{ opacity: 0.2 }}>—</span>
            )}
          </S.TableCol>
        )}

        <S.Amount $color={data.amountColor} $isForgiveness={data.isForgiveness}>
          {data.amountFormatted}
        </S.Amount>
      </S.StyledItem>
    );
  },
);

TransactionItem.displayName = "TransactionItem";
