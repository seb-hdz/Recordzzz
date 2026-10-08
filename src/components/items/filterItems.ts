import type { ItemsFilters } from "@/components/items/ItemsFilterPanel";
import type { ItemPreviewProps } from "@/components/items/ItemPreview";
import { ITEM_TYPES } from "@/components/wizard/step2/itemTypes";
import { isoToDateInput } from "@/domain/dates";
import { lineHasTaxes } from "@/domain/pricing";
import type { Item } from "@/domain/types";

export type ListedItem = ItemPreviewProps & {
  id: string;
  purchasedOn: string;
};

export function matchesQuery(item: ListedItem, query: string): boolean {
  if (!query) return true;
  const haystack = [
    item.name,
    ...item.categories.map((key) => ITEM_TYPES[key].text),
  ]
    .join(" ")
    .toLocaleLowerCase();
  return haystack.includes(query.toLocaleLowerCase());
}

export function applyFilters(
  items: ListedItem[],
  filters: ItemsFilters
): ListedItem[] {
  const from = filters.fromDate;
  const to = filters.toDate;
  const [start, end] = from <= to ? [from, to] : [to, from];

  const filtered = items.filter((item) => {
    if (item.purchasedOn < start || item.purchasedOn > end) return false;
    if (
      filters.types.length > 0 &&
      !item.categories.some((category) => filters.types.includes(category))
    ) {
      return false;
    }
    return matchesQuery(item, filters.query);
  });

  const sorted = filtered.slice();
  sorted.sort((a, b) => {
    switch (filters.sort) {
      case "z-to-a":
        return b.name.localeCompare(a.name, "es");
      case "recent":
        return b.purchasedOn.localeCompare(a.purchasedOn);
      case "oldest":
        return a.purchasedOn.localeCompare(b.purchasedOn);
      case "a-to-z":
      default:
        return a.name.localeCompare(b.name, "es");
    }
  });
  return sorted;
}

export function toListedItem(item: Item): ListedItem | null {
  if (item.id == null) return null;
  return {
    id: String(item.id),
    categories: item.categories,
    name: item.name,
    priceAmountCents: item.price_amount_cents,
    priceCurrency: item.price_currency,
    hasTaxes: lineHasTaxes(item),
    purchasedOn: isoToDateInput(item.purchase_datetime ?? item.created_at),
  };
}
