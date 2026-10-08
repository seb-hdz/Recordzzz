import { A, useSearchParams } from "@solidjs/router";
import { createSignal, createMemo, For, Show } from "solid-js";
import { Search, X, Disc, Disc3, Box, Plus } from "lucide-solid";
import { useDexieQuery } from "@/adapters/storage/dexie/useDexieQuery";
import { useApp } from "@/application/context";
import {
  Item,
  ItemCategory,
  ItemStatus,
  ITEM_CATEGORIES,
  ITEM_STATUSES,
} from "@/domain/types";
import { formatCents } from "@/domain/money";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function RecordsList() {
  const { itemRepo } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = createSignal("");
  const selectedCategory = () =>
    (searchParams.category as ItemCategory) || undefined;
  const selectedStatus = () =>
    (searchParams.status as ItemStatus) || undefined;

  const items = useDexieQuery<Item[]>(() => itemRepo.getAll(), []);

  const filteredItems = createMemo(() => {
    let list = items();
    const query = searchQuery().toLowerCase().trim();
    const cat = selectedCategory();
    const stat = selectedStatus();

    if (query) {
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(query) ||
          i.tags?.some((t) => t.toLowerCase().includes(query))
      );
    }

    if (cat) {
      list = list.filter((i) => i.categories.includes(cat));
    }

    if (stat) {
      list = list.filter((i) => i.status === stat);
    }

    return list;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "vinyl":
        return <Disc3 size={18} />;
      case "boxset":
        return <Box size={18} />;
      case "cd":
      default:
        return <Disc size={18} />;
    }
  };

  const handleCategoryChange = (cat?: ItemCategory) => {
    setSearchParams({ category: cat, status: selectedStatus() });
  };

  const handleStatusChange = (status?: ItemStatus) => {
    setSearchParams({ category: selectedCategory(), status });
  };

  return (
    <div class="space-y-4 pt-2 pb-6 animate-fade-in">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-extrabold text-foreground tracking-tight">
            Catálogo
          </h2>
          <p class="text-xs text-muted-foreground">
            {filteredItems().length} de {items().length} artículos
          </p>
        </div>
        <A href="/records/new">
          <Button size="sm" variant="primary">
            <Plus size={16} />
            Nuevo
          </Button>
        </A>
      </div>

      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
          <Search size={18} />
        </div>
        <Input
          type="text"
          placeholder="Buscar por nombre o etiqueta..."
          value={searchQuery()}
          onInput={(e) => setSearchQuery(e.currentTarget.value)}
          class="pl-10 pr-10"
        />
        <Show when={searchQuery()}>
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X size={16} />
          </button>
        </Show>
      </div>

      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          type="button"
          onClick={() => handleCategoryChange(undefined)}
          class={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            !selectedCategory()
              ? "bg-primary text-primary-foreground"
              : "bg-surface-raised text-muted-foreground hover:text-foreground border border-border"
          }`}
        >
          Todos
        </button>
        <For each={ITEM_CATEGORIES}>
          {(cat) => {
            const active = selectedCategory() === cat.id;
            return (
              <button
                type="button"
                onClick={() =>
                  handleCategoryChange(active ? undefined : cat.id)
                }
                class={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface-raised text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                {getCategoryIcon(cat.id)}
                <span>{cat.label}</span>
              </button>
            );
          }}
        </For>
      </div>

      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          type="button"
          onClick={() => handleStatusChange(undefined)}
          class={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            !selectedStatus()
              ? "bg-foreground text-background"
              : "bg-surface-raised text-muted-foreground hover:text-foreground border border-border"
          }`}
        >
          Cualquier estado
        </button>
        <For each={ITEM_STATUSES}>
          {(st) => {
            const active = selectedStatus() === st.id;
            return (
              <button
                type="button"
                onClick={() => handleStatusChange(active ? undefined : st.id)}
                class={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  active
                    ? "bg-foreground text-background"
                    : "bg-surface-raised text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                {st.label}
              </button>
            );
          }}
        </For>
      </div>

      <Show
        when={filteredItems().length > 0}
        fallback={
          <Card class="text-center py-12 px-4 border-dashed border-2">
            <div class="w-12 h-12 rounded-2xl bg-surface-raised text-muted-foreground flex items-center justify-center mx-auto mb-3">
              <Disc size={28} />
            </div>
            <h4 class="text-sm font-bold text-foreground mb-1">
              No se encontraron artículos
            </h4>
            <p class="text-xs text-muted-foreground mb-4">
              Prueba cambiando los filtros de búsqueda.
            </p>
            <Show
              when={searchQuery() || selectedCategory() || selectedStatus()}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSearchParams({ category: undefined, status: undefined });
                }}
              >
                Limpiar Filtros
              </Button>
            </Show>
          </Card>
        }
      >
        <div class="space-y-2.5">
          <For each={filteredItems()}>
            {(item) => {
              const statusMeta = ITEM_STATUSES.find((s) => s.id === item.status);
              return (
                <A href={`/records/${item.id}`} class="block focus:outline-none">
                  <Card class="hover:border-primary/40 hover:bg-surface-raised transition-all p-3.5">
                    <div class="flex items-start justify-between gap-3">
                      <div class="flex items-start gap-3 min-w-0">
                        <div class="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                          {getCategoryIcon(item.categories[0])}
                        </div>
                        <div class="min-w-0">
                          <h4 class="text-sm font-bold text-foreground leading-snug truncate">
                            {item.name}
                          </h4>
                          <div class="flex flex-wrap items-center gap-1.5 mt-1">
                            <span class="text-xs text-muted-foreground capitalize">
                              {item.categories.join(", ")}
                            </span>
                            <span class="text-xs text-muted-foreground">•</span>
                            <span
                              class={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                                statusMeta?.color || ""
                              }`}
                            >
                              {statusMeta?.label || item.status}
                            </span>
                          </div>

                          <Show when={item.tags && item.tags.length > 0}>
                            <div class="flex flex-wrap gap-1 mt-2">
                              <For each={item.tags}>
                                {(tag) => (
                                  <span class="text-[10px] text-muted-foreground bg-surface-raised border border-border px-1.5 py-0.5 rounded">
                                    #{tag}
                                  </span>
                                )}
                              </For>
                            </div>
                          </Show>
                        </div>
                      </div>

                      <div class="text-right shrink-0">
                        <div class="text-sm font-bold text-foreground font-mono">
                          {formatCents(
                            item.price_amount_cents,
                            item.price_currency
                          )}
                        </div>
                        <Show when={item.purchase_datetime}>
                          <div class="text-[10px] text-muted-foreground mt-0.5">
                            {new Date(
                              item.purchase_datetime!
                            ).toLocaleDateString("es-PE", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        </Show>
                      </div>
                    </div>
                  </Card>
                </A>
              );
            }}
          </For>
        </div>
      </Show>
    </div>
  );
}
