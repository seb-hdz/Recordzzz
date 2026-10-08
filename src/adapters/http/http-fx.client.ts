import { CURRENCIES, type Currency } from "@/domain/types";
import type { FxQuote } from "@/domain/fx";
import type { FxRateClientPort } from "@/ports/fx.port";

const FAWAZ_JSDELIVR =
  "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies";
const FAWAZ_PAGES = "https://latest.currency-api.pages.dev/v1/currencies";
const FRANKFURTER = "https://api.frankfurter.dev/v2/rates";

function isCurrency(value: string): value is Currency {
  return CURRENCIES.some((entry) => entry.id === value);
}

async function getJson(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

function parseFawaz(base: Currency, raw: unknown): Omit<FxQuote, "day"> {
  if (!raw || typeof raw !== "object") {
    throw new Error("Respuesta de tipos de cambio inválida.");
  }
  const key = base.toLowerCase();
  const nested = (raw as Record<string, unknown>)[key];
  if (!nested || typeof nested !== "object") {
    throw new Error("La API no devolvió la moneda base.");
  }
  const rates: Partial<Record<Currency, number>> = { [base]: 1 };
  for (const [code, value] of Object.entries(nested as Record<string, unknown>)) {
    const upper = code.toUpperCase();
    if (!isCurrency(upper)) continue;
    if (typeof value !== "number" || value <= 0) continue;
    rates[upper] = value;
  }
  return { base, rates };
}

function parseFrankfurter(base: Currency, raw: unknown): Omit<FxQuote, "day"> {
  if (!raw || typeof raw !== "object") {
    throw new Error("Respuesta de tipos de cambio inválida.");
  }
  const table = (raw as { rates?: Record<string, unknown> }).rates;
  if (!table || typeof table !== "object") {
    throw new Error("Frankfurter no devolvió tipos.");
  }
  const rates: Partial<Record<Currency, number>> = { [base]: 1 };
  for (const [code, value] of Object.entries(table)) {
    if (!isCurrency(code)) continue;
    if (typeof value !== "number" || value <= 0) continue;
    rates[code] = value;
  }
  return { base, rates };
}

export class HttpFxRateClient implements FxRateClientPort {
  async fetchRates(base: Currency): Promise<Omit<FxQuote, "day">> {
    const code = base.toLowerCase();
    const urls = [
      `${FAWAZ_JSDELIVR}/${code}.min.json`,
      `${FAWAZ_PAGES}/${code}.min.json`,
    ];
    let lastError: unknown;
    for (const url of urls) {
      try {
        return parseFawaz(base, await getJson(url));
      } catch (cause) {
        lastError = cause;
      }
    }
    try {
      return parseFrankfurter(
        base,
        await getJson(`${FRANKFURTER}?base=${encodeURIComponent(base)}`)
      );
    } catch (cause) {
      lastError = cause;
    }
    throw lastError instanceof Error
      ? lastError
      : new Error("No se pudieron obtener tipos de cambio.");
  }
}
