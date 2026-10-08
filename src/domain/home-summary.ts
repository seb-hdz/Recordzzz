import { isoInDateInputRange } from "@/domain/dates";
import { toBaseCents, type FxQuote } from "@/domain/fx";
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
  /** True when at least one amount was converted from another currency. */
  converted: boolean;
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

function convert(
  amountCents: number,
  from: Currency,
  base: Currency,
  rates: FxQuote["rates"] | null | undefined
): number | null {
  return toBaseCents(amountCents, from, base, rates);
}

export function computeHomeSummary(input: {
  items: Item[];
  waves: Wave[];
  currency: Currency;
  fromDate: string;
  toDate: string;
  fx?: FxQuote | null;
}): HomeSummaryTotals {
  const { currency, fromDate, toDate } = input;
  const rates = input.fx?.base === currency ? input.fx.rates : null;

  let totalCents = 0;
  let taxCents = 0;
  let taxEstimated = false;
  let itemCount = 0;
  let converted = false;

  for (const item of input.items) {
    if (!isoInDateInputRange(itemActivityIso(item), fromDate, toDate)) continue;
    itemCount += 1;

    const spend = convert(
      itemSpendCents(item),
      item.price_currency,
      currency,
      rates
    );
    if (spend == null) continue;
    if (item.price_currency !== currency) converted = true;
    totalCents += spend;

    const tax = convert(
      item.price_tax_amount_cents ?? 0,
      item.price_currency,
      currency,
      rates
    );
    if (tax != null && tax > 0) {
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
    const shippingCurrency = wave.shipping_currency;
    if (amount <= 0 || !shippingCurrency) continue;
    const shipping = convert(amount, shippingCurrency, currency, rates);
    if (shipping == null) continue;
    if (shippingCurrency !== currency) converted = true;
    shippingCents += shipping;
    totalCents += shipping;
  }

  return {
    currency,
    totalCents,
    taxCents,
    taxEstimated,
    shippingCents,
    waveCount,
    itemCount,
    converted,
  };
}
