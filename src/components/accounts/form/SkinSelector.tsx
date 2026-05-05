import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

// Components & Styles
import { Button } from "../../ui/Button";
import * as S from "./AccountForm.styles";

// Utils
import { focusNextElement } from "../../../utils/focusUtils";

// 🔥 ОНОВЛЕНИЙ ІМПОРТ З КОНСТАНТ
import { BANK_GROUPS, BANK_SKINS } from "../bankSkins";

interface SkinSelectorProps {
  activeBankTab: string;
  setActiveBankTab: (bank: string) => void;
  skinKey: string;
  setSkinKey: (key: string) => void;
  onCloseModal?: () => void;
}

export function SkinSelector({
  activeBankTab,
  setActiveBankTab,
  skinKey,
  setSkinKey,
  onCloseModal,
}: SkinSelectorProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Auto-focus logic
  useEffect(() => {
    const timer = setTimeout(() => {
      const activeTab = containerRef.current?.querySelector(
        '[aria-selected="true"]',
      ) as HTMLElement;

      if (activeTab) {
        activeTab.focus();
      } else {
        const firstFocusable = containerRef.current?.querySelector(
          'button:not([disabled]):not([tabindex="-1"])',
        ) as HTMLElement;
        firstFocusable?.focus();
      }
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // 2. Keyboard Trap Logic
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault();
      focusNextElement(document.activeElement as HTMLElement, e.shiftKey);
    }
  };

  return (
    <S.SkinSelectorContainer ref={containerRef} onKeyDown={handleKeyDown}>
      <S.SkinSelectorTitle>
        {t("accountForm.title_select_design")}
      </S.SkinSelectorTitle>

      {/* BANK TABS */}
      <S.BankTabs>
        {/* 🔥 ПЕРЕБИРАЄМО ГРУПИ БАНКІВ */}
        {Object.values(BANK_GROUPS).map((group) => (
          <S.BankTab
            type="button"
            key={group.id}
            $active={activeBankTab === group.id}
            aria-selected={activeBankTab === group.id}
            onClick={() => setActiveBankTab(group.id)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                setActiveBankTab(group.id);
              }
            }}
          >
            {/* Тут можна додати t() для локалізації назв банків, якщо треба */}
            {group.label}
          </S.BankTab>
        ))}
      </S.BankTabs>

      {/* SKINS GRID */}
      <S.SkinGrid>
        {/* 🔥 ФІЛЬТРУЄМО СКІНИ ПО bankId */}
        {Object.values(BANK_SKINS)
          .filter((skin) => skin.bankId === activeBankTab)
          .map((skin) => (
            <S.SkinOption
              key={skin.id}
              type="button"
              $bg={skin.bg}
              $textColor={skin.color}
              $selected={skinKey === skin.id}
              onClick={() => setSkinKey(skin.id)}
              title={skin.label}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  setSkinKey(skin.id);
                }
              }}
            >
              {skin.label}
            </S.SkinOption>
          ))}
      </S.SkinGrid>

      {/* FOOTER ACTIONS */}
      <S.SkinSelectorFooter>
        <Button
          type="button"
          onClick={onCloseModal}
          style={{ width: "100%" }}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              onCloseModal?.();
            }
          }}
        >
          {t("accountForm.button_done")}
        </Button>
      </S.SkinSelectorFooter>
    </S.SkinSelectorContainer>
  );
}
