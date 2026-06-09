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
  counterparties: Counterparty[];
  onRowClick: (id: string) => void;
  onAction: (
    cpId: string,
    type: "give" | "repay",
    context: "positive" | "negative",
    amount?: number,
  ) => void;
}

export function DebtsTable({
  counterparties,
  onRowClick,
  onAction,
}: DebtsTableProps) {
  const { t } = useTranslation();

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
        {counterparties.map((cp) => {
          const hasPositive = cp.balances.some((b) => b.balance > 0.01);
          const hasNegative = cp.balances.some((b) => b.balance < -0.01);

          const profileColor = hasPositive
            ? "var(--color-green-600)"
            : hasNegative
              ? "var(--color-red-600)"
              : "var(--color-brand-600)";

          return (
            <Table.Row key={cp.id} onClick={() => onRowClick(cp.id)}>
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
                  {hasPositive && (
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
                  {hasNegative && (
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
                </div>
              </Table.Cell>
              <Table.Cell>
                <BalancesList>
                  {cp.balances
                    .filter((b) => Math.abs(b.balance) > 0.01)
                    .map((b) => (
                      <BalanceItem key={b.currency} $isPositive={b.balance > 0}>
                        {formatMoney(Math.abs(b.balance), b.currency)}
                      </BalanceItem>
                    ))}
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
                        hasPositive ? "positive" : "negative",
                      );
                    }}
                    title={
                      hasPositive
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
      </Table.Body>
    </Table>
  );
}
