import { createPortal } from "react-dom";
import { HiAdjustmentsHorizontal, HiCheck } from "react-icons/hi2";

// Styles & Logic
import * as S from "./FilterMenu.styles";
import {
  useFilterMenu,
  type FilterState,
} from "../../hooks/Toolbar/useFilterMenu";

interface Props {
  onFilterChange: (filters: FilterState) => void;
  currentLabel: string;
}

export const FilterMenu = ({ onFilterChange, currentLabel }: Props) => {
  const {
    state: { isOpen, currentRange, selectedAccounts, accounts, style },
    refs: { triggerRef, menuRef },
    handlers: {
      openMenu,
      handleApply,
      setPeriod,
      toggleAccount,
      setSelectedAccounts,
    },
    t,
  } = useFilterMenu({ onFilterChange });

  return (
    <S.Container>
      <S.Button ref={triggerRef} onClick={openMenu} $active={isOpen}>
        <HiAdjustmentsHorizontal />
        <S.ButtonLabel>{currentLabel}</S.ButtonLabel>
      </S.Button>

      {isOpen &&
        createPortal(
          <S.Dropdown ref={menuRef} style={style}>
            {/* Period Section */}
            <S.SectionTitle>
              {t("dashboard:dashboardPage.filter_period_label")}
            </S.SectionTitle>
            <S.PeriodGrid>
              <S.Chip
                onClick={() => setPeriod("7days")}
                $isActive={currentRange.label === t("export_import:importModal.period_7days")}
              >
                {t("export_import:importModal.chip_7days", "7 днів")}
              </S.Chip>
              <S.Chip
                onClick={() => setPeriod("30days")}
                $isActive={
                  currentRange.label === t("export_import:importModal.period_30days")
                }
              >
                {t("export_import:importModal.chip_30days", "30 днів")}
              </S.Chip>
              <S.Chip
                onClick={() => setPeriod("thisMonth")}
                $isActive={
                  currentRange.label === t("dashboard:dashboardPage.filter_period_month")
                }
              >
                {t("dashboard:dashboardPage.filter_period_month")}
              </S.Chip>
              <S.Chip
                onClick={() => setPeriod("lastMonth")}
                $isActive={
                  currentRange.label === t("export_import:importModal.period_last_month")
                }
              >
                {t("export_import:importModal.chip_last_month", "Мин. місяць")}
              </S.Chip>
              <S.Chip
                onClick={() => setPeriod("year")}
                $isActive={currentRange.label === t("export_import:importModal.period_year")}
              >
                {t("export_import:importModal.chip_year", "Рік")}
              </S.Chip>
            </S.PeriodGrid>

            <S.Divider />

            {/* Accounts Section */}
            <S.SectionTitle>{t("navigation:general.accounts")}</S.SectionTitle>
            <S.AccountList>
              <S.AccountItem onClick={() => setSelectedAccounts([])}>
                <S.Checkbox $checked={selectedAccounts.length === 0}>
                  <HiCheck />
                </S.Checkbox>
                <span>{t("legacy:filterComponent.toggle_all")}</span>
              </S.AccountItem>

              {accounts?.map((acc: any) => (
                <S.AccountItem
                  key={acc.id}
                  onClick={() => toggleAccount(acc.id)}
                >
                  <S.Checkbox $checked={selectedAccounts.includes(acc.id)}>
                    <HiCheck />
                  </S.Checkbox>
                  <span>{acc.name}</span>
                </S.AccountItem>
              ))}
            </S.AccountList>

            <S.ApplyButton onClick={handleApply}>
              {t("legacy:filterComponent.range_button_ok")}
            </S.ApplyButton>
          </S.Dropdown>,
          document.body
        )}
    </S.Container>
  );
};
