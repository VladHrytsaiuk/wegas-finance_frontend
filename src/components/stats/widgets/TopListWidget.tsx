// Components
import { WidgetControls } from "./WidgetControls";
import { EmptyState } from "../../ui/EmptyState";
import { HiListBullet } from "react-icons/hi2";
import { TopListBodySkeleton } from "../../ui/Skeleton/LoadingSkeletons";

// Styles & Logic
import * as S from "./TopListWidget.styles";
import { useTopListWidget } from "../../../hooks/Stats/useTopListWidget";
import { formatMoney } from "../../../utils/helpers";
import { SmartIcon } from "../../../utils/IconMap";
import type { StatsFilter } from "../../../services/apiStats";

interface Props {
  type: "income" | "expense";
  entity: "category" | "tag" | "counterparty";
  title: string;
  globalFilter: StatsFilter;
  onDiverge?: () => void;
  hideHeader?: boolean;
}

export const TopListWidget = (props: Props) => {
  const {
    state: {
      activeType,
      processedData,
      isLoading,
      localFilter,
      hasChanges,
      currency,
      language,
    },
    actions: { handleFilterUpdate, setActiveType },
    t,
  } = useTopListWidget(props);

  return (
    <S.WidgetCard>
      {!props.hideHeader && (
        <S.Header>
          <S.TitleGroup>
            {props.title && <S.Title>{props.title}</S.Title>}
            <S.TypeToggle>
              <S.ToggleBtn
                $active={activeType === "expense"}
                $color="#ef4444"
                onClick={() => setActiveType("expense")}
              >
                {t("dashboard:filters.periods.expense_label")}
              </S.ToggleBtn>
              <S.ToggleBtn
                $active={activeType === "income"}
                $color="#22c55e"
                onClick={() => setActiveType("income")}
              >
                {t("dashboard:filters.periods.income_label")}
              </S.ToggleBtn>
            </S.TypeToggle>
          </S.TitleGroup>
          <WidgetControls
            mini={true}
            currentLabel={localFilter.label || t("legacy:filters.period_label")}
            currentAccountIds={localFilter.accountIds || []}
            onFilterChange={handleFilterUpdate}
            currentFrom={localFilter.from}
            currentTo={localFilter.to}
            variant="local"
            hasChanges={hasChanges}
          />
        </S.Header>
      )}

      {isLoading ? (
        <TopListBodySkeleton />
      ) : processedData.length === 0 ? (
        <EmptyState
          compact
          icon={<HiListBullet />}
          title={t("dashboard:dashboard.no_data")}
        />
      ) : (
        <S.List>
          {processedData.map((item, idx) => (
            <S.ListItem key={idx}>
              <S.Row>
                <S.NameGroup>
                  <S.Logo
                    $color={item.displayColor}
                    $hasImage={!!item.logo || !!item.icon}
                  >
                    <SmartIcon
                      logo={item.logo}
                      iconName={item.icon}
                      color={item.displayColor}
                      size={16}
                    />
                  </S.Logo>
                  <S.Name title={item.displayName}>{item.displayName}</S.Name>
                </S.NameGroup>
                <S.Value>{formatMoney(item.total, currency, language)}</S.Value>
              </S.Row>

              <S.ProgressBg>
                <S.ProgressBar
                  $width={item.percent}
                  $color={item.displayColor}
                />
              </S.ProgressBg>
            </S.ListItem>
          ))}
        </S.List>
      )}
    </S.WidgetCard>
  );
};
