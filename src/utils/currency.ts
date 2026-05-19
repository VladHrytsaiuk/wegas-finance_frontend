import React from "react";
import { CurrencySymbol } from "../components/ui/CurrencySymbol";

export const CURRENCY_SYMBOLS: Record<string, string> = {
  UAH: "₴",
  USD: "$",
  EUR: "€",
};

export const getCurrencyOptions = (currencies: string[] = ["UAH", "USD", "EUR"]) => {
  return currencies.map((code) => ({
    value: code,
    label: code,
    icon: React.createElement(CurrencySymbol, { symbol: CURRENCY_SYMBOLS[code] || code }),
  }));
};
