import React, { useState, useEffect, useRef, memo } from "react";
import * as S from "./styles";

interface PriceInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange"
  > {
  value: number; // Завжди число (копійки або ціле)
  onChange: (val: number) => void;
  isCurrency?: boolean;
}

// --- HELPERS ---

const isValidInput = (val: string) => /^\d*\.?\d*$/.test(val);

const toDisplay = (val: number, isCurrency: boolean): string => {
  if (val === 0) return "";
  return isCurrency ? (val / 100).toString() : val.toString();
};

const toBackend = (val: string, isCurrency: boolean): number => {
  if (val === "" || val === ".") return 0;
  const num = parseFloat(val);
  if (isNaN(num)) return 0;
  return isCurrency ? Math.round(num * 100) : num;
};

export const PriceInput = memo(
  ({ value, onChange, isCurrency = false, ...props }: PriceInputProps) => {
    // Ініціалізація локального стейту
    const [localValue, setLocalValue] = useState(() =>
      toDisplay(value, isCurrency)
    );

    // Реф для уникнення циклічних оновлень при введенні
    const lastExternalValue = useRef(value);

    // 1. Sync from Parent (External Changes)
    useEffect(() => {
      // Оновлюємось тільки якщо прийшло НОВЕ значення ззовні (не те, що ми самі тільки що відправили)
      if (value !== lastExternalValue.current) {
        const newDisplay = toDisplay(value, isCurrency);
        // Важливо: не перетираємо "0.", якщо користувач в процесі введення, а прийшло 0
        if (toBackend(localValue, isCurrency) !== value) {
          setLocalValue(newDisplay);
        }
        lastExternalValue.current = value;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, isCurrency]);

    // 2. Handle User Typing
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let rawVal = e.target.value.replace(",", ".");

      // Валідація: тільки цифри та одна крапка
      if (!isValidInput(rawVal)) return;

      setLocalValue(rawVal);

      const numericValue = toBackend(rawVal, isCurrency);

      // Оновлюємо реф, щоб useEffect не перетер наше введення
      lastExternalValue.current = numericValue;
      onChange(numericValue);
    };

    // 3. Format on Blur (e.g. 10 -> 10.00)
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (localValue !== "") {
        const num = parseFloat(localValue);
        if (!isNaN(num)) {
          const formatted = isCurrency ? num.toFixed(2) : num.toString();
          setLocalValue(formatted);
        }
      }
      props.onBlur?.(e);
    };

    return (
      <S.TableInput
        {...props}
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        inputMode="decimal"
        autoComplete="off"
      />
    );
  }
);

PriceInput.displayName = "PriceInput";
