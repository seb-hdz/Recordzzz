import { A } from "@solidjs/router";
import { For, Show } from "solid-js";
import {
  Disc,
  Disc3,
  Box,
  Plus,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Tag,
} from "lucide-solid";
import { useDexieQuery } from "@/adapters/storage/dexie/useDexieQuery";
import { useApp } from "@/application/context";
import { Item, ITEM_CATEGORIES, ITEM_STATUSES } from "@/domain/types";
import { formatCents } from "@/domain/money";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

import HomePage from "@/components/home/Home";

export default function Home() {
  const { itemRepo } = useApp();
  const items = useDexieQuery<Item[]>(() => itemRepo.getAll(), []);

  const totalCount = () => items().length;

  const getCategoryCount = (category: string) => {
    return items().filter((i) => i.categories.includes(category as any)).length;
  };

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

  const recentItems = () => items().slice(0, 5);

  const totalCurrenciesSummary = () => {
    const map: Record<string, number> = {};
    for (const item of items()) {
      const c = item.price_currency;
      map[c] = (map[c] || 0) + item.price_amount_cents;
    }
    return Object.entries(map);
  };

  return <HomePage />;

  return (
    <div class="space-y-6 pt-2 pb-6 animate-fade-in">
      {/* Welcome Banner */}
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-extrabold text-foreground tracking-tight">
            Mi Colección
          </h2>
          <p class="text-xs text-muted-foreground mt-0.5">
            Registro y valoración de medios físicos
          </p>
        </div>
        <Badge variant="primary" size="md">
          <Sparkles size={14} />
          <span>{totalCount()} artículos</span>
        </Badge>
      </div>

      {/* Primary Value Summary Card */}
      <Card class="bg-gradient-to-br from-surface via-surface to-surface-raised border-surface-border">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <TrendingUp size={16} class="text-primary" />
            <span>Valor Total Registrado</span>
          </div>
          <A
            href="/reports"
            class="text-xs text-primary font-bold hover:underline flex items-center gap-1"
          >
            Ver desglose
            <ArrowRight size={12} />
          </A>
        </div>

        <Show
          when={totalCurrenciesSummary().length > 0}
          fallback={
            <div class="text-2xl font-black text-foreground">S/ 0.00</div>
          }
        >
          <div class="flex flex-wrap gap-x-6 gap-y-2 items-baseline">
            <For each={totalCurrenciesSummary()}>
              {([currency, cents]) => (
                <div>
                  <div class="text-2xl font-black text-foreground tracking-tight">
                    {formatCents(cents, currency as any)}
                  </div>
                  <div class="text-[11px] text-muted-foreground font-medium">
                    Total en {currency}
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>
      </Card>

      {/* Category Pills Grid */}
      <div>
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-bold text-foreground">Categorías</h3>
          <A
            href="/records"
            class="text-xs text-primary font-semibold hover:underline"
          >
            Explorar todas
          </A>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <For each={ITEM_CATEGORIES}>
            {(cat) => {
              const count = getCategoryCount(cat.id);
              return (
                <A
                  href={`/records?category=${cat.id}`}
                  class="block focus:outline-none"
                >
                  <Card class="hover:border-primary/40 hover:bg-surface-raised transition-all flex items-center justify-between p-3.5">
                    <div class="flex items-center gap-2.5">
                      <div class="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        {getCategoryIcon(cat.id)}
                      </div>
                      <div>
                        <div class="text-sm font-bold text-foreground">
                          {cat.label}
                        </div>
                        <div class="text-xs text-muted-foreground">
                          {count} {count === 1 ? "artículo" : "artículos"}
                        </div>
                      </div>
                    </div>
                  </Card>
                </A>
              );
            }}
          </For>
        </div>
      </div>

      {/* Recent Additions */}
      <div>
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-bold text-foreground">
            Agregados Recientemente
          </h3>
          <A
            href="/records"
            class="text-xs text-primary font-semibold hover:underline"
          >
            Ver todo
          </A>
        </div>

        <Show
          when={recentItems().length > 0}
          fallback={
            <Card class="text-center py-10 px-4 border-dashed border-2">
              <div class="w-12 h-12 rounded-2xl bg-surface-raised text-muted-foreground flex items-center justify-center mx-auto mb-3">
                <Disc size={28} />
              </div>
              <h4 class="text-sm font-bold text-foreground mb-1">
                Aún no tienes registros
              </h4>
              <p class="text-xs text-muted-foreground mb-4 max-w-xs mx-auto">
                Comienza agregando tu primer vinilo, CD o box set a la
                colección.
              </p>
              <A href="/records/new">
                <Button size="sm">
                  <Plus size={16} />
                  Agregar Registro
                </Button>
              </A>
            </Card>
          }
        >
          <div class="space-y-2.5">
            <For each={recentItems()}>
              {(item) => {
                const statusMeta = ITEM_STATUSES.find(
                  (s) => s.id === item.status
                );
                return (
                  <A
                    href={`/records/${item.id}`}
                    class="block focus:outline-none"
                  >
                    <Card class="hover:border-primary/40 hover:bg-surface-raised transition-all flex items-center justify-between p-3.5">
                      <div class="flex items-center gap-3 min-w-0">
                        <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          {getCategoryIcon(item.categories[0])}
                        </div>
                        <div class="min-w-0">
                          <div class="text-sm font-bold text-foreground truncate">
                            {item.name}
                          </div>
                          <div class="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                            <span class="capitalize">
                              {item.categories.join(", ")}
                            </span>
                            <span>•</span>
                            <span
                              class={`text-[11px] font-medium px-1.5 py-0.2 rounded-md ${
                                statusMeta?.color || ""
                              }`}
                            >
                              {statusMeta?.label || item.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div class="text-right shrink-0 ml-3">
                        <div class="text-sm font-bold text-foreground font-mono">
                          {formatCents(
                            item.price_amount_cents,
                            item.price_currency
                          )}
                        </div>
                        <Show when={item.price_tax_percentage}>
                          <div class="text-[10px] text-muted-foreground">
                            Tax:{" "}
                            {((item.price_tax_percentage || 0) / 100).toFixed(
                              1
                            )}
                            %
                          </div>
                        </Show>
                      </div>
                    </Card>
                  </A>
                );
              }}
            </For>
          </div>
        </Show>
      </div>
    </div>
  );
}
