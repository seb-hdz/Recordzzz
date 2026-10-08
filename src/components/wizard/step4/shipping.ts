import type { Currency } from "@/domain/types";

export type ShippingMode = "total" | "weight" | "import";

export type WeightUnit = "kg" | "lb";

export interface ImportRecord {
  id: string;
  name: string;
  shippingAmount: string;
  currency: Currency;
  datetime: string;
  itemCount: number;
}

export const SHIPPING_MODE_LABELS: Record<ShippingMode, string> = {
  total: "Monto total",
  weight: "Por peso",
  import: "Importación",
};

export const WEIGHT_UNIT_LABELS: Record<WeightUnit, string> = {
  kg: "kilogramos",
  lb: "libras",
};

export const SYNTHETIC_IMPORTS: ImportRecord[] = [
  {
    id: "imp-1",
    name: "Pedido Discogs — Abril 2025",
    shippingAmount: "145.23",
    currency: "USD",
    datetime: "2025-04-23T15:00:00",
    itemCount: 4,
  },
  {
    id: "imp-2",
    name: "Lote vinilos UK",
    shippingAmount: "89.50",
    currency: "GBP",
    datetime: "2025-03-12T10:30:00",
    itemCount: 2,
  },
  {
    id: "imp-3",
    name: "Importación Japón",
    shippingAmount: "3200.00",
    currency: "JPY",
    datetime: "2025-02-01T18:45:00",
    itemCount: 7,
  },
];

export function sanitizeAmount(raw: string): string {
  const cleaned = raw.replace(/[^\d.,]/g, "").replace(",", ".");
  const parts = cleaned.split(".");
  if (parts.length <= 1) return parts[0] ?? "";
  return `${parts[0]}.${parts.slice(1).join("").slice(0, 2)}`;
}

export function parseAmount(value: string): number {
  const num = parseFloat(value);
  return Number.isFinite(num) ? num : 0;
}

export function proratePerItem(total: number, registeredCount: number): number {
  if (total <= 0 || registeredCount < 0) return 0;
  return total / (registeredCount + 1);
}

export function formatProrated(value: number): string {
  return value.toFixed(2);
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatImportTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? "pm" : "am";
  const hour12 = hours % 12 || 12;

  return `a las ${hour12}:${pad2(minutes)} ${period}`;
}

export function formatImportDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  return `del ${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function formatImportDatetime(iso: string): string {
  const time = formatImportTime(iso);
  const date = formatImportDate(iso);
  if (!time || !date) return "";
  return `${time} ${date}`;
}
