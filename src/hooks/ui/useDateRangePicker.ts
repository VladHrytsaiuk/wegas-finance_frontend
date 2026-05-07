import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { uk, enUS } from "date-fns/locale";
import {
  format,
  parse,
  isValid,
  subDays,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
  endOfDay,
  startOfDay,
} from "date-fns";
import type { DateRange } from "react-day-picker";

export interface DatePickerProps {
  mode?: "range" | "single";
  dateFrom?: Date | null;
  dateTo?: Date | null;
  onChange?: (range: { from?: Date; to?: Date }) => void;
  date?: Date | number | null;
  onDateChange?: (date: number) => void;
}

export const useDateRangePicker = (props: DatePickerProps) => {
  const { t, i18n } = useTranslation();
  const currentLocale = i18n.language === "uk" ? uk : enUS;
  const { mode = "range" } = props;

  // --- States ---
  const [isOpen, setIsOpen] = useState(false);
  const [tempRange, setTempRange] = useState<DateRange | undefined>();
  const [tempDate, setTempDate] = useState<Date | undefined>();

  // --- Inputs ---
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const dayRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  // --- 1. ІНІЦІАЛІЗАЦІЯ ---
  useEffect(() => {
    if (mode === "range") {
      setTempRange({
        from: props.dateFrom ? new Date(props.dateFrom) : undefined,
        to: props.dateTo ? new Date(props.dateTo) : undefined,
      });
    } else {
      const inputDate = props.dateFrom || props.date;
      if (inputDate) {
        const d = new Date(inputDate);
        if (isValid(d)) {
          setTempDate(d);
          setDay(format(d, "dd"));
          setMonth(format(d, "MM"));
          setYear(format(d, "yyyy"));
        }
      }
    }
  }, [mode, props.dateFrom, props.dateTo]); // Слухаємо зміни пропсів

  // --- 2. INTERNAL HELPER: SEND DATA UP ---
  const sendDataToParent = (from?: Date, to?: Date) => {
    if (props.onChange) {
      props.onChange({ from, to });
    }

    if (props.onDateChange && from) {
      props.onDateChange(from.getTime());
    }
  };

  const tryUpdateDate = (d: string, m: string, y: string) => {
    if (d.length === 2 && m.length === 2 && y.length === 4) {
      const str = `${d}.${m}.${y}`;
      const parsed = parse(str, "dd.MM.yyyy", new Date());
      if (
        isValid(parsed) &&
        parsed.getFullYear() > 1900 &&
        format(parsed, "dd.MM.yyyy") === str
      ) {
        setTempDate(parsed);
        sendDataToParent(parsed, undefined);
      }
    }
  };

  // --- 3. EVENT HANDLERS ---

  // Вибір мишкою в календарі (тільки оновлює візуальний стейт)
  const handleRangeSelect = (range: DateRange | undefined) => {
    // console.log("📅 [Calendar] Selected temporarily:", range);
    setTempRange(range);
  };

  const handleSingleSelect = (date: Date | undefined) => {
    setTempDate(date);
    if (date) {
      setDay(format(date, "dd"));
      setMonth(format(date, "MM"));
      setYear(format(date, "yyyy"));
      sendDataToParent(date, undefined);
    }
  };

  // Кнопка "Застосувати" (Apply)
  const handleApply = () => {
    // console.log("✅ [Button] Apply clicked. Payload:", tempRange);

    if (mode === "range") {
      if (tempRange?.from) {
        const fromDate = startOfDay(tempRange.from);
        const toDate = tempRange.to
          ? endOfDay(tempRange.to)
          : endOfDay(fromDate);
        sendDataToParent(fromDate, toDate);
      }
    } else {
      if (tempDate) sendDataToParent(tempDate, undefined);
    }
    setIsOpen(false);
  };

  // Шорткати (Сьогодні, Вчора...) - ПРАЦЮЮТЬ МИТТЄВО
  const applyPreset = (preset: string) => {
    // console.log("⚡ [Shortcut] Clicked:", preset);
    const now = new Date();
    let from = now,
      to = now;

    switch (preset) {
      case "today":
        from = startOfDay(now);
        to = endOfDay(now);
        break;
      case "yesterday":
        const y = subDays(now, 1);
        from = startOfDay(y);
        to = endOfDay(y);
        break;
      case "last7":
        from = startOfDay(subDays(now, 6));
        to = endOfDay(now);
        break;
      case "thisMonth":
        from = startOfMonth(now);
        to = endOfMonth(now);
        break;
      case "lastMonth":
        const lm = subMonths(now, 1);
        from = startOfMonth(lm);
        to = endOfMonth(lm);
        break;
      case "thisYear":
        from = startOfYear(now);
        to = endOfYear(now);
        break;
    }

    // Оновлюємо внутрішній стейт, щоб календар перемалювався
    setTempRange({ from, to });
    // І ВІДРАЗУ відправляємо наверх
    sendDataToParent(from, to);
    setIsOpen(false);
  };

  // --- Inputs Handlers ---
  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (parseInt(val) > 31) val = "31";
    setDay(val);
    if (val.length === 2) {
      monthRef.current?.focus();
      tryUpdateDate(val, month, year);
    }
  };
  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (parseInt(val) > 12) val = "12";
    setMonth(val);
    if (val.length === 2) {
      yearRef.current?.focus();
      tryUpdateDate(day, val, year);
    }
  };
  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 4);
    setYear(val);
    if (val.length === 4) tryUpdateDate(day, month, val);
  };
  const handleKeyDown = (e: React.KeyboardEvent, field: "d" | "m" | "y") => {
    if (e.key === "Backspace") {
      if (field === "m" && month === "") dayRef.current?.focus();
      if (field === "y" && year === "") monthRef.current?.focus();
    }
    if (e.key === "Enter") setIsOpen(false);
  };
  const handleWrapperClick = () => {
    if (
      document.activeElement !== dayRef.current &&
      document.activeElement !== monthRef.current &&
      document.activeElement !== yearRef.current
    ) {
      dayRef.current?.focus();
    }
  };

  let rangeLabel = t("legacy:filters.select_period_title");
  if (mode === "range") {
    const displayFrom = tempRange?.from || props.dateFrom;
    const displayTo = tempRange?.to || props.dateTo;
    if (displayFrom) {
      rangeLabel = `${format(displayFrom, "dd MMM", { locale: currentLocale })} - ${displayTo ? format(displayTo, "dd MMM", { locale: currentLocale }) : "..."}`;
    }
  }

  return {
    state: {
      isOpen,
      tempRange,
      tempDate,
      day,
      month,
      year,
      rangeLabel,
      currentLocale,
      mode,
    },
    refs: { dayRef, monthRef, yearRef },
    actions: {
      setIsOpen,
      handleDayChange,
      handleMonthChange,
      handleYearChange,
      handleKeyDown,
      handleWrapperClick,
      handleRangeSelect,
      handleSingleSelect,
      handleApply,
      applyPreset,
    },
    t,
  };
};
