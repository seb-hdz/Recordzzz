import { isoInDateInputRange } from "@/domain/dates";
import type { Currency, Item, Wave } from "@/domain/types";

export interface HomeSummaryTotals {
  currency: Currency;
  /** Item spend (tax not double-counted) + shipping in the summary currency. */
  totalCents: number;
  /** Tax amounts for display as a breakdown group (already reflected in total). */
  taxCents: number;
  /** True when any included tax came from a percentage (estimated). */
  taxEstimated: boolean;
  shippingCents: number;
  waveCount: number;
  itemCount: number;
}

function itemActivityIso(item: Item): string {
  return item.purchase_datetime ?? item.created_at;
}

/**
 * Item contribution to spend in one currency.
 * Included taxes stay inside price; additive taxes are added once.
 */
export function itemSpendCents(item: Item): number {
  const price = item.price_amount_cents || 0;
  if (item.price_includes_taxes) return price;
  return price + (item.price_tax_amount_cents ?? 0);
}

export function computeHomeSummary(input: {
  items: Item[];
  waves: Wave[];
  currency: Currency;
  fromDate: string;
  toDate: string;
}): HomeSummaryTotals {
  const { currency, fromDate, toDate } = input;

  let totalCents = 0;
  let taxCents = 0;
  let taxEstimated = false;
  let itemCount = 0;

  for (const item of input.items) {
    if (!isoInDateInputRange(itemActivityIso(item), fromDate, toDate)) continue;
    if (item.price_currency !== currency) continue;

    itemCount += 1;
    totalCents += itemSpendCents(item);

    const tax = item.price_tax_amount_cents ?? 0;
    if (tax > 0) {
      taxCents += tax;
      if (item.price_tax_percentage != null && item.price_tax_percentage > 0) {
        taxEstimated = true;
      }
    }
  }

  let shippingCents = 0;
  let waveCount = 0;

  for (const wave of input.waves) {
    if (!isoInDateInputRange(wave.created_at, fromDate, toDate)) continue;
    waveCount += 1;

    const amount = wave.shipping_amount_cents ?? 0;
    if (amount > 0 && wave.shipping_currency === currency) {
      shippingCents += amount;
      totalCents += amount;
    }
  }

  return {
    currency,
    totalCents,
    taxCents,
    taxEstimated,
    shippingCents,
    waveCount,
    itemCount,
  };
}
