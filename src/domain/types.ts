export type ItemCategory = "cd" | "vinyl" | "boxset" | "other";

export type ItemStatus = "new" | "openbox" | "used";

export type Currency =
  | "EUR"
  | "PEN"
  | "JPY"
  | "USD"
  | "CAD"
  | "AUD"
  | "GBP";

export const ITEM_CATEGORIES: { id: ItemCategory; label: string; icon: string }[] = [
  { id: "cd", label: "CD", icon: "disc" },
  { id: "vinyl", label: "Vinilo", icon: "disc-3" },
  { id: "boxset", label: "Box Set", icon: "box" },
  { id: "other", label: "Otro", icon: "tag" },
];

export const ITEM_STATUSES: { id: ItemStatus; label: string; color: string }[] = [
  { id: "new", label: "Nuevo / Sellado", color: "text-emerald-500 bg-emerald-500/10" },
  { id: "openbox", label: "Open Box", color: "text-amber-500 bg-amber-500/10" },
  { id: "used", label: "Usado", color: "text-sky-500 bg-sky-500/10" },
];

export const CURRENCIES: { id: Currency; symbol: string; label: string }[] = [
  { id: "PEN", symbol: "S/", label: "Soles (PEN)" },
  { id: "USD", symbol: "$", label: "Dólares USD" },
  { id: "EUR", symbol: "€", label: "Euros (EUR)" },
  { id: "JPY", symbol: "¥", label: "Yenes (JPY)" },
  { id: "CAD", symbol: "C$", label: "Dólares CAD" },
  { id: "AUD", symbol: "A$", label: "Dólares AUD" },
  { id: "GBP", symbol: "£", label: "Libras (GBP)" },
];

export interface Item {
  id?: number;
  name: string;
  categories: ItemCategory[];
  status: ItemStatus;

  // Price details
  price_currency: Currency;
  price_amount_cents: number;
  price_includes_taxes: boolean;
  price_tax_amount_cents?: number;
  price_tax_percentage?: number; // e.g. 3250 = 32.50%

  // Optional details
  purchase_datetime?: string; // ISO 8601 string
  photo_urls?: string[];
  tags?: string[];
  barcodes?: string[];

  // Audit
  created_at: string;
  updated_at?: string;
}

/** Import batch. Shipping, when present, belongs to the wave — never to the SKU. */
export interface Wave {
  id?: number;
  name: string;
  shipping_currency?: Currency;
  shipping_amount_cents?: number;
  created_at: string;
  updated_at?: string;
}

/** One SKU inside a wave. Quantity is the number of instances in that batch. */
export interface WaveItem {
  id?: number;
  wave_id: number;
  item_id: number;
  quantity: number;
}

export type ThemePreference = "noom" | "noom-dark";
export type ThemeStorageMode = "noom" | "noom-dark" | "auto" | "system";

export interface AppConfig {
  id: "global";
  themeMode: ThemeStorageMode;
  autoDarkAt: string; // "HH:mm", default "19:00"
  defaultCurrency: Currency;
  uiZoom: number;
  updatedAt: string;
}

export const DEFAULT_APP_CONFIG: AppConfig = {
  id: "global",
  themeMode: "auto",
  autoDarkAt: "19:00",
  defaultCurrency: "PEN",
  uiZoom: 100,
  updatedAt: new Date().toISOString(),
};
