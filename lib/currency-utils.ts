/**
 * Currency utility functions with exchange rates using ISO 4217 currency codes
 */

// Exchange rates relative to USD (base currency)
// Updated: October 2025
// Uses ISO 4217 currency codes (e.g., USD, EUR, GBP)
export const EXCHANGE_RATES: { [key: string]: number } = {
  "USD": 1.0,        // US Dollar (base currency)
  "EUR": 0.92,       // Euro - 1 USD = 0.92 EUR
};

/**
 * Get currency symbol from ISO 4217 code
 * @param currencyCode - ISO 4217 currency code (e.g., USD, EUR)
 * @returns Currency symbol (e.g., $, €)
 */
export function getCurrencySymbol(currencyCode: string): string {
  const symbolMap: { [key: string]: string } = {
    "USD": "$",
    "EUR": "€",
    "GBP": "£",
    "JPY": "¥",
    "CNY": "¥",
    "INR": "₹",
    "CAD": "C$",
    "AUD": "A$",
  };

  return symbolMap[currencyCode] || "$";
}

/**
 * Get currency name from ISO 4217 code
 * @param currencyCode - ISO 4217 currency code (e.g., USD, EUR)
 * @returns Currency name (e.g., US Dollar, Euro)
 */
export function getCurrencyName(currencyCode: string): string {
  const nameMap: { [key: string]: string } = {
    "USD": "US Dollar",
    "EUR": "Euro",
    "GBP": "British Pound",
    "JPY": "Japanese Yen",
    "CNY": "Chinese Yuan",
    "INR": "Indian Rupee",
    "CAD": "Canadian Dollar",
    "AUD": "Australian Dollar",
  };

  return nameMap[currencyCode] || "US Dollar";
}

/**
 * Validate and get exchange rate with proper error handling
 * @param currencyCode - The ISO 4217 currency code
 * @param defaultToUSD - Whether to fall back to USD rate if currency not found (default: true)
 * @returns A valid exchange rate
 * @throws Error if rate is invalid and defaultToUSD is false
 */
function getValidatedRate(currencyCode: string, defaultToUSD: boolean = true): number {
  // Try to get the rate for the requested currency
  let rate = EXCHANGE_RATES[currencyCode];
  
  // If not found and defaultToUSD is enabled, try USD
  if ((rate === undefined || rate === null) && defaultToUSD) {
    rate = EXCHANGE_RATES['USD'] ?? 1;
  }
  
  // Validate the rate is a finite, non-zero number
  if (!Number.isFinite(rate) || rate === 0) {
    if (defaultToUSD) {
      // Ultimate fallback: return 1 (1:1 conversion with USD)
      console.warn(`Invalid exchange rate for ${currencyCode}, using 1:1 fallback`);
      return 1;
    } else {
      throw new Error(
        `Invalid exchange rate for currency ${currencyCode}: rate is ${rate}. ` +
        `Rate must be a finite, non-zero number.`
      );
    }
  }
  
  return rate;
}

/**
 * Convert amount from one currency to another
 * @param amount - The amount to convert
 * @param fromCurrencyCode - The source ISO 4217 currency code (e.g., "USD", "EUR")
 * @param toCurrencyCode - The target ISO 4217 currency code
 * @returns The converted amount
 */
export function convertCurrency(
  amount: number,
  fromCurrencyCode: string,
  toCurrencyCode: string
): number {
  if (fromCurrencyCode === toCurrencyCode) {
    return amount;
  }

  // Get validated rates with fallback to USD if not found
  const rateFrom = getValidatedRate(fromCurrencyCode, true);
  const rateTo = getValidatedRate(toCurrencyCode, true);

  // Convert from source currency to USD (base)
  const amountInUSD = amount / rateFrom;
  
  // Convert from USD to target currency
  const convertedAmount = amountInUSD * rateTo;
  
  return convertedAmount;
}

/**
 * Convert amount to USD (base currency for storage)
 * @param amount - The amount to convert
 * @param fromCurrencyCode - The source ISO 4217 currency code
 * @returns The amount in USD
 */
export function convertToBaseCurrency(amount: number, fromCurrencyCode: string): number {
  // Get validated rate with comprehensive checks for missing, non-finite, or zero rates
  const rateFrom = getValidatedRate(fromCurrencyCode, true);
  return amount / rateFrom;
}

/**
 * Convert amount from USD (base currency) to display currency
 * @param amount - The amount in USD
 * @param toCurrencyCode - The target ISO 4217 currency code
 * @returns The amount in target currency
 */
export function convertFromBaseCurrency(amount: number, toCurrencyCode: string): number {
  // Get validated rate with comprehensive checks for missing, non-finite, or zero rates
  const rateTo = getValidatedRate(toCurrencyCode, true);
  return amount * rateTo;
}

/**
 * Format amount with currency symbol
 * @param amount - The amount to format
 * @param currencyCode - The ISO 4217 currency code
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string with currency symbol
 */
export function formatCurrencyAmount(
  amount: number,
  currencyCode: string,
  decimals: number = 2
): string {
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol}${amount.toFixed(decimals)}`;
}

/**
 * Validate if an ISO 4217 currency code is supported
 * @param currencyCode - The ISO 4217 currency code to validate (e.g., "USD", "EUR")
 * @returns True if the currency code is valid and supported, false otherwise
 */
export function isValidCurrency(currencyCode: string): boolean {
  // Check if it matches ISO 4217 format (3 uppercase letters) and is in our supported list
  return /^[A-Z]{3}$/.test(currencyCode) && currencyCode in EXCHANGE_RATES;
}

/**
 * Get all supported ISO 4217 currency codes
 * @returns Array of supported ISO 4217 currency codes (e.g., ["USD", "EUR"])
 */
export function getSupportedCurrencies(): string[] {
  return Object.keys(EXCHANGE_RATES);
}

