import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DayPicker } from "react-day-picker";
import {
  HiCalendarDays,
  HiChevronDown,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi2";
import "react-day-picker/dist/style.css";

import {
  useDateRangePicker,
  type DatePickerProps,
} from "../../hooks/ui/useDateRangePicker";
import { useDropdownPosition } from "../../hooks/useDropdownPosition";
import * as S from "./DateRangePicker.styles";
import { useTranslation } from "react-i18next";

interface ExtendedDatePickerProps extends DatePickerProps {
  staticPicker?: boolean;
  numberOfMonths?: number;
}
// Ручні масиви місяців
const MONTHS_UK = [
  "Січень",
  "Лютий",
  "Березень",
  "Квітень",
  "Травень",
  "Червень",
  "Липень",
  "Серпень",
  "Вересень",
  "Жовтень",
  "Листопад",
  "Грудень",
];
const MONTHS_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// 🔥 ІДЕАЛЬНИЙ СЕЛЕКТ З СИНХРОНІЗАЦІЄЮ ТА ЖОРСТКОЮ ЛОГІКОЮ 🔥
const CustomDayPickerDropdown = (props: DropdownProps) => {
  const { value, onChange } = props;
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 🔥 100% БРОНЕБІЙНА ПЕРЕВІРКА 🔥
  // Місяці завжди мають значення від 0 до 11. Роки - завжди 2015 і більше.
  const isMonth = Number(value) < 12;

  // Визначаємо мову
  const isEn = localStorage.getItem("i18nextLng")?.startsWith("en");
  const monthNames = isEn ? MONTHS_EN : MONTHS_UK;

  // Генеруємо опції самостійно
  const options = isMonth
    ? monthNames.map((m, i) => ({ value: String(i), label: m }))
    : Array.from({ length: new Date().getFullYear() + 3 - 2015 + 1 }).map(
        (_, i) => ({
          value: String(2015 + i),
          label: String(2015 + i),
        }),
      );

  const selectedOption = options.find((opt) => opt.value === String(value));
  const displayLabel = selectedOption?.label || value;

  // Синхронізація закриття та клік поза межами
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node))
        setIsOpen(false);
    };

    // Слухаємо кастомну подію від інших селектів
    const handleCloseOthers = () => setIsOpen(false);

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("close-date-dropdowns", handleCloseOthers);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("close-date-dropdowns", handleCloseOthers);
    };
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      // Кажемо всім іншим селектам закритися перед тим, як відкрити себе
      document.dispatchEvent(new Event("close-date-dropdowns"));
    }
    setIsOpen(!isOpen);
  };

  const handleSelect = (val: string) => {
    if (onChange) {
      onChange({
        target: { value: val },
      } as React.ChangeEvent<HTMLSelectElement>);
    }
    setIsOpen(false);
  };

  return (
    <div
      ref={ref}
      style={{ position: "relative", display: "inline-block", margin: "0 4px" }}
    >
      <button
        type="button"
        onClick={handleToggle}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
          background: isOpen
            ? "var(--color-bg-hover)"
            : "var(--color-bg-surface)",
          border: "1px solid var(--color-border)",
          padding: "4px 10px",
          height: "32px",
          borderRadius: "6px",
          fontSize: "0.9rem",
          fontWeight: 500,
          color: "var(--color-text-main)",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          if (!isOpen)
            e.currentTarget.style.borderColor = "var(--color-text-secondary)";
        }}
        onMouseLeave={(e) => {
          if (!isOpen)
            e.currentTarget.style.borderColor = "var(--color-border)";
        }}
      >
        <span
          style={{ minWidth: isMonth ? "70px" : "40px", textAlign: "left" }}
        >
          {displayLabel}
        </span>
        <HiChevronDown
          size={14}
          style={{
            transform: isOpen ? "rotate(180deg)" : "none",
            transition: "transform 0.2s ease",
            color: "var(--color-text-secondary)",
          }}
        />
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--color-bg-surface)",
            border: "1px solid var(--color-border)",
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            borderRadius: "8px",
            padding: "4px",
            zIndex: 99999,
            maxHeight: "220px",
            overflowY: "auto",
            minWidth: isMonth ? "120px" : "80px",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          {options.map((opt) => {
            const isSelected = opt.value === String(value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                style={{
                  padding: "8px 12px",
                  textAlign: "center",
                  background: isSelected
                    ? "var(--color-brand-100)"
                    : "transparent",
                  color: isSelected
                    ? "var(--color-brand-700)"
                    : "var(--color-text-main)",
                  fontWeight: isSelected ? 600 : 400,
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected)
                    e.currentTarget.style.background = "var(--color-bg-hover)";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected)
                    e.currentTarget.style.background = "transparent";
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const DateRangePicker = (props: ExtendedDatePickerProps) => {
  const { state, refs: datePickerRefs, actions, t } = useDateRangePicker(props);
  const {
    isOpen,
    tempRange,
    tempDate,
    day,
    month,
    year,
    rangeLabel,
    currentLocale,
    mode,
  } = state;

  const monthsToShow = props.numberOfMonths ?? (mode === "range" ? 2 : 1);
  const estimatedWidth = monthsToShow === 2 ? 620 : 320;

  const {
    triggerRef,
    menuRef,
    style: dropdownStyle,
  } = useDropdownPosition(
    isOpen,
    () => actions.setIsOpen(false),
    "left",
    estimatedWidth,
  );

  const renderPickerContent = () => (
    <S.PickerContainer
      ref={menuRef}
      onMouseDown={(e) => e.stopPropagation()}
      style={
        props.staticPicker
          ? {
              position: "static",
              boxShadow: "none",
              border: "none",
              transform: "none",
              width: "fit-content",
              display: "flex",
            }
          : {
              ...dropdownStyle,
              position: "fixed",
              zIndex: 2147483647,
              width: "fit-content",
              minWidth: monthsToShow === 1 ? "300px" : "auto",
              maxWidth: "100vw",
            }
      }
    >
      {mode === "range" && (
        <S.ShortcutsPanel>
          <S.ShortcutBtn onClick={() => actions.applyPreset("today")}>
            {t("legacy:filters.periods.today")}
          </S.ShortcutBtn>
          <S.ShortcutBtn onClick={() => actions.applyPreset("yesterday")}>
            {t("legacy:filters.periods.yesterday")}
          </S.ShortcutBtn>
          <S.ShortcutBtn onClick={() => actions.applyPreset("last7")}>
            {t("legacy:filters.periods.last_7_days")}
          </S.ShortcutBtn>
          <S.ShortcutBtn onClick={() => actions.applyPreset("thisMonth")}>
            {t("legacy:filters.periods.this_month")}
          </S.ShortcutBtn>
          <S.ShortcutBtn onClick={() => actions.applyPreset("lastMonth")}>
            {t("legacy:filters.periods.last_month")}
          </S.ShortcutBtn>
          <S.ShortcutBtn onClick={() => actions.applyPreset("thisYear")}>
            {t("legacy:filters.periods.this_year")}
          </S.ShortcutBtn>
        </S.ShortcutsPanel>
      )}

      <S.RightSide>
        <S.CalendarSection>
          <S.StyledDayPickerWrapper>
            <DayPicker
              mode={mode === "range" ? "range" : "single"}
              selected={mode === "range" ? tempRange : tempDate}
              onSelect={
                mode === "range"
                  ? actions.handleRangeSelect
                  : actions.handleSingleSelect
              }
              locale={currentLocale}
              weekStartsOn={1}
              showOutsideDays
              numberOfMonths={monthsToShow}
              pagedNavigation={monthsToShow === 1}
              captionLayout="dropdown"
              fromYear={2015}
              toYear={new Date().getFullYear() + 3}
              modifiersClassNames={{
                selected: "rdp-day_selected",
                range_start: "rdp-day_range_start",
                range_end: "rdp-day_range_end",
                range_middle: "rdp-day_range_middle",
              }}
              components={{
                IconLeft: () => <HiChevronLeft />,
                IconRight: () => <HiChevronRight />,
                Dropdown: CustomDayPickerDropdown,
              }}
            />
          </S.StyledDayPickerWrapper>
        </S.CalendarSection>

        <S.Footer>
          {!props.staticPicker && (
            <S.FooterBtn type="button" onClick={() => actions.setIsOpen(false)}>
              {t("transactions:transactionForm.button_cancel")}
            </S.FooterBtn>
          )}
          <S.ApplyBtn type="button" onClick={actions.handleApply}>
            {t("legacy:filters.apply")}
          </S.ApplyBtn>
        </S.Footer>
      </S.RightSide>
    </S.PickerContainer>
  );

  if (props.staticPicker) return renderPickerContent();

  return (
    <div
      ref={triggerRef}
      style={{ position: "relative", width: "100%" }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {mode === "single" ? (
        <S.SegmentedWrapper onClick={() => actions.handleWrapperClick()}>
          <S.IconButton
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              actions.setIsOpen(!isOpen);
            }}
            title={t("legacy:filters.select_period_title")}
          >
            <HiCalendarDays size={20} />
          </S.IconButton>
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            <S.SegmentInput
              ref={datePickerRefs.dayRef}
              value={day}
              onChange={actions.handleDayChange}
              onKeyDown={(e) => actions.handleKeyDown(e, "d")}
              onMouseDown={(e) => e.stopPropagation()}
              onFocus={(e) => e.target.select()}
              placeholder={t("common:datePicker.placeholder_day")}
              style={{ width: "24px" }}
              maxLength={2}
            />
            <S.Separator>.</S.Separator>
            <S.SegmentInput
              ref={datePickerRefs.monthRef}
              value={month}
              onChange={actions.handleMonthChange}
              onKeyDown={(e) => actions.handleKeyDown(e, "m")}
              onMouseDown={(e) => e.stopPropagation()}
              onFocus={(e) => e.target.select()}
              placeholder={t("common:datePicker.placeholder_month")}
              style={{ width: "24px" }}
              maxLength={2}
            />
            <S.Separator>.</S.Separator>
            <S.SegmentInput
              ref={datePickerRefs.yearRef}
              value={year}
              onChange={actions.handleYearChange}
              onKeyDown={(e) => actions.handleKeyDown(e, "y")}
              onMouseDown={(e) => e.stopPropagation()}
              onFocus={(e) => e.target.select()}
              placeholder={t("common:datePicker.placeholder_year")}
              style={{ width: "42px" }}
              maxLength={4}
            />
          </div>
        </S.SegmentedWrapper>
      ) : (
        <S.TriggerBtn
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            actions.setIsOpen(!isOpen);
          }}
          $active={isOpen}
        >
          <HiCalendarDays size={18} />
          <span>{rangeLabel}</span>
        </S.TriggerBtn>
      )}
      {isOpen && createPortal(renderPickerContent(), document.body)}
    </div>
  );
};
