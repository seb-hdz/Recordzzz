// TODO: see if a library like dinero.js can replace this

import { Currency, CURRENCIES } from "./types";

/**
 * Converts integer cents to decimal string with 2 decimal places.
 * Example: 20034 -> "200.34"
 */
export function centsToDecimal(cents: number): string {
  if (isNaN(cents) || cents === null || cents === undefined) return "0.00";
  return (cents / 100).toFixed(2);
}

/**
 * Converts decimal string/number to integer cents.
 * Example: "200.34" -> 20034, "50" -> 5000
 */
export function decimalToCents(val: string | number): number {
  if (typeof val === "number") {
    return Math.round(val * 100);
  }
  const clean = val.replace(/,/g, ".").trim();
  const num = parseFloat(clean);
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
}

/**
 * Formats cents into localized currency display.
 * Example: (20034, 'PEN') -> "S/ 200.34"
 */
export function formatCents(cents: number, currency: Currency = "PEN"): string {
  const meta = CURRENCIES.find((c) => c.id === currency);
  const symbol = meta ? meta.symbol : currency;
  const formatted = (cents / 100).toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol} ${formatted}`;
}

/**
 * Formats tax percentage stored as integer (e.g. 3250 -> 32.50%).
 */
export function formatTaxPercentage(taxBasisPoints?: number): string {
  if (!taxBasisPoints) return "0%";
  const pct = taxBasisPoints / 100;
  return `${pct.toFixed(2).replace(/\.00$/, "")}%`;
}

/**
 * Computes tax amount in cents given net price and tax percentage in basis points.
 */
export function calculateTaxAmount(
  amountCents: number,
  taxPercentageBasisPoints?: number
): number {
  if (!taxPercentageBasisPoints || taxPercentageBasisPoints <= 0) return 0;
  return Math.round((amountCents * taxPercentageBasisPoints) / 10000);
}
