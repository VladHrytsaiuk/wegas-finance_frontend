import React from "react";
import { HiArrowLongRight, HiCreditCard } from "react-icons/hi2";

// Components
import { CenteredSpinner } from "../../ui/CenteredSpinner";
import { EmptyState } from "../../ui/EmptyState";

// Styles & Logic
import * as S from "./AccountsWidget.styles";
import { useAccountsWidget } from "../../../hooks/Stats/useAccountsWidget";
import { formatMoney } from "../../../utils/helpers";
import { SmartIcon } from "../../../utils/IconMap";
import type { Account } from "../../../services/apiAccounts";

type WidgetAccount = Account & {
  displayIcon?: string;
};

export const AccountsWidget = React.memo(() => {
  const {
    accounts,
    isLoading,
    currency,
    language,
    t,
    actions: { handleNavigateToAll, handleNavigateToDetails },
  } = useAccountsWidget();

  return (
    <S.Card>
      <S.Header>
        <S.TitleGroup>
          <S.Title>{t("dashboard:dashboard.total_balance")}</S.Title>
          <S.ViewAllLink onClick={handleNavigateToAll}>
            {t("dashboard:dashboard.view_all")} <HiArrowLongRight />
          </S.ViewAllLink>
        </S.TitleGroup>
      </S.Header>

      {isLoading ? (
        <CenteredSpinner isContainer />
      ) : accounts.length === 0 ? (
        <EmptyState
          compact
          icon={<HiCreditCard />}
          title={t("accounts:accountsPage.status_empty")}
        />
      ) : (
        <S.ScrollArea>
          <S.List>
            {accounts.map((acc: WidgetAccount) => {
              const isBankLogo = acc.displayIcon?.startsWith("icon_");
              return (
                <S.Item
                  key={acc.id}
                  onClick={() => handleNavigateToDetails(acc.id)}
                >
                  <S.IconBox $color={acc.color} $hasImage={isBankLogo}>
                    <SmartIcon
                      logo={isBankLogo ? acc.displayIcon : undefined}
                      iconName={
                        !isBankLogo
                          ? acc.displayIcon ||
                            (acc.type === "cash"
                              ? "HiBanknotes"
                              : "HiArchiveBox")
                          : undefined
                      }
                      color={acc.color}
                      size={isBankLogo ? 40 : 20} // У віджеті можна трохи більші лого
                    />
                  </S.IconBox>

                  <S.Info>
                    <S.Name>{acc.name}</S.Name>
                    <S.TypeText>
                      {acc.type === "card"
                        ? t("accounts:accountForm.type_card")
                        : acc.type === "cash"
                          ? t("accounts:accountForm.type_cash")
                          : t("accounts:accountForm.type_savings")}
                    </S.TypeText>
                  </S.Info>

                  <S.Amount $amount={acc.balance}>
                    {formatMoney(
                      acc.balance,
                      acc.currency || currency,
                      language,
                    )}
                  </S.Amount>
                </S.Item>
              );
            })}
          </S.List>
        </S.ScrollArea>
      )}
    </S.Card>
  );
});
