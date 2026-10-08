import type { TaxDraft } from "@/domain/drafts";
import type { Currency } from "@/domain/types";
import { calculateTaxAmount, decimalToCents } from "@/domain/money";

export interface ItemTaxFields {
  price_includes_taxes: boolean;
  price_tax_amount_cents?: number;
  price_tax_percentage?: number;
}

export interface SuccessTaxLine {
  amountCents: number;
  estimated: boolean;
}

/**
 * Maps the wizard tax input onto item columns.
 * Rate mode stores basis points (3250 = 32.50%) and a calculated amount.
 * Amount mode stores a fixed tax that is not included in the purchase price.
 */
export function taxFieldsFromDraft(
  priceCents: number,
  tax: TaxDraft | null
): { fields: ItemTaxFields; success?: SuccessTaxLine } {
  if (!tax || !tax.value.trim()) {
    return { fields: { price_includes_taxes: false } };
  }

  if (tax.mode === "primary") {
    const percent = Number.parseFloat(tax.value);
    const basisPoints = Number.isFinite(percent)
      ? Math.max(0, Math.round(percent * 100))
      : 0;
    const amountCents = calculateTaxAmount(priceCents, basisPoints);
    return {
      fields: {
        price_includes_taxes: true,
        price_tax_percentage: basisPoints,
        price_tax_amount_cents: amountCents,
      },
      success: { amountCents, estimated: true },
    };
  }

  const amountCents = decimalToCents(tax.value);
  return {
    fields: {
      price_includes_taxes: false,
      price_tax_amount_cents: amountCents,
    },
    success: { amountCents, estimated: false },
  };
}

export interface PricedLine {
  priceAmountCents: number;
  priceCurrency: Currency;
  quantity: number;
}

/**
 * Sums price × quantity for the currency that appears on the most lines.
 * Tie goes to the first line's currency. Other currencies stay visible per row.
 */
export function wavePriceTotal(lines: PricedLine[]): {
  amountCents: number;
  currency: Currency;
} {
  if (lines.length === 0) {
    return { amountCents: 0, currency: "PEN" };
  }

  const counts = new Map<Currency, number>();
  for (const line of lines) {
    counts.set(line.priceCurrency, (counts.get(line.priceCurrency) ?? 0) + 1);
  }

  let currency = lines[0].priceCurrency;
  let best = -1;
  for (const line of lines) {
    const count = counts.get(line.priceCurrency) ?? 0;
    if (count > best) {
      best = count;
      currency = line.priceCurrency;
    }
  }

  const amountCents = lines
    .filter((line) => line.priceCurrency === currency)
    .reduce((sum, line) => sum + line.priceAmountCents * line.quantity, 0);

  return { amountCents, currency };
}

/** Current-wave share of shipping for one line. Not stored on the item. */
export function proratedLineShippingCents(
  shippingTotalCents: number,
  quantity: number,
  totalQuantity: number
): number {
  if (shippingTotalCents <= 0 || quantity <= 0 || totalQuantity <= 0) return 0;
  return Math.round((shippingTotalCents * quantity) / totalQuantity);
}

export function lineHasTaxes(item: {
  price_tax_amount_cents?: number;
  price_tax_percentage?: number;
}): boolean {
  return Boolean(item.price_tax_amount_cents || item.price_tax_percentage);
}
