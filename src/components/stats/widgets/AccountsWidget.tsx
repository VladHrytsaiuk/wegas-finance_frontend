import { HiArrowLongRight } from "react-icons/hi2";

// Components
import Spinner from "../../ui/Spinner";

// Styles & Logic
import * as S from "./AccountsWidget.styles";
import { useAccountsWidget } from "../../../hooks/Stats/useAccountsWidget";
import { formatMoney } from "../../../utils/helpers";
import { SmartIcon } from "../../../utils/IconMap";

export const AccountsWidget = () => {
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
          <S.Title>{t("dashboard.total_balance")}</S.Title>
          <S.ViewAllLink onClick={handleNavigateToAll}>
            {t("dashboard.view_all")} <HiArrowLongRight />
          </S.ViewAllLink>
        </S.TitleGroup>
      </S.Header>

      {isLoading ? (
        <Spinner />
      ) : (
        <S.ScrollArea>
          <S.List>
            {accounts.map((acc: any) => {
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
                        ? t("accountForm.type_card")
                        : acc.type === "cash"
                          ? t("accountForm.type_cash")
                          : t("accountForm.type_savings")}
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
};
