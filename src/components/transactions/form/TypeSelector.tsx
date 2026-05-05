import React, { useRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  HiOutlineBanknotes,
  HiOutlineArrowsRightLeft,
  HiArrowUpRight,
  HiArrowDownLeft,
} from "react-icons/hi2";
import { focusNextElement } from "../../../utils/focusUtils";
import * as S from "./TypeSelector.styles";

interface TypeSelectorProps {
  value: string;
  onChange: (type: string) => void;
  disabled?: boolean; // 👇 Додано пропс
}

export const TypeSelector: React.FC<TypeSelectorProps> = ({
  value,
  onChange,
  disabled, // 👇
}) => {
  const { t } = useTranslation();
  const firstSubBtnRef = useRef<HTMLButtonElement>(null);
  const [prevTab, setPrevTab] = useState("");

  const getActiveTab = (val: string) => {
    if (["expense", "transfer_out"].includes(val)) return "expense";
    if (["income", "transfer_in"].includes(val)) return "income";
    if (val === "transfer") return "transfer";
    if (["loan_give", "loan_repay", "debt_take", "debt_repay"].includes(val))
      return "debt";
    return "expense";
  };

  const activeTab = getActiveTab(value);

  // Focus management logic ... (без змін)
  useEffect(() => {
    if (activeTab === "debt" && prevTab !== "debt") {
      setTimeout(() => {
        firstSubBtnRef.current?.focus();
      }, 50);
    }
    setPrevTab(activeTab);
  }, [activeTab, prevTab]);

  const handleKeyDown = (e: React.KeyboardEvent, type: string) => {
    if (disabled) return; // 👇 Блокуємо клавіатуру
    if (e.key === "Enter") {
      e.preventDefault();
      onChange(type);
      // ... логіка фокусу ...
      if (
        activeTab !== "debt" &&
        !type.startsWith("loan") &&
        !type.startsWith("debt")
      ) {
        const currentElement = e.currentTarget as HTMLElement;
        setTimeout(() => focusNextElement(currentElement), 50);
      }
      if (
        ["loan_give", "loan_repay", "debt_take", "debt_repay"].includes(type)
      ) {
        const currentElement = e.currentTarget as HTMLElement;
        setTimeout(() => focusNextElement(currentElement), 50);
      }
    }
  };

  // 👇 Helper для блокування кліку
  const handleClick = (type: string) => {
    if (!disabled) {
      onChange(type);
    }
  };

  return (
    <S.Container
      style={disabled ? { opacity: 0.6, cursor: "not-allowed" } : {}}
    >
      <S.MainTabs>
        <S.Tab
          className="type-tab-btn"
          data-active={activeTab === "expense"}
          $isActive={activeTab === "expense"}
          $activeColor="var(--color-red-600)"
          onClick={() => handleClick("expense")}
          onKeyDown={(e) => handleKeyDown(e, "expense")}
          type="button"
          disabled={disabled} // Нативний disabled
        >
          {t("transactionForm.type_expense")}
        </S.Tab>
        <S.Tab
          className="type-tab-btn"
          data-active={activeTab === "income"}
          $isActive={activeTab === "income"}
          $activeColor="var(--color-green-600)"
          onClick={() => handleClick("income")}
          onKeyDown={(e) => handleKeyDown(e, "income")}
          type="button"
          disabled={disabled}
        >
          {t("transactionForm.type_income")}
        </S.Tab>
        <S.Tab
          className="type-tab-btn"
          data-active={activeTab === "transfer"}
          $isActive={activeTab === "transfer"}
          $activeColor="var(--color-blue-600)"
          onClick={() => handleClick("transfer")}
          onKeyDown={(e) => handleKeyDown(e, "transfer")}
          type="button"
          disabled={disabled}
        >
          <HiOutlineArrowsRightLeft /> {t("transactionForm.type_transfer")}
        </S.Tab>
        <S.Tab
          className="type-tab-btn"
          data-active={activeTab === "debt"}
          $isActive={activeTab === "debt"}
          $activeColor="var(--color-purple-600)"
          onClick={() => handleClick("loan_give")}
          onKeyDown={(e) => handleKeyDown(e, "loan_give")}
          type="button"
          disabled={disabled}
        >
          <HiOutlineBanknotes /> {t("general.debts")}
        </S.Tab>
      </S.MainTabs>

      {activeTab === "debt" && (
        <S.SubOptionsGrid>
          {/* ... Додати disabled={disabled} і handleClick до всіх кнопок нижче ... */}
          <S.SubButton
            ref={firstSubBtnRef}
            $isActive={value === "loan_give"}
            $color="var(--color-red-600)"
            onClick={() => handleClick("loan_give")}
            onKeyDown={(e) => handleKeyDown(e, "loan_give")}
            type="button"
            disabled={disabled}
          >
            <HiArrowUpRight /> {t("transactions.loan_give")}
          </S.SubButton>

          <S.SubButton
            $isActive={value === "loan_repay"}
            $color="var(--color-green-600)"
            onClick={() => handleClick("loan_repay")}
            onKeyDown={(e) => handleKeyDown(e, "loan_repay")}
            type="button"
            disabled={disabled}
          >
            <HiArrowDownLeft /> {t("transactions.loan_repay")}
          </S.SubButton>

          <S.SubButton
            $isActive={value === "debt_take"}
            $color="var(--color-green-600)"
            onClick={() => handleClick("debt_take")}
            onKeyDown={(e) => handleKeyDown(e, "debt_take")}
            type="button"
            disabled={disabled}
          >
            <HiArrowDownLeft /> {t("transactions.debt_take")}
          </S.SubButton>

          <S.SubButton
            $isActive={value === "debt_repay"}
            $color="var(--color-red-600)"
            onClick={() => handleClick("debt_repay")}
            onKeyDown={(e) => handleKeyDown(e, "debt_repay")}
            type="button"
            disabled={disabled}
          >
            <HiArrowUpRight /> {t("transactions.debt_repay")}
          </S.SubButton>
        </S.SubOptionsGrid>
      )}
    </S.Container>
  );
};
