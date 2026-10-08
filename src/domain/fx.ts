import type { Currency } from "@/domain/types";

/** 1 unit of `base` equals `rates[quote]` units of quote. */
export interface FxQuote {
  base: Currency;
  /** Local calendar day (YYYY-MM-DD) when this quote may be reused. */
  day: string;
  rates: Partial<Record<Currency, number>>;
}

export function toBaseCents(
  amountCents: number,
  from: Currency,
  base: Currency,
  rates: Partial<Record<Currency, number>> | null | undefined
): number | null {
  if (!Number.isFinite(amountCents) || amountCents === 0) return 0;
  if (from === base) return amountCents;
  const quotePerBase = rates?.[from];
  if (!quotePerBase || quotePerBase <= 0) return null;
  return Math.round(amountCents / quotePerBase);
}
