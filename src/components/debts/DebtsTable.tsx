import React from "react";
import { useTranslation } from "react-i18next";
import {
  HiOutlineUser,
  HiArrowUpRight,
  HiArrowDownLeft,
  HiPlus,
} from "react-icons/hi2";
import styled from "styled-components";
import Table from "../ui/Table";
import { Button } from "../ui/Button";
import { formatMoney } from "../../utils/helpers";
import { SmartIcon } from "../../utils/IconMap";
import type { Counterparty } from "../../types";
import * as S_ACC from "../accounts/AccountsTable.styles";

const Avatar = styled.div<{ $color: string }>`
  width: 2rem;
  height: 2rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${(props) =>
    `color-mix(in srgb, ${props.$color}, transparent 90%)`};
  color: ${(props) => props.$color};
  flex-shrink: 0;
  font-size: 0.9rem;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 6px;
  }
`;

const NameCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
`;

const BalancesList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
`;

const BalanceItem = styled.div<{ $isPositive: boolean }>`
  font-family: "JetBrains Mono", monospace;
  font-weight: 700;
  color: ${(props) =>
    props.$isPositive ? "var(--color-green-600)" : "var(--color-red-600)"};
  font-size: 0.9rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
`;

interface DebtsTableProps {
  debtors: Counterparty[];
  creditors: Counterparty[];
  settled: Counterparty[];
  onRowClick: (id: string) => void;
  onAction: (
    cpId: string,
    type: "give" | "repay",
    context: "positive" | "negative",
    amount?: number,
  ) => void;
}

export function DebtsTable({
  debtors,
  creditors,
  settled,
  onRowClick,
  onAction,
}: DebtsTableProps) {
  const { t } = useTranslation();

  const groups = [
    {
      key: "debtors",
      label: t("goals_debts:debtsPage.section_positive"),
      items: debtors,
      type: "positive" as const,
    },
    {
      key: "creditors",
      label: t("goals_debts:debtsPage.section_negative"),
      items: creditors,
      type: "negative" as const,
    },
    {
      key: "settled",
      label: t("goals_debts:debtsPage.section_settled", "Закриті"),
      items: settled,
      type: "neutral" as const,
    },
  ].filter((g) => g.items.length > 0);

  return (
    <Table>
      <Table.Header>
        <tr>
          <th>{t("goals_debts:debtsPage.header_name")}</th>
          <th>{t("goals_debts:debtsPage.header_status")}</th>
          <th style={{ textAlign: "right" }}>
            {t("goals_debts:debtsPage.header_balance")}
          </th>
          <th style={{ textAlign: "right", width: "150px" }}></th>
        </tr>
      </Table.Header>

      <Table.Body>
        {groups.map((group) => (
          <React.Fragment key={group.key}>
            <S_ACC.GroupHeaderRow>
              <S_ACC.GroupHeaderCell colSpan={4}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {group.key === "debtors" && <HiArrowUpRight color="var(--color-green-600)" />}
                  {group.key === "creditors" && <HiArrowDownLeft color="var(--color-red-600)" />}
                  {group.key === "settled" && <HiOutlineUser color="var(--color-grey-500)" />}
                  <span>{group.label}</span>
                  <S_ACC.BankIndicator 
                    $color={
                      group.type === "positive" 
                        ? "var(--color-green-500)" 
                        : group.type === "negative" 
                          ? "var(--color-red-500)" 
                          : "var(--color-grey-500)"
                    } 
                  />
                </div>
              </S_ACC.GroupHeaderCell>
            </S_ACC.GroupHeaderRow>
            
            {group.items.map((cp) => {
              const hasPositive = cp.balances.some((b) => b.balance > 0.01);
              const hasNegative = cp.balances.some((b) => b.balance < -0.01);
              const isSettled = !hasPositive && !hasNegative;

              const profileColor = hasPositive
                ? "var(--color-green-600)"
                : hasNegative
                  ? "var(--color-red-600)"
                  : "var(--color-grey-500)";

              return (
                <Table.Row key={`${group.key}-${cp.id}`} onClick={() => onRowClick(cp.id)}>
                  <Table.Cell>
                    <NameCell>
                      <Avatar $color={profileColor}>
                        <SmartIcon
                          logo={cp.logo}
                          iconName={cp.icon || "HiOutlineUser"}
                          size={20}
                          color={profileColor}
                        />
                      </Avatar>
                      {cp.name}
                    </NameCell>
                  </Table.Cell>
                  <Table.Cell>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontSize: "0.8rem",
                        opacity: 0.8,
                      }}
                    >
                      {(hasPositive || (isSettled && group.key === "debtors")) && (
                        <span
                          style={{
                            color: "var(--color-green-600)",
                            display: "flex",
                            alignItems: "center",
                            gap: "2px",
                          }}
                        >
                          <HiArrowUpRight />{" "}
                          {t("goals_debts:debtsPage.summary_owed_to_me")}
                        </span>
                      )}
                      {hasPositive && hasNegative && <span>•</span>}
                      {(hasNegative || (isSettled && group.key === "creditors")) && (
                        <span
                          style={{
                            color: "var(--color-red-600)",
                            display: "flex",
                            alignItems: "center",
                            gap: "2px",
                          }}
                        >
                          <HiArrowDownLeft />{" "}
                          {t("goals_debts:debtsPage.summary_i_owe")}
                        </span>
                      )}
                      {isSettled && group.key === "settled" && (
                        <span style={{ opacity: 0.5 }}>
                          {t("goals_debts:debtsPage.settled")}
                        </span>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <BalancesList>
                      {cp.balances.filter((b) => Math.abs(b.balance) > 0.01)
                        .length > 0 ? (
                        cp.balances
                          .filter((b) => Math.abs(b.balance) > 0.01)
                          .map((b) => (
                            <BalanceItem
                              key={b.currency}
                              $isPositive={b.balance > 0}
                            >
                              {formatMoney(Math.abs(b.balance), b.currency)}
                            </BalanceItem>
                          ))
                      ) : (
                        <BalanceItem $isPositive={true} style={{ opacity: 0.4 }}>
                          {formatMoney(0, cp.balances[0]?.currency || "UAH")}
                        </BalanceItem>
                      )}
                    </BalancesList>
                  </Table.Cell>
                  <Table.Cell onClick={(e) => e.stopPropagation()}>
                    <ActionButtons>
                      {hasPositive && (
                        <Button
                          variation="primary"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            const balance = cp.balances.find(
                              (b) => b.balance > 0,
                            )?.balance;
                            onAction(cp.id, "repay", "positive", balance);
                          }}
                          title={t("goals_debts:debtsPage.btn_repay_to_me")}
                        >
                          <HiArrowDownLeft />
                        </Button>
                      )}
                      {hasNegative && (
                        <Button
                          variation="primary"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            const balance = cp.balances.find(
                              (b) => b.balance < 0,
                            )?.balance;
                            onAction(cp.id, "repay", "negative", balance);
                          }}
                          title={t("goals_debts:debtsPage.btn_repay_my_debt")}
                        >
                          <HiArrowUpRight />
                        </Button>
                      )}
                      <Button
                        variation="secondary"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAction(
                            cp.id,
                            "give",
                            hasPositive || !hasNegative ? "positive" : "negative",
                          );
                        }}
                        title={
                          hasPositive || !hasNegative
                            ? t("goals_debts:debtsPage.btn_lend")
                            : t("goals_debts:debtsPage.btn_borrow")
                        }
                      >
                        <HiPlus />
                      </Button>
                    </ActionButtons>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </React.Fragment>
        ))}
      </Table.Body>
    </Table>
  );
}
