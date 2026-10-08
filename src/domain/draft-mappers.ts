import {
  createWaveDraft,
  type ItemDraft,
  type TaxDraftPhase,
  type WaveDraft,
} from "@/domain/drafts";
import { centsToDecimal } from "@/domain/money";
import type { Item, Wave, WaveItem } from "@/domain/types";

export function taxDraftFromItem(item: Item): {
  taxesPhase: TaxDraftPhase;
  confirmedTax: ItemDraft["confirmedTax"];
} {
  if (item.price_tax_percentage && item.price_tax_percentage > 0) {
    return {
      taxesPhase: "confirmed",
      confirmedTax: {
        mode: "primary",
        value: String(item.price_tax_percentage / 100),
      },
    };
  }
  if (item.price_tax_amount_cents && item.price_tax_amount_cents > 0) {
    return {
      taxesPhase: "confirmed",
      confirmedTax: {
        mode: "secondary",
        value: centsToDecimal(item.price_tax_amount_cents),
      },
    };
  }
  return { taxesPhase: "idle", confirmedTax: null };
}

export function itemToDraft(item: Item): ItemDraft {
  const tax = taxDraftFromItem(item);
  return {
    step: 5,
    editingId: item.id ?? null,
    name: item.name,
    categories: [...item.categories],
    status: item.status,
    currency: item.price_currency,
    amount: centsToDecimal(item.price_amount_cents),
    taxesPhase: tax.taxesPhase,
    confirmedTax: tax.confirmedTax,
    images: item.photo_urls ? [...item.photo_urls] : [],
    tags: item.tags ? [...item.tags] : [],
    barcodes: item.barcodes ? [...item.barcodes] : [],
    saved: null,
  };
}

export function waveToDraft(wave: Wave, lines: WaveItem[]): WaveDraft {
  const blank = createWaveDraft();
  const hasShipping =
    wave.shipping_amount_cents != null &&
    wave.shipping_amount_cents > 0 &&
    wave.shipping_currency != null;

  return {
    ...blank,
    step: 3,
    editingId: wave.id ?? null,
    name: wave.name,
    lines: lines.map((line) => ({
      itemId: line.item_id,
      quantity: line.quantity,
    })),
    shippingAmount: hasShipping
      ? centsToDecimal(wave.shipping_amount_cents!)
      : "",
    shippingCurrency: wave.shipping_currency ?? blank.shippingCurrency,
    shippingPhase: hasShipping ? "editing" : "idle",
  };
}
