import { HiOutlineBanknotes, HiArrowLongRight } from "react-icons/hi2";

// Components
import { WidgetControls } from "./WidgetControls";
import Spinner from "../../ui/Spinner";
import { CenteredSpinner } from "../../ui/CenteredSpinner";
import { TransactionItem } from "../../transactions/TransactionItem";

// Styles & Logic
import * as S from "./RecentTransactionsWidget.styles";
import { useRecentTransactionsWidget } from "../../../hooks/Stats/useRecentTransactionsWidget";
import type { StatsFilter } from "../../../services/apiStats";

interface Props {
  globalFilter: StatsFilter;
  onDiverge?: () => void;
}

export const RecentTransactionsWidget = (props: Props) => {
  const {
    state: {
      recentItems,
      isLoadingTx,
      categories,
      accounts,
      localFilter,
      currency,
      language,
    },
    actions: {
      handleFilterUpdate,
      handleNavigateToAll,
      handleNavigateToDetails,
    },
    t,
  } = useRecentTransactionsWidget(props);

  return (
    <S.WidgetCard>
      <S.Header>
        <S.TitleGroup>
          <S.Title>{t("dashboard:dashboard.recent_transactions")}</S.Title>
          <S.ViewAllLink onClick={handleNavigateToAll}>
            {t("dashboard:dashboard.view_all")} <HiArrowLongRight />
          </S.ViewAllLink>
        </S.TitleGroup>

        <WidgetControls
          mini={true}
          currentLabel={localFilter.label || t("legacy:filters.period_label")}
          currentAccountIds={localFilter.accountIds || []}
          onFilterChange={handleFilterUpdate}
          variant="local"
          hidePeriod={true}
        />
      </S.Header>

      {isLoadingTx ? (
        <CenteredSpinner isContainer />
      ) : (
        <S.TableList>
          {recentItems.map((tx) => (
            <TransactionItem
              key={tx.id}
              transaction={tx}
              categories={categories}
              accounts={accounts}
              currency={currency}
              language={language}
              onClick={() => handleNavigateToDetails(tx.id)}
              isWidget={true}
            />
          ))}

          {recentItems.length === 0 && (
            <S.EmptyState>
              <HiOutlineBanknotes size={32} />
              <span>{t("dashboard:dashboard.no_data")}</span>
            </S.EmptyState>
          )}
        </S.TableList>
      )}
    </S.WidgetCard>
  );
};
