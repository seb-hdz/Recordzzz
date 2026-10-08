import {
  AppConfig,
  Currency,
  DEFAULT_APP_CONFIG,
  Item,
  ItemCategory,
  ItemStatus,
  ThemeStorageMode,
  Wave,
  WaveItem,
} from "./types";

const MAX_ITEMS = 25_000;
const MAX_WAVES = 25_000;
const MAX_NAME_LEN = 500;
const MAX_TAGS = 50;
const MAX_TAG_LEN = 64;
const MAX_BARCODES = 20;
const MAX_BARCODE_LEN = 64;
const MAX_PHOTOS = 20;
const MAX_URL_LEN = 2048;

const CATEGORIES = new Set<ItemCategory>(["cd", "vinyl", "boxset", "other"]);
const STATUSES = new Set<ItemStatus>(["new", "openbox", "used"]);
const CURRENCIES = new Set<Currency>([
  "EUR",
  "PEN",
  "JPY",
  "USD",
  "CAD",
  "AUD",
  "GBP",
]);
const THEME_MODES = new Set<ThemeStorageMode>([
  "noom",
  "noom-dark",
  "auto",
  "system",
]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

function asFiniteNumber(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return value;
}

function asNonNegInt(value: unknown): number | undefined {
  const n = asFiniteNumber(value);
  if (n === undefined || n < 0 || !Number.isInteger(n)) return undefined;
  return n;
}

/** Allow only safe photo URL schemes (no javascript: etc.). */
export function sanitizePhotoUrl(url: unknown): string | null {
  if (typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed || trimmed.length > MAX_URL_LEN) return null;

  if (trimmed.startsWith("/") || trimmed.startsWith("./")) {
    if (trimmed.includes("://") || trimmed.toLowerCase().includes("javascript:")) {
      return null;
    }
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return trimmed;
    }
    if (parsed.protocol === "blob:") {
      return trimmed;
    }
    if (
      parsed.protocol === "data:" &&
      /^data:image\/[a-z0-9.+-]+;/i.test(trimmed)
    ) {
      return trimmed;
    }
    return null;
  } catch {
    return null;
  }
}

function sanitizeStringList(
  raw: unknown,
  maxItems: number,
  maxLen: number
): string[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const values: string[] = [];
  for (const entry of raw.slice(0, maxItems)) {
    if (typeof entry !== "string") continue;
    const cleaned = entry.trim().slice(0, maxLen);
    if (cleaned && !values.includes(cleaned)) values.push(cleaned);
  }
  return values.length > 0 ? values : undefined;
}

function sanitizeTags(raw: unknown): string[] | undefined {
  return sanitizeStringList(raw, MAX_TAGS, MAX_TAG_LEN);
}

function sanitizeBarcodes(raw: unknown): string[] | undefined {
  return sanitizeStringList(raw, MAX_BARCODES, MAX_BARCODE_LEN);
}

function sanitizeCategories(raw: unknown): ItemCategory[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const cats: ItemCategory[] = [];
  for (const c of raw) {
    if (typeof c === "string" && CATEGORIES.has(c as ItemCategory)) {
      if (!cats.includes(c as ItemCategory)) cats.push(c as ItemCategory);
    }
  }
  return cats.length > 0 ? cats : null;
}

export function sanitizeItem(raw: unknown): Item | null {
  if (!isPlainObject(raw)) return null;

  const name =
    typeof raw.name === "string" ? raw.name.trim().slice(0, MAX_NAME_LEN) : "";
  if (!name) return null;

  const categories = sanitizeCategories(raw.categories);
  if (!categories) return null;

  const status =
    typeof raw.status === "string" && STATUSES.has(raw.status as ItemStatus)
      ? (raw.status as ItemStatus)
      : null;
  if (!status) return null;

  const currency =
    typeof raw.price_currency === "string" &&
    CURRENCIES.has(raw.price_currency as Currency)
      ? (raw.price_currency as Currency)
      : null;
  if (!currency) return null;

  const amount = asNonNegInt(raw.price_amount_cents);
  if (amount === undefined) return null;

  const includesTaxes = Boolean(raw.price_includes_taxes);

  const taxAmount = asNonNegInt(raw.price_tax_amount_cents);
  const taxPct = asNonNegInt(raw.price_tax_percentage);

  let purchase_datetime: string | undefined;
  if (typeof raw.purchase_datetime === "string") {
    const d = new Date(raw.purchase_datetime);
    if (!Number.isNaN(d.getTime())) {
      purchase_datetime = d.toISOString();
    }
  }

  let photo_urls: string[] | undefined;
  if (Array.isArray(raw.photo_urls)) {
    const urls = raw.photo_urls
      .slice(0, MAX_PHOTOS)
      .map(sanitizePhotoUrl)
      .filter((u): u is string => u !== null);
    if (urls.length > 0) photo_urls = urls;
  }

  const createdAt =
    typeof raw.created_at === "string" &&
    !Number.isNaN(new Date(raw.created_at).getTime())
      ? new Date(raw.created_at).toISOString()
      : new Date().toISOString();

  const updatedAt =
    typeof raw.updated_at === "string" &&
    !Number.isNaN(new Date(raw.updated_at).getTime())
      ? new Date(raw.updated_at).toISOString()
      : undefined;

  const id = asNonNegInt(raw.id);

  const item: Item = {
    name,
    categories,
    status,
    price_currency: currency,
    price_amount_cents: amount,
    price_includes_taxes: includesTaxes,
    price_tax_amount_cents: taxAmount,
    price_tax_percentage: taxPct,
    purchase_datetime,
    photo_urls,
    tags: sanitizeTags(raw.tags),
    barcodes: sanitizeBarcodes(raw.barcodes),
    created_at: createdAt,
    updated_at: updatedAt,
  };

  if (id !== undefined && id > 0) {
    item.id = id;
  }

  return item;
}

