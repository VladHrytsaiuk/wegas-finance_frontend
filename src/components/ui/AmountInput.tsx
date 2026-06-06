import React from "react";
import styled from "styled-components";
import { NumericFormat } from "react-number-format";

// Types for styling
interface StyledInputProps {
  $hasError?: boolean;
  $isLocked?: boolean;
}

// Reuse existing logic from StyledInput in Transaction Modal for consistency
const StyledInput = styled.input<StyledInputProps>`
  width: 100%;
  padding: 0.75rem 0.9rem;
  border: 1px solid
    ${(props) =>
      props.$hasError ? "var(--color-red-600)" : "var(--color-text-light)"};
  border-radius: 8px;
  background-color: ${(props) =>
    props.$isLocked ? "var(--color-bg-secondary)" : "var(--color-bg-surface)"};
  color: var(--color-text-main);
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.2s;
  cursor: ${(props) => (props.$isLocked ? "not-allowed" : "text")};

  &:hover {
    border-color: ${(props) =>
      props.$isLocked
        ? "var(--color-text-light)"
        : "var(--color-text-secondary)"};
  }
  &:focus {
    outline: none;
    border-color: ${(props) =>
      props.$isLocked ? "var(--color-text-light)" : "var(--color-brand-600)"};
    box-shadow: ${(props) =>
      props.$isLocked ? "none" : "0 0 0 3px var(--color-brand-50)"};
  }
`;

interface AmountInputProps {
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  hasError?: boolean;
  disabled?: boolean;
  className?: string;
  autoFocus?: boolean;
}

/**
 * AmountInput Component
 * 
 * Features:
 * 1. Real-time thousands separators (spaces) using react-number-format.
 * 2. Returns raw numeric string via onChange.
 * 3. Consistent styling with the project's design system.
 */
export const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChange,
  placeholder = "0.00",
  hasError = false,
  disabled = false,
  className,
  autoFocus,
}) => {
  return (
    <NumericFormat
      customInput={StyledInput}
      className={className}
      value={value}
      onValueChange={(values) => {
        // value: formatted string ("1 000.00")
        // floatValue: numeric value (1000.0)
        // value: string value ("1000") - THIS IS WHAT WE WANT
        onChange(values.value);
      }}
      thousandSeparator=" "
      decimalScale={2}
      fixedDecimalScale={false}
      allowNegative={false}
      placeholder={placeholder}
      $hasError={hasError}
      $isLocked={disabled}
      disabled={disabled}
      autoFocus={autoFocus}
      autoComplete="off"
    />
  );
};
