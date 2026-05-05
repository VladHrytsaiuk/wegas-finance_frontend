import { HiOutlineBanknotes } from "react-icons/hi2";
import Table from "../ui/Table";
import { AssetTableRow } from "./AssetTableRow";
import * as S from "../../pages/assets/Assets.styles";

export default function AssetsTable({ assets, helpers, actions, t }) {
  return (
    <Table>
      <Table.Header>
        <tr>
          <th>{t("assets:assetsPage.table_name")}</th>
          <th>{t("assets:assetsPage.table_price")}</th>
          <th>{t("assets:assetsPage.table_date")}</th>
          <th>{t("assets:assetsPage.table_warranty")}</th>
          <th>{t("assets:assetsPage.table_status")}</th>
          <th>{t("assets:assetsPage.table_actions")}</th>
        </tr>
      </Table.Header>

      {!assets?.length ? (
        <Table.Empty>
          <S.EmptyStateContainer>
            <S.EmptyIconWrapper>
              <HiOutlineBanknotes />
            </S.EmptyIconWrapper>
            <div>
              <h3>{t("assets:assetsPage.status_empty_title") || "Активи відсутні"}</h3>
              <p>
                {t("assets:assetsPage.status_empty_desc") ||
                  "Додайте цінне майно, техніку або інші активи, щоб відстежувати їх вартість та гарантію."}
              </p>
            </div>
          </S.EmptyStateContainer>
        </Table.Empty>
      ) : (
        <Table.Body>
          {assets.map((item) => (
            <AssetTableRow
              key={item.id}
              item={item}
              helpers={helpers}
              actions={actions}
              t={t}
            />
          ))}
        </Table.Body>
      )}
    </Table>
  );
}
