import { createContext, useState, useCallback, useMemo } from "react";

const RATES = {
  USD: 1,
  INR: 83.5,
  EUR: 0.92,
};

const SYMBOLS = {
  USD: "$",
  INR: "₹",
  EUR: "€",
};

export const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState("USD");

  /**
   * Convert an amount from one currency to the selected display currency
   * @param {number} amount
   * @param {string} fromCurrency – source currency code
   * @returns {number} converted amount
   */
  const convert = useCallback(
    (amount, fromCurrency = "USD") => {
      if (fromCurrency === currency) return amount;
      // Convert to USD first, then to target
      const inUSD = amount / RATES[fromCurrency];
      return inUSD * RATES[currency];
    },
    [currency]
  );

  /**
   * Format a number as currency string
   */
  const formatCurrency = useCallback(
    (amount) => {
      const symbol = SYMBOLS[currency] || "$";
      return `${symbol}${amount.toFixed(2)}`;
    },
    [currency]
  );

  const value = useMemo(
    () => ({
      currency,
      setCurrency,
      convert,
      formatCurrency,
      rates: RATES,
      symbols: SYMBOLS,
    }),
    [currency, convert, formatCurrency]
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}
