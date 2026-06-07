import { memo, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  HiPencil,
  HiTrash,
  HiPaperClip,
  HiEllipsisVertical,
} from "react-icons/hi2";

import Modal from "../ui/Modal";
import Table from "../ui/Table";
import ConfirmDelete from "../ui/ConfirmDelete";

import { TransactionIcon } from "./TransactionIcon";
import { useTransactionItem } from "../../hooks/Transactions/useTransactionItem";
import { useDropdownPosition } from "../../hooks/useDropdownPosition";

import * as S from "./TransactionsTable.styles";

export const TransactionTableRow = memo(
  ({ tx, categories, accounts, baseCurrency, language, onDelete, onClick }) => {
    const { t } = useTranslation();
    const location = useLocation();

    const [open, setOpen] = useState(false);

    const { triggerRef, menuRef, style } = useDropdownPosition(
      open,
      () => setOpen(false),
      "right",
      160,
    );

    const display = useTransactionItem({
      transaction: tx,
      categories,
      accounts,
      baseCurrency,
      language,
    });

    return (
      <Table.Row onClick={() => onClick(tx.id)}>
        {/* ICON */}
        <Table.Cell className="col-icon">
          <TransactionIcon
            logoUrl={display.logoUrl}
            iconName={display.iconName}
            color={display.color}
            isTransfer={display.isTransfer}
            size={40}
          />
        </Table.Cell>

        {/* DETAILS */}
        <Table.Cell>
          <S.TextStack>
            <strong title={display.title}>{display.title}</strong>
            <span>
              <b style={{ color: "var(--color-brand-600)" }}>
                {display.timeFormatted}
              </b>
              {display.subtitle && ` • ${display.subtitle}`}
            </span>
            {/* Бонус: На мобільних показує назву рахунку, бо колонка прихована */}
            <S.MobileAccountBadge>{display.accountName}</S.MobileAccountBadge>
          </S.TextStack>
        </Table.Cell>

        {/* ACCOUNT (Ховається на мобільних) */}
        <Table.Cell className="col-account">
          <S.AccountName $isDeleted={display.isAccountDeleted}>
            {display.accountName}
          </S.AccountName>
        </Table.Cell>

        {/* NOTE */}
        <Table.Cell className="col-note">
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {tx.receipt_img && (
              <S.ReceiptBadge title={t("transactions:transactionsTable.has_receipt")}>
                <HiPaperClip size={14} />
              </S.ReceiptBadge>
            )}
            <S.NoteText>{display.note || "—"}</S.NoteText>
          </div>
        </Table.Cell>

        {/* AMOUNT */}
        <Table.Cell style={{ textAlign: "right" }}>
          <S.Amount
            $color={display.amountColor}
            $isForgiveness={display.isForgiveness}
          >
            {display.amountFormatted}
          </S.Amount>
        </Table.Cell>

        {/* ACTIONS */}
        {/* ACTIONS */}
        <Table.Cell className="col-actions">
          {/* desktop */}
          <S.DesktopActions onClick={(e) => e.stopPropagation()}>
            <S.ActionLink
              to={`/transactions/${tx.id}/edit`}
              state={{ background: location }}
            >
              <HiPencil size={18} />
            </S.ActionLink>

            <Modal>
              <Modal.Open opens="delete">
                <S.ActionBtn $variant="delete">
                  <HiTrash size={18} />
                </S.ActionBtn>
              </Modal.Open>

              <Modal.Window name="delete">
                <ConfirmDelete
                  resourceName={t("transactions:transactionsTable.resource_name")}
                  onConfirm={() => onDelete(tx.id)}
                />
              </Modal.Window>
            </Modal>
          </S.DesktopActions>

          {/* mobile */}
          <S.MobileActions onClick={(e) => e.stopPropagation()}>
            {/* Обертаємо ВСЕ мобільне меню в Modal */}
            <Modal>
              <S.MenuToggle
                ref={triggerRef as any}
                onClick={() => setOpen((v) => !v)}
              >
                <HiEllipsisVertical size={20} />
              </S.MenuToggle>

              {open &&
                createPortal(
                  <S.MenuDropdown
                    ref={menuRef}
                    onClick={() => setOpen(false)}
                    style={{
                      position: "fixed",
                      top: style.top !== undefined ? `${style.top}px` : "auto",
                      bottom:
                        style.bottom !== undefined
                          ? `${style.bottom}px`
                          : "auto",
                      left:
                        style.left !== undefined ? `${style.left}px` : "auto",
                      right:
                        style.right !== undefined ? `${style.right}px` : "auto",
                      maxHeight: `${style.maxHeight}px`,
                      transformOrigin: style.transformOrigin,
                      zIndex: 99999,
                      minWidth: "160px",
                    }}
                  >
                    <S.MenuItemLink
                      to={`/transactions/${tx.id}/edit`}
                      state={{ background: location }}
                    >
                      <HiPencil size={16} /> {t("common:common.edit")}
                    </S.MenuItemLink>
                    <Modal.Open opens="delete">
                      <S.MenuItemButton $variant="delete">
                        <HiTrash size={16} /> {t("common:common.delete")}
                      </S.MenuItemButton>
                    </Modal.Open>
                  </S.MenuDropdown>,
                  document.body,
                )}

              {/* Вікно підтвердження винесено СЮДИ, щоб воно не зникало при закритті меню */}
              <Modal.Window name="delete">
                <ConfirmDelete
                  resourceName={t("transactions:transactionsTable.resource_name")}
                  onConfirm={() => onDelete(tx.id)}
                />
              </Modal.Window>
            </Modal>
          </S.MobileActions>
        </Table.Cell>
      </Table.Row>
    );
  },
);

TransactionTableRow.displayName = "TransactionTableRow";
