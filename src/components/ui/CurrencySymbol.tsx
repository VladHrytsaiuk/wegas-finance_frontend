import React from "react";
import styled from "styled-components";

const StyledSymbol = styled.span<{ $size?: string }>`
  font-size: 14px;
  font-weight: bold;
  width: ${props => props.$size || "100%"};
  height: ${props => props.$size || "100%"};
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-page);
  border-radius: ${props => props.$size ? "4px" : "inherit"};
  color: var(--color-text-main);
  border: ${props => props.$size ? "1px solid var(--color-border)" : "none"};
  flex-shrink: 0;
`;

interface CurrencySymbolProps {
  symbol: string;
  size?: string;
}

export const CurrencySymbol = ({ symbol, size }: CurrencySymbolProps) => (
  <StyledSymbol $size={size}>{symbol}</StyledSymbol>
);
