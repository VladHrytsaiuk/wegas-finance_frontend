import React, { memo } from "react";
import { NumericFormat } from "react-number-format";
import * as S from "./styles";

interface PriceInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange"
  > {
  value: number; // Always a number (coins or integer)
  onChange: (val: number) => void;
  isCurrency?: boolean;
}

/**
 * PriceInput Component for Itemization Table
 * 
 * Features:
 * 1. Real-time thousands separators (spaces).
 * 2. Handles both raw numeric values (quantity) and currency values (price).
 * 3. Syncs correctly with backend numeric state.
 */
export const PriceInput = memo(
  ({ value, onChange, isCurrency = false, ...props }: PriceInputProps) => {
    
    const handleChange = (values: { value: string; floatValue: number | undefined }) => {
      const rawString = values.value; // The unformatted string value
      
      if (rawString === "") {
        onChange(0);
        return;
      }

      const numericValue = parseFloat(rawString);
      if (isNaN(numericValue)) {
        onChange(0);
        return;
      }

      // If it's currency, we store it as "coins" (cents * 100)
      const backendValue = isCurrency ? Math.round(numericValue * 100) : numericValue;
      onChange(backendValue);
    };

    // Convert backend value to display value (e.g. 1000 coins -> 10.00)
    const displayValue = isCurrency ? value / 100 : value;

    return (
      <NumericFormat
        {...props}
        customInput={S.TableInput}
        value={displayValue === 0 ? "" : displayValue}
        onValueChange={handleChange}
        thousandSeparator=" "
        decimalScale={isCurrency ? 2 : 3} // Price has 2, Quantity might have more
        fixedDecimalScale={false}
        allowNegative={false}
        inputMode="decimal"
        autoComplete="off"
      />
    );
  }
);

PriceInput.displayName = "PriceInput";
