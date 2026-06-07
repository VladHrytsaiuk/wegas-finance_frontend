import { formatMoney } from "../../utils/helpers";
import { SmartIcon } from "../../utils/IconMap";

import {
  useDetailedTable,
  type DataItem,
} from "../../hooks/ui/useDetailedTable";
import * as S from "./DetailedTable.styles";

interface Props {
  data: DataItem[];
  currency: string;
  totalSum: number;
  type?: "category" | "counterparty" | "tag";
}

export const DetailedTable = ({
  data,
  currency,
  totalSum,
  type = "category",
}: Props) => {
  const { rows, t } = useDetailedTable({ data, totalSum, type });

  return (
    <S.TableWrapper>
      <S.TableHead>
        <div>{t("stats_utility:statisticsPage.table_header_name")}</div>
        <div style={{ textAlign: "right" }}>
          {t("stats_utility:statisticsPage.table_header_amount")}
        </div>
      </S.TableHead>

      <S.TableBody>
        {rows.map((item, idx) => (
          <S.TableRow key={idx}>
            <S.RowContent>
              <S.NameCell>
                <S.IconBox $color={item.finalColor} $hasLogo={!!item.logo}>
                  <SmartIcon
                    iconName={item.displayIcon}
                    logo={item.logo}
                    size={24}
                    color={item.finalColor}
                  />
                </S.IconBox>

                <S.NameText title={item.name}>
                  {item.name || t("stats_utility:statisticsPage.table_unnamed")}
                </S.NameText>
              </S.NameCell>

              <S.AmountCell>
                <div className="amount">{formatMoney(item.total, currency)}</div>
                <div className="percent">{item.percent.toFixed(1)}%</div>
              </S.AmountCell>
            </S.RowContent>

            <S.ProgressBar>
              <div
                className="fill"
                style={{
                  width: `${item.percent}%`,
                  background: item.finalColor,
                }}
              />
            </S.ProgressBar>
          </S.TableRow>
        ))}
      </S.TableBody>
    </S.TableWrapper>
  );
};
