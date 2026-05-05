import { HiEllipsisVertical } from "react-icons/hi2";

// Styles & Logic
import * as S from "./WidgetMenu.styles";
import { useWidgetMenu } from "../../../hooks/Stats/useWidgetMenu";

export interface DateRange {
  from: number;
  to: number;
  label: string;
}

interface Props {
  onRangeChange: (range: DateRange) => void;
  currentLabel: string;
}

export const WidgetMenu = ({ onRangeChange, currentLabel }: Props) => {
  const { isOpen, setIsOpen, menuRef, handleSelect, t } = useWidgetMenu({
    onRangeChange,
  });

  return (
    <S.MenuContainer ref={menuRef}>
      <S.MenuButton onClick={() => setIsOpen(!isOpen)} $active={isOpen}>
        <HiEllipsisVertical />
      </S.MenuButton>

      {isOpen && (
        <S.Dropdown>
          <S.MenuItem
            $active={currentLabel === t("legacy:filters.periods.this_month")}
            onClick={() => handleSelect("thisMonth")}
          >
            {t("legacy:filters.periods.this_month")}
          </S.MenuItem>
          <S.MenuItem
            $active={currentLabel === t("legacy:filters.periods.last_month")}
            onClick={() => handleSelect("lastMonth")}
          >
            {t("legacy:filters.periods.last_month")}
          </S.MenuItem>
          <S.MenuItem
            $active={currentLabel === t("legacy:filters.periods.this_year")}
            onClick={() => handleSelect("year")}
          >
            {t("legacy:filters.periods.this_year")}
          </S.MenuItem>
        </S.Dropdown>
      )}
    </S.MenuContainer>
  );
};