export function sanitizeConfig(raw: unknown): AppConfig {
  if (!isPlainObject(raw)) return { ...DEFAULT_APP_CONFIG };

  const themeMode =
    typeof raw.themeMode === "string" &&
    THEME_MODES.has(raw.themeMode as ThemeStorageMode)
      ? (raw.themeMode as ThemeStorageMode)
      : DEFAULT_APP_CONFIG.themeMode;

  const autoDarkAt =
    typeof raw.autoDarkAt === "string" &&
    /^\d{2}:\d{2}$/.test(raw.autoDarkAt)
      ? raw.autoDarkAt
      : DEFAULT_APP_CONFIG.autoDarkAt;

  const defaultCurrency =
    typeof raw.defaultCurrency === "string" &&
    CURRENCIES.has(raw.defaultCurrency as Currency)
      ? (raw.defaultCurrency as Currency)
      : DEFAULT_APP_CONFIG.defaultCurrency;

  const uiZoom = asFiniteNumber(raw.uiZoom);
  const zoom =
    uiZoom !== undefined && uiZoom >= 75 && uiZoom <= 150
      ? Math.round(uiZoom)
      : DEFAULT_APP_CONFIG.uiZoom;

  return {
    id: "global",
    themeMode,
    autoDarkAt,
    defaultCurrency,
    uiZoom: zoom,
    updatedAt: new Date().toISOString(),
  };
}

export function sanitizeWave(raw: unknown): Wave | null {
  if (!isPlainObject(raw)) return null;
  const name =
    typeof raw.name === "string" ? raw.name.trim().slice(0, MAX_NAME_LEN) : "";
  if (!name) return null;

  const currency =
    typeof raw.shipping_currency === "string" &&
    CURRENCIES.has(raw.shipping_currency as Currency)
      ? (raw.shipping_currency as Currency)
      : undefined;
  const amount = asNonNegInt(raw.shipping_amount_cents);
  const hasShipping = currency !== undefined && amount !== undefined && amount > 0;

  const createdAt =
    typeof raw.created_at === "string" &&
    !Number.isNaN(new Date(raw.created_at).getTime())
      ? new Date(raw.created_at).toISOString()
      : new Date().toISOString();

  const updatedAt =
    typeof raw.updated_at === "string" &&
    !Number.isNaN(new Date(raw.updated_at).getTime())
      ? new Date(raw.updated_at).toISOString()
      : undefined;

  const id = asNonNegInt(raw.id);
  const wave: Wave = {
    name,
    created_at: createdAt,
    updated_at: updatedAt,
  };
  if (hasShipping && currency && amount !== undefined) {
    wave.shipping_currency = currency;
    wave.shipping_amount_cents = amount;
  }
  if (id !== undefined && id > 0) wave.id = id;
  return wave;
}

export function sanitizeWaveItem(raw: unknown): WaveItem | null {
  if (!isPlainObject(raw)) return null;
  const waveId = asNonNegInt(raw.wave_id);
  const itemId = asNonNegInt(raw.item_id);
  const quantity = asNonNegInt(raw.quantity);
  if (!waveId || !itemId || !quantity) return null;
  const id = asNonNegInt(raw.id);
  const line: WaveItem = {
    wave_id: waveId,
    item_id: itemId,
    quantity,
  };
  if (id !== undefined && id > 0) line.id = id;
  return line;
}

export interface SanitizedBackup {
  items: Item[];
  waves: Wave[];
  waveItems: WaveItem[];
  config: AppConfig;
}

export function parseAndSanitizeBackup(raw: unknown): SanitizedBackup {
  if (!isPlainObject(raw)) {
    throw new Error("Formato de copia de seguridad inválido");
  }

  if (raw.appName !== "recordzzz") {
    throw new Error("La copia no pertenece a Recordzzz");
  }

  if (!Array.isArray(raw.items)) {
    throw new Error("La copia no incluye una lista de artículos válida");
  }

  if (raw.items.length > MAX_ITEMS) {
    throw new Error(
      `La copia supera el máximo de ${MAX_ITEMS} artículos permitidos`
    );
  }

  const items: Item[] = [];
  for (const entry of raw.items) {
    const item = sanitizeItem(entry);
    if (item) items.push(item);
  }

  if (raw.items.length > 0 && items.length === 0) {
    throw new Error("Ningún artículo de la copia pasó la validación");
  }

  const itemIds = new Set(
    items.map((item) => item.id).filter((id): id is number => id !== undefined)
  );

  const waves: Wave[] = [];
  if (Array.isArray(raw.waves)) {
    if (raw.waves.length > MAX_WAVES) {
      throw new Error(
        `La copia supera el máximo de ${MAX_WAVES} importaciones permitidas`
      );
    }
    for (const entry of raw.waves) {
      const wave = sanitizeWave(entry);
      if (wave) waves.push(wave);
    }
  }

  const waveIds = new Set(
    waves.map((wave) => wave.id).filter((id): id is number => id !== undefined)
  );

  const waveItems: WaveItem[] = [];
  if (Array.isArray(raw.waveItems)) {
    const seen = new Set<string>();
    for (const entry of raw.waveItems) {
      const line = sanitizeWaveItem(entry);
      if (!line) continue;
      if (!waveIds.has(line.wave_id) || !itemIds.has(line.item_id)) continue;
      const key = `${line.wave_id}:${line.item_id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      waveItems.push(line);
    }
  }

  const wavesWithLines = waves.filter((wave) =>
    waveItems.some((line) => line.wave_id === wave.id)
  );

  const config = sanitizeConfig(raw.config);

  return { items, waves: wavesWithLines, waveItems, config };
}
