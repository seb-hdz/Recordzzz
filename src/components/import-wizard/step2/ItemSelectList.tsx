import ItemsFilterPanel, {
  type ItemsFilters,
} from "@/components/items/ItemsFilterPanel";
import ItemsEmptyState from "@/components/items/ItemsEmptyState";
import ItemPreview from "@/components/items/ItemPreview";
import { applyFilters, type ListedItem } from "@/components/items/filterItems";
import Button from "@/components/global/button";
import type { WaveLineDraft } from "@/domain/drafts";
import { cn } from "@/lib/utils";
import { createMemo, createSignal, For, Show } from "solid-js";

interface ItemSelectListProps {
  items: ListedItem[];
  lines: WaveLineDraft[];
  filters: ItemsFilters;
  onFiltersChange: (filters: ItemsFilters) => void;
  onToggle: (itemId: number) => void;
  onQuantityChange: (itemId: number, quantity: number) => void;
  onContinue: () => void;
  onRegister: () => void;
}

export default function ItemSelectList(props: ItemSelectListProps) {
  const [bounce, setBounce] = createSignal(false);
  const visible = createMemo(() => applyFilters(props.items, props.filters));
  const selectedCount = () =>
    props.lines.filter((line) => line.quantity >= 1).length;

  const quantityOf = (itemId: number) =>
    props.lines.find((line) => line.itemId === itemId)?.quantity ?? 0;

  const countLabel = () => {
    const count = visible().length;
    const noun = count === 1 ? "artículo" : "artículos";
    const scope = count === props.items.length ? "todos los" : "los";
    return { scope, count, noun };
  };

  return (
    <div class="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden">
      <p class="shrink-0 bg-ring py-1.5 text-center font-cutive text-sm text-muted-foreground">
        Mostrando {countLabel().scope}{" "}
        <span class="underline underline-offset-3">{countLabel().count}</span>{" "}
        {countLabel().noun}
      </p>
      <div class="min-h-0 flex-1 overflow-y-auto">
        <Show
          when={visible().length > 0}
          fallback={<ItemsEmptyState onRegister={props.onRegister} />}
        >
          <ul class="flex flex-col">
            <For each={visible()}>
              {(item, index) => {
                const itemId = () => Number(item.id);
                const quantity = () => quantityOf(itemId());
                return (
                  <li>
                    <Show when={index() > 0}>
                      <hr class="mx-5 h-px border-none bg-secondary" />
                    </Show>
                    <ItemPreview
                      categories={item.categories}
                      name={item.name}
                      priceAmountCents={item.priceAmountCents}
                      priceCurrency={item.priceCurrency}
                      hasTaxes={item.hasTaxes}
                      selected={quantity() > 0}
                      onClick={() => props.onToggle(itemId())}
                    />
                    <Show when={quantity() > 0}>
                      <div class="flex items-center justify-end gap-3 px-5 pb-3">
                        <button
                          type="button"
                          class="flex size-8 items-center justify-center rounded-full bg-primary font-ultra text-lg text-primary-foreground"
                          aria-label="Reducir cantidad"
                          onClick={() =>
                            props.onQuantityChange(itemId(), quantity() - 1)
                          }
                        >
                          −
                        </button>
                        <span class="min-w-6 text-center font-cutive text-lg text-foreground">
                          {quantity()}
                        </span>
                        <button
                          type="button"
                          class="flex size-8 items-center justify-center rounded-full bg-primary font-ultra text-lg text-primary-foreground"
                          aria-label="Aumentar cantidad"
                          onClick={() =>
                            props.onQuantityChange(itemId(), quantity() + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                    </Show>
                  </li>
                );
              }}
            </For>
          </ul>
        </Show>
      </div>
      <ItemsFilterPanel
        initial={props.filters}
        onFiltersChange={props.onFiltersChange}
      />
      <Show when={selectedCount() > 0}>
        <div class="flex shrink-0 justify-center px-5 pb-6">
          <Button
            text="Continuar"
            onClick={() => {
              setBounce(false);
              requestAnimationFrame(() => setBounce(true));
              props.onContinue();
            }}
            customClass={cn(
              "question-shadow self-center",
              bounce() && "animate-touch-scale"
            )}
          />
        </div>
      </Show>
    </div>
  );
}
