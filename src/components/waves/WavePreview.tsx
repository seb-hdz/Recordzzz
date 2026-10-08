import SwipeRevealRow from "@/components/ui/SwipeRevealRow";
import { formatImportDatetime } from "@/components/wizard/step4/shipping";
import { formatCents } from "@/domain/money";
import type { Currency } from "@/domain/types";
import { cn } from "@/lib/utils";
import { createSignal, For, Show } from "solid-js";
import type { ListedWave } from "./filterWaves";

function itemCountLabel(count: number): string {
  return `${count} ${count === 1 ? "artículo" : "artículos"}`;
}

function WavePreview(props: { wave: ListedWave }) {
  const shipping = () => {
    const cents = props.wave.shippingAmountCents;
    const currency = props.wave.shippingCurrency;
    if (!cents || cents <= 0 || !currency) return null;
    return formatCents(cents, currency as Currency);
  };

  return (
    <article class="flex flex-row items-start justify-between gap-3 px-5 py-4">
      <div class="min-w-0 flex-1">
        <h3 class="font-ultra text-base leading-none tracking-[-2%] text-muted-foreground">
          {props.wave.name}
        </h3>
        <p class="mt-1 font-cutive text-sm leading-5 text-foreground">
          {formatImportDatetime(props.wave.createdAt)}
        </p>
      </div>
      <div class="flex shrink-0 flex-col items-end">
        <p class="font-cutive text-sm text-muted-foreground">
          {itemCountLabel(props.wave.itemCount)}
        </p>
        <Show
          when={shipping()}
          fallback={
            <p class="mt-1 font-cutive text-sm text-muted-foreground">Sin envío</p>
          }
        >
          <p class="mt-1 font-ultra text-xl leading-none text-muted-foreground">
            {shipping()}
          </p>
          <p class="font-cutive text-sm text-muted-foreground">de envío</p>
        </Show>
      </div>
    </article>
  );
}

export interface WavePreviewListProps {
  waves: ListedWave[];
  class?: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function WavePreviewList(props: WavePreviewListProps) {
  const [openId, setOpenId] = createSignal<string | null>(null);
  const swipeable = () => Boolean(props.onEdit && props.onDelete);

  return (
    <ul class={cn("flex flex-col", props.class)}>
      <For each={props.waves}>
        {(wave, index) => (
          <li>
            <Show when={index() > 0}>
              <hr class="mx-5 h-px border-none bg-secondary" />
            </Show>
            <Show
              when={swipeable()}
              fallback={<WavePreview wave={wave} />}
            >
              <SwipeRevealRow
                open={openId() === wave.id}
                onOpenChange={(open) => setOpenId(open ? wave.id : null)}
                onEdit={() => {
                  setOpenId(null);
                  props.onEdit?.(wave.id);
                }}
                onDelete={() => {
                  setOpenId(null);
                  props.onDelete?.(wave.id);
                }}
              >
                <WavePreview wave={wave} />
              </SwipeRevealRow>
            </Show>
          </li>
        )}
      </For>
    </ul>
  );
}
