import React from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineBanknotes } from "react-icons/hi2";

import Table from "../ui/Table";
import { TransactionTableRow } from "./TransactionTableRow";
import { useSettings } from "../../context/SettingsContext";
import { useTransactionsTable } from "../../hooks/Transactions/useTransactionsTable";

import {
  DateHeaderRow,
  DateHeaderCell,
  TableWrapper,
} from "./TransactionsTable.styles";

export const TransactionsTable = ({
  transactions,
  categories,
  accounts,
  onDelete,
  onClick,
  sortValue,
}) => {
  const { t } = useTranslation();
  const { language, currency: baseCurrency } = useSettings();

  const { dataToRender, shouldGroup, translateDateLabel, isEmpty } =
    useTransactionsTable({
      transactions,
      sortValue,
      language,
    });

  if (isEmpty) {
    return (
      <Table>
        <Table.Empty>
          <HiOutlineBanknotes size={32} style={{ opacity: 0.5 }} />
          <span>{t("transactionsTable.empty")}</span>
        </Table.Empty>
      </Table>
    );
  }

  return (
    <TableWrapper>
      <Table>
        <Table.Header>
          <tr>
            <th style={{ width: 60 }} />
            <th>{t("transactionsTable.header_category_description")}</th>
            <th className="col-account">
              {t("transactionsTable.header_account")}
            </th>
            <th className="col-note">{t("transactionsTable.header_note")}</th>
            <th style={{ textAlign: "right" }}>
              {t("transactionsTable.header_amount")}
            </th>
            <th className="col-actions" />
          </tr>
        </Table.Header>

        <Table.Body>
          {shouldGroup
            ? Object.entries(dataToRender).map(([dateLabel, txs]) => (
                <React.Fragment key={dateLabel}>
                  <DateHeaderRow>
                    <DateHeaderCell colSpan={6}>
                      {translateDateLabel(dateLabel)}
                    </DateHeaderCell>
                  </DateHeaderRow>

                  {txs.map((tx) => (
                    <TransactionTableRow
                      key={tx.id}
                      tx={tx}
                      categories={categories}
                      accounts={accounts}
                      baseCurrency={baseCurrency}
                      language={language}
                      onDelete={onDelete}
                      onClick={onClick}
                    />
                  ))}
                </React.Fragment>
              ))
            : dataToRender.map((tx) => (
                <TransactionTableRow
                  key={tx.id}
                  tx={tx}
                  categories={categories}
                  accounts={accounts}
                  baseCurrency={baseCurrency}
                  language={language}
                  onDelete={onDelete}
                  onClick={onClick}
                />
              ))}
        </Table.Body>
      </Table>
    </TableWrapper>
  );
};
