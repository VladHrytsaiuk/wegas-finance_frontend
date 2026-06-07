// Components
import { WidgetControls } from "./WidgetControls";
import Spinner from "../../ui/Spinner";
import { CenteredSpinner } from "../../ui/CenteredSpinner";
import { EmptyState } from "../../ui/EmptyState";
import { HiListBullet } from "react-icons/hi2";

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
}

export const TopListWidget = (props: Props) => {
  const {
    state: {
      processedData,
      isLoading,
      localFilter,
      hasChanges,
      currency,
      language,
    },
    actions: { handleFilterUpdate },
    t,
  } = useTopListWidget(props);

  return (
    <S.WidgetCard>
      <S.Header>
        <S.Title>{props.title}</S.Title>
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

      {isLoading ? (
        <CenteredSpinner isContainer />
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
                    {item.logo ? (
                      <img src={`/brands/${item.logo}`} alt={item.displayName} />
                    ) : item.icon ? (
                      <SmartIcon
                        iconName={item.icon}
                        color={item.displayColor}
                        size={16}
                      />
                    ) : (
                      <S.ColorDot $color={item.displayColor} />
                    )}
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
