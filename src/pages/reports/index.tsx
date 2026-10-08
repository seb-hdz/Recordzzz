import { For, Show } from "solid-js";
import { TrendingUp, Disc3, PieChart } from "lucide-solid";
import { useDexieQuery } from "@/adapters/storage/dexie/useDexieQuery";
import { useApp } from "@/application/context";
import {
  Item,
  ITEM_CATEGORIES,
  ITEM_STATUSES,
  Currency,
} from "@/domain/types";
import { formatCents } from "@/domain/money";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function Reports() {
  const { itemRepo } = useApp();
  const items = useDexieQuery<Item[]>(() => itemRepo.getAll(), []);

  const totalCount = () => items().length;

  const currencyTotals = () => {
    const map: Record<string, { total: number; count: number }> = {};
    for (const item of items()) {
      const c = item.price_currency;
      if (!map[c]) map[c] = { total: 0, count: 0 };
      map[c].total += item.price_amount_cents;
      map[c].count++;
    }
    return Object.entries(map);
  };

  const categoryStats = () => {
    const total = totalCount();
    return ITEM_CATEGORIES.map((cat) => {
      const count = items().filter((i) =>
        i.categories.includes(cat.id)
      ).length;
      const pct = total > 0 ? (count / total) * 100 : 0;
      return { ...cat, count, pct };
    });
  };

  const statusStats = () => {
    const total = totalCount();
    return ITEM_STATUSES.map((st) => {
      const count = items().filter((i) => i.status === st.id).length;
      const pct = total > 0 ? (count / total) * 100 : 0;
      return { ...st, count, pct };
    });
  };

  const topItems = () => {
    return [...items()]
      .sort((a, b) => b.price_amount_cents - a.price_amount_cents)
      .slice(0, 5);
  };

  return (
    <div class="space-y-6 pt-2 pb-8 animate-fade-in">
      <div>
        <h2 class="text-2xl font-extrabold text-foreground tracking-tight">
          Reportes y Métricas
        </h2>
        <p class="text-xs text-muted-foreground">
          Estadísticas de valoración y distribución de tu catálogo
        </p>
      </div>

      {/* Valor Total por Moneda */}
      <Card class="space-y-4">
        <div class="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
          <TrendingUp size={16} class="text-primary" />
          <span>Valoración por Moneda</span>
        </div>

        <Show
          when={currencyTotals().length > 0}
          fallback={
            <div class="text-xs text-muted-foreground">
              No hay datos registrados aún.
            </div>
          }
        >
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <For each={currencyTotals()}>
              {([currency, data]) => (
                <div class="p-3.5 rounded-xl bg-surface-raised border border-border flex items-center justify-between">
                  <div>
                    <div class="text-xs text-muted-foreground font-semibold">
                      {currency} ({data.count} {data.count === 1 ? "artículo" : "artículos"})
                    </div>
                    <div class="text-lg font-black text-foreground font-mono mt-0.5">
                      {formatCents(data.total, currency as Currency)}
                    </div>
                  </div>
                  <Badge variant="primary" size="sm">
                    {data.count} items
                  </Badge>
                </div>
              )}
            </For>
          </div>
        </Show>
      </Card>

      {/* Distribución por Categoría */}
      <Card class="space-y-4">
        <div class="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
          <Disc3 size={16} class="text-primary" />
          <span>Distribución por Formato</span>
        </div>

        <div class="space-y-3">
          <For each={categoryStats()}>
            {(cat) => (
              <div class="space-y-1.5">
                <div class="flex items-center justify-between text-xs font-bold">
                  <span class="text-foreground">{cat.label}</span>
                  <span class="text-muted-foreground">
                    {cat.count} ({cat.pct.toFixed(0)}%)
                  </span>
                </div>
                <div class="h-2 w-full bg-surface-raised rounded-full overflow-hidden">
                  <div
                    class="h-full bg-primary transition-all duration-500 rounded-full"
                    style={{ width: `${cat.pct}%` }}
                  />
                </div>
              </div>
            )}
          </For>
        </div>
      </Card>

      {/* Distribución por Estado Físico */}
      <Card class="space-y-4">
        <div class="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
          <PieChart size={16} class="text-primary" />
          <span>Estado de Conservación</span>
        </div>

        <div class="space-y-3">
          <For each={statusStats()}>
            {(st) => (
              <div class="space-y-1.5">
                <div class="flex items-center justify-between text-xs font-bold">
                  <span class="text-foreground">{st.label}</span>
                  <span class="text-muted-foreground">
                    {st.count} ({st.pct.toFixed(0)}%)
                  </span>
                </div>
                <div class="h-2 w-full bg-surface-raised rounded-full overflow-hidden">
                  <div
                    class="h-full bg-primary/70 transition-all duration-500 rounded-full"
                    style={{ width: `${st.pct}%` }}
                  />
                </div>
              </div>
            )}
          </For>
        </div>
      </Card>

      {/* Artículos más valiosos */}
      <Show when={topItems().length > 0}>
        <Card class="space-y-3">
          <div class="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Top Artículos por Precio
          </div>
          <div class="space-y-2">
            <For each={topItems()}>
              {(item, index) => (
                <div class="flex items-center justify-between p-2.5 rounded-xl bg-surface-raised border border-border text-xs">
                  <div class="flex items-center gap-2.5 min-w-0">
                    <span class="w-5 h-5 rounded-full bg-primary/15 text-primary text-[11px] font-bold flex items-center justify-center shrink-0">
                      {index() + 1}
                    </span>
                    <span class="font-bold text-foreground truncate">
                      {item.name}
                    </span>
                  </div>
                  <span class="font-bold text-foreground font-mono ml-2 shrink-0">
                    {formatCents(item.price_amount_cents, item.price_currency)}
                  </span>
                </div>
              )}
            </For>
          </div>
        </Card>
      </Show>
    </div>
  );
}
