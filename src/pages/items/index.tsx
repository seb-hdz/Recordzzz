import ItemsFilterPanel, {
  type ItemsFilters,
} from "@/components/items/ItemsFilterPanel";
import { ItemPreviewList } from "@/components/items/ItemPreview";
import { applyFilters, toListedItem } from "@/components/items/filterItems";
import CommonHeader from "@/components/ui/CommonHeader";
import { useDexieQuery } from "@/adapters/storage/dexie/useDexieQuery";
import { useApp } from "@/application/context";
import { todayDateInput } from "@/domain/dates";
import type { Item } from "@/domain/types";
import { createMemo, createSignal, Show } from "solid-js";

export default function ItemsPage() {
  const { itemService } = useApp();
  const items = useDexieQuery<Item[]>(() => itemService.getAllItems(), []);
  const [filters, setFilters] = createSignal<ItemsFilters>({
    query: "",
    types: [],
    sort: "a-to-z",
    fromDate: "2026-01-01",
    toDate: todayDateInput(),
  });

  const listed = createMemo(() =>
    items().flatMap((item) => {
      const row = toListedItem(item);
      return row ? [row] : [];
    })
  );
  const visible = createMemo(() => applyFilters(listed(), filters()));

  const countLabel = () => {
    const count = visible().length;
    const noun = count === 1 ? "artículo" : "artículos";
    const scope = count === listed().length ? "todos los" : "los";
    return { scope, count, noun };
  };

  return (
    <main class="flex h-dvh flex-col overflow-hidden">
      <CommonHeader title="Artículos" showBack />
      <p class="shrink-0 bg-ring py-1.5 text-center font-cutive text-sm text-muted-foreground">
        Mostrando {countLabel().scope}{" "}
        <span class="underline underline-offset-3">{countLabel().count}</span>{" "}
        {countLabel().noun}
      </p>
      <div class="min-h-0 flex-1 overflow-y-auto">
        <Show
          when={visible().length > 0}
          fallback={
            <p class="px-5 py-8 text-center font-cutive text-base text-muted-foreground">
              Ningún artículo coincide con los filtros.
            </p>
          }
        >
          <ItemPreviewList items={visible()} />
        </Show>
      </div>
      <ItemsFilterPanel
        initialFrom="2026-01-01"
        initialTo={todayDateInput()}
        onFiltersChange={setFilters}
      />
    </main>
  );
}
