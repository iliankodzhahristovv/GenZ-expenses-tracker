/**
 * Currency utility functions with exchange rates
 */

// Exchange rates relative to USD (base currency)
// Updated: October 2025
export const EXCHANGE_RATES: { [key: string]: number } = {
  "Dollar": 1.0,        // USD (base currency)
  "Euro": 0.92,         // 1 USD = 0.92 EUR
};

export function getCurrencySymbol(currency: string): string {
  const currencyMap: { [key: string]: string } = {
    "Dollar": "$",
    "Euro": "€",
  };

  return currencyMap[currency] || "$";
}

export function getCurrencyCode(currency: string): string {
  const codeMap: { [key: string]: string } = {
    "Dollar": "USD",
    "Euro": "EUR",
  };

  return codeMap[currency] || "USD";
}

/**
 * Convert amount from one currency to another
 * @param amount - The amount to convert
 * @param fromCurrency - The source currency name (e.g., "Dollar", "Euro")
 * @param toCurrency - The target currency name
 * @returns The converted amount
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // Convert from source currency to USD (base)
  const amountInUSD = amount / EXCHANGE_RATES[fromCurrency];
  
  // Convert from USD to target currency
  const convertedAmount = amountInUSD * EXCHANGE_RATES[toCurrency];
  
  return convertedAmount;
}

/**
 * Convert amount to USD (base currency for storage)
 * @param amount - The amount to convert
 * @param fromCurrency - The source currency name
 * @returns The amount in USD
 */
export function convertToBaseCurrency(amount: number, fromCurrency: string): number {
  return amount / EXCHANGE_RATES[fromCurrency];
}

/**
 * Convert amount from USD (base currency) to display currency
 * @param amount - The amount in USD
 * @param toCurrency - The target currency name
 * @returns The amount in target currency
 */
export function convertFromBaseCurrency(amount: number, toCurrency: string): number {
  return amount * EXCHANGE_RATES[toCurrency];
}

/**
 * Format amount with currency symbol
 * @param amount - The amount to format
 * @param currency - The currency name
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string with currency symbol
 */
export function formatCurrencyAmount(
  amount: number,
  currency: string,
  decimals: number = 2
): string {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${amount.toFixed(decimals)}`;
}

