import type { ItemsFilters } from "@/components/items/ItemsFilterPanel";
import { isoToDateInput } from "@/domain/dates";
import type { Wave, WaveItem } from "@/domain/types";

export interface ListedWave {
  id: string;
  name: string;
  createdAt: string;
  createdOn: string;
  itemCount: number;
  shippingAmountCents?: number;
  shippingCurrency?: Wave["shipping_currency"];
}

export function toListedWaves(waves: Wave[], lines: WaveItem[]): ListedWave[] {
  const counts = new Map<number, number>();
  for (const line of lines) {
    counts.set(line.wave_id, (counts.get(line.wave_id) ?? 0) + line.quantity);
  }

  return waves.flatMap((wave) => {
    if (wave.id == null) return [];
    return [
      {
        id: String(wave.id),
        name: wave.name,
        createdAt: wave.created_at,
        createdOn: isoToDateInput(wave.created_at),
        itemCount: counts.get(wave.id) ?? 0,
        shippingAmountCents: wave.shipping_amount_cents,
        shippingCurrency: wave.shipping_currency,
      },
    ];
  });
}

export function applyWaveFilters(
  waves: ListedWave[],
  filters: ItemsFilters
): ListedWave[] {
  const from = filters.fromDate;
  const to = filters.toDate;
  const [start, end] = from <= to ? [from, to] : [to, from];
  const query = filters.query.trim().toLocaleLowerCase();

  const filtered = waves.filter((wave) => {
    if (wave.createdOn < start || wave.createdOn > end) return false;
    if (!query) return true;
    return wave.name.toLocaleLowerCase().includes(query);
  });

  const sorted = filtered.slice();
  sorted.sort((a, b) => {
    switch (filters.sort) {
      case "z-to-a":
        return b.name.localeCompare(a.name, "es");
      case "recent":
        return b.createdOn.localeCompare(a.createdOn);
      case "oldest":
        return a.createdOn.localeCompare(b.createdOn);
      case "a-to-z":
      default:
        return a.name.localeCompare(b.name, "es");
    }
  });
  return sorted;
}
