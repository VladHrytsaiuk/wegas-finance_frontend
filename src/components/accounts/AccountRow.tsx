import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HiUser,
  HiTrash,
  HiPencil,
  HiArrowPath,
  HiBanknotes,
  HiArchiveBox,
  HiCreditCard,
  HiEnvelope,
  HiLockClosed,
  HiBeaker,
  HiEllipsisVertical,
} from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import Table from "../ui/Table";
import * as S from "./AccountsTable.styles";
import type { Account } from "../../types";

export interface AccountStyleInfo {
  bg: string;
  color: string;
  miniLogo: string | null;
  iconType: string | null;
}

interface AccountRowProps {
  acc: Account;
  styleInfo: AccountStyleInfo;
  canManage: boolean;
  onClick: (id: string) => void;
  onDelete: (id: string) => void;
  openDeleteConfirm: (id: string) => void;
  formatMoney: (amount: number, currency: string) => string;
  getOwnerName: (id: string) => string;
  translateAccountType: (type: string) => string;
}

export function AccountRow({
  acc,
  styleInfo,
  canManage,
  onClick,
  onDelete,
  openDeleteConfirm,
  formatMoney,
  getOwnerName,
  translateAccountType,
}: AccountRowProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Helper для рендеру іконки
  const renderIcon = (type: string | null) => {
    switch (type) {
      case "envelope":
        return <HiEnvelope size={16} />;
      case "safe":
        return <HiLockClosed size={16} />;
      case "jar":
        return <HiBeaker size={16} />;
      case "cash":
        return <HiBanknotes size={16} />;
      case "archive":
        return <HiArchiveBox size={16} />;
      default:
        return <HiCreditCard size={16} />;
    }
  };

  // Закриваємо меню при кліку поза ним
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <Table.Row onClick={() => onClick(acc.id)}>
      {/* NAME & ICON */}
      <Table.Cell>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <S.IconWrapper $bg={styleInfo.bg} $color={styleInfo.color}>
            {styleInfo.miniLogo ? (
              <S.LogoImg
                src={`/banks/${styleInfo.miniLogo}.svg`}
                alt="bank"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              renderIcon(styleInfo.iconType)
            )}
          </S.IconWrapper>

          <div>
            <div
              style={{
                fontWeight: 600,
                fontSize: "0.9rem",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {acc.name}
              {acc.storage_type?.name && (
                <span
                  style={{
                    fontSize: "0.65rem",
                    color: "var(--color-text-tertiary)",
                    fontWeight: 400,
                  }}
                >
                  ({acc.storage_type.name})
                </span>
              )}

              {acc.is_synced && (
                <div
                  title="Синхронізовано"
                  style={{ color: "var(--color-brand-600)", display: "flex" }}
                >
                  <HiArrowPath size={14} />
                </div>
              )}
            </div>

            {acc.type === "card" && acc.card_number && (
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "var(--color-text-secondary)",
                  fontFamily: "monospace",
                }}
              >
                {t("accounts:accountsTable.card_placeholder", {
                  last_digits: acc.card_number,
                })}
              </div>
            )}
          </div>
        </div>
      </Table.Cell>

      {/* TYPE */}
      <Table.Cell style={{ textTransform: "capitalize", fontSize: "0.75rem" }}>
        {translateAccountType(acc.type)}
      </Table.Cell>

      {/* OWNER */}
      <Table.Cell>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.8rem",
          }}
        >
          <HiUser style={{ color: "var(--color-text-secondary)" }} />
          {getOwnerName(acc.user_id)}
        </div>
      </Table.Cell>

      {/* BALANCE */}
      <Table.Cell
        style={{
          textAlign: "right",
          fontWeight: 700,
          fontFamily: "monospace",
          fontSize: "0.95rem",
        }}
      >
        {formatMoney(acc.calculated_balance || acc.balance, acc.currency)}
      </Table.Cell>

      {/* ACTIONS */}
      {canManage && (
        <Table.Cell>
          <S.ActionsRow onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            {/* Десктопні кнопки (ховаються на <= 1280px) */}
            <S.DesktopActions>
              <S.ActionBtn
                as={Link}
                to={`${acc.id}/edit`}
                state={{ background: location }}
                $variant="edit"
              >
                <HiPencil size={18} />
              </S.ActionBtn>
              <S.ActionBtn
                as="button"
                $variant="delete"
                onClick={() => {
                  onDelete(acc.id);
                  openDeleteConfirm("delete-confirm");
                }}
              >
                <HiTrash size={18} />
              </S.ActionBtn>
            </S.DesktopActions>

            {/* Мобільне меню (з'являється на <= 1280px) */}
            <S.MobileActions ref={menuRef}>
              <S.ActionBtn
                as="button"
                $variant="edit"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <HiEllipsisVertical size={20} />
              </S.ActionBtn>

              {isMenuOpen && (
                <S.DropdownMenu>
                  <S.DropdownItem
                    as={Link}
                    to={`${acc.id}/edit`}
                    state={{ background: location }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <HiPencil size={16} /> {t("common:shared.edit", "Редагувати")}
                  </S.DropdownItem>
                  <S.DropdownItem
                    as="button"
                    $isDanger
                    onClick={() => {
                      setIsMenuOpen(false);
                      onDelete(acc.id);
                      openDeleteConfirm("delete-confirm");
                    }}
                  >
                    <HiTrash size={16} /> {t("common:shared.delete", "Видалити")}
                  </S.DropdownItem>
                </S.DropdownMenu>
              )}
            </S.MobileActions>
          </S.ActionsRow>
        </Table.Cell>
      )}
    </Table.Row>
  );
}
