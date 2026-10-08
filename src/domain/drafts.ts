import type { Currency, ItemCategory, ItemStatus } from "@/domain/types";
import { todayDateInput } from "@/domain/dates";

export type DraftId = "item" | "wave";

export type ItemWizardStep = 1 | 2 | 3 | 4 | 5;
export type WaveWizardStep = 1 | 2 | 3;

export type TaxDraftMode = "primary" | "secondary";
export type TaxDraftPhase = "idle" | "editing" | "confirmed";
export type ShippingDraftPhase = "idle" | "editing";

export interface TaxDraft {
  mode: TaxDraftMode;
  value: string;
}

export interface DraftItemFilters {
  query: string;
  types: ItemCategory[];
  sort: "a-to-z" | "z-to-a" | "recent" | "oldest";
  fromDate: string;
  toDate: string;
}

export interface ItemSavedSnapshot {
  id: number;
  name: string;
  price: { amountCents: number; currency: Currency };
  tax?: { amountCents: number; currency: Currency; estimated?: boolean };
}

export interface ItemDraft {
  step: ItemWizardStep;
  name: string;
  categories: ItemCategory[];
  status: ItemStatus | null;
  currency: Currency;
  amount: string;
  taxesPhase: TaxDraftPhase;
  confirmedTax: TaxDraft | null;
  images: string[];
  tags: string[];
  barcodes: string[];
  saved: ItemSavedSnapshot | null;
}

export interface WaveLineDraft {
  itemId: number;
  quantity: number;
}

export interface WaveSavedSnapshot {
  id: number;
  name: string;
  price: { amountCents: number; currency: Currency };
  shipping?: { amountCents: number; currency: Currency };
  items: {
    categories: ItemCategory[];
    name: string;
    priceAmountCents: number;
    priceCurrency: Currency;
    quantity: number;
    hasTaxes: boolean;
    hasShipping: boolean;
  }[];
}

export interface WaveDraft {
  step: WaveWizardStep;
  name: string;
  lines: WaveLineDraft[];
  filters: DraftItemFilters;
  shippingAmount: string;
  shippingCurrency: Currency;
  shippingPhase: ShippingDraftPhase;
  /** Set when the user leaves to register an item and should return here. */
  awaitingItem: boolean;
  saved: WaveSavedSnapshot | null;
}

export function createItemDraft(): ItemDraft {
  return {
    step: 1,
    name: "",
    categories: [],
    status: null,
    currency: "PEN",
    amount: "",
    taxesPhase: "idle",
    confirmedTax: null,
    images: [],
    tags: [],
    barcodes: [],
    saved: null,
  };
}

export function createWaveDraft(): WaveDraft {
  return {
    step: 1,
    name: "",
    lines: [],
    filters: {
      query: "",
      types: [],
      sort: "a-to-z",
      fromDate: "2026-01-01",
      toDate: todayDateInput(),
    },
    shippingAmount: "",
    shippingCurrency: "PEN",
    shippingPhase: "idle",
    awaitingItem: false,
    saved: null,
  };
}
