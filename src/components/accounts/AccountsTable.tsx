import React from "react";
import { useTranslation } from "react-i18next";
import { useModal } from "../ui/Modal";
import Table from "../ui/Table";
import { useAccountsTable } from "../../hooks/Accounts/useAccountsTable";
import { AccountRow } from "./AccountRow";
import * as S from "./AccountsTable.styles";

interface AccountsTableProps {
  accounts: any[];
  users: any[];
  onDelete: (id: string) => void;
  onClick: (id: string) => void;
  canManage: boolean;
}

export function AccountsTable({
  accounts,
  users,
  onDelete,
  onClick,
  canManage,
}: AccountsTableProps) {
  const { t } = useTranslation();
  const { open } = useModal();

  const {
    groupedAccounts,
    sortedKeys,
    getGroupHeaderDetails,
    formatMoney,
    getOwnerName,
    getIconStyles,
    translateAccountType,
  } = useAccountsTable({ accounts, users });

  return (
    <Table>
      <Table.Header>
        <tr>
          <th>{t("accounts:accountsTable.header_account")}</th>
          <th>{t("accounts:accountsTable.header_type")}</th>
          <th>{t("accounts:accountsTable.header_owner")}</th>
          <th style={{ textAlign: "right" }}>
            {t("accounts:accountsTable.header_balance")}
          </th>
          {canManage && <th style={{ width: "80px" }}></th>}
        </tr>
      </Table.Header>

      <Table.Body>
        {sortedKeys.map((key) => {
          const groupAccounts = groupedAccounts[key];
          const headerInfo = getGroupHeaderDetails(key);

          return (
            <React.Fragment key={key}>
              <S.GroupHeaderRow>
                <S.GroupHeaderCell colSpan={canManage ? 5 : 4}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {headerInfo.isBank && (
                      <S.BankIndicator $color={headerInfo.color || "#ccc"} />
                    )}
                    <span>{headerInfo.label}</span>
                  </div>
                </S.GroupHeaderCell>
              </S.GroupHeaderRow>

              {groupAccounts.map((acc) => (
                <AccountRow
                  key={acc.id}
                  acc={acc}
                  styleInfo={getIconStyles(acc)}
                  canManage={canManage}
                  onClick={onClick}
                  onDelete={onDelete}
                  openDeleteConfirm={open}
                  formatMoney={formatMoney}
                  getOwnerName={getOwnerName}
                  translateAccountType={translateAccountType}
                />
              ))}
            </React.Fragment>
          );
        })}
      </Table.Body>
    </Table>
  );
}
