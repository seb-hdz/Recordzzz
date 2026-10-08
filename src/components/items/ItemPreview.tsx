import boxsetGreenSvg from "@/assets/icons/item-types/boxset-green.svg?raw";
import cdGreenSvg from "@/assets/icons/item-types/cd-green.svg?raw";
import multiGreenSvg from "@/assets/icons/item-types/multi-green.svg?raw";
import otherGreenSvg from "@/assets/icons/item-types/other-green.svg?raw";
import vinylGreenSvg from "@/assets/icons/item-types/vinyl-green.svg?raw";
import itemShippingSvg from "@/assets/icons/item-shipping.svg?raw";
import itemTaxesSvg from "@/assets/icons/item-taxes.svg?raw";
import Badge from "@/components/global/badge";
import {
  circleSvg,
  ITEM_TYPES,
  type ItemTypeKey,
} from "@/components/wizard/step2/itemTypes";
import SwipeRevealRow from "@/components/ui/SwipeRevealRow";
import { CURRENCIES, type Currency, type ItemCategory } from "@/domain/types";
import { cn } from "@/lib/utils";
import { createSignal, For, Show, type JSX } from "solid-js";

const TYPE_GREEN_ICONS: Record<ItemTypeKey, string> = {
  vinyl: vinylGreenSvg,
  cd: cdGreenSvg,
  boxset: boxsetGreenSvg,
  other: otherGreenSvg,
};

export interface ItemPreviewProps {
  categories: ItemCategory[];
  name: string;
  priceAmountCents: number;
  priceCurrency: Currency;
  hasTaxes?: boolean;
  hasShipping?: boolean;
  selected?: boolean;
  class?: string;
  onClick?: JSX.EventHandlerUnion<HTMLElement, MouseEvent>;
}

export function formatPreviewPrice(cents: number, currency: Currency): string {
  const meta = CURRENCIES.find((entry) => entry.id === currency);
  const amount = (cents / 100).toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const symbol = meta?.symbol ?? currency;
  return `${amount} ${symbol} (${currency})`;
}

function typeTitle(categories: ItemCategory[]): string {
  return categories.map((key) => ITEM_TYPES[key].text).join(", ");
}

function typeIcon(categories: ItemCategory[]): string {
  if (categories.length > 1) return multiGreenSvg;
  if (categories.length === 1) return TYPE_GREEN_ICONS[categories[0]];
  return otherGreenSvg;
}

export default function ItemPreview(props: ItemPreviewProps) {
  const title = () => typeTitle(props.categories);
  const icon = () => typeIcon(props.categories);
  const priceLabel = () =>
    formatPreviewPrice(props.priceAmountCents, props.priceCurrency);
  const showCount = () => props.categories.length > 1;

  return (
    <article
      class={cn(
        "flex flex-row items-start gap-3 px-5 py-4 transition-colors",
        props.selected && "bg-ring/40",
        props.class
      )}
      onClick={props.onClick}
      role={props.onClick ? "button" : undefined}
      tabindex={props.onClick ? 0 : undefined}
      aria-pressed={props.onClick ? !!props.selected : undefined}
    >
      <div class="relative size-13.5 shrink-0">
        <div
          class="size-full [&_svg]:block [&_svg]:size-full"
          innerHTML={circleSvg}
          aria-hidden="true"
        />
        <div
          class={cn(
            "absolute inset-0 flex items-center justify-center [&_svg]:block [&_svg]:w-auto",
            showCount() ? "[&_svg]:h-8.5" : "[&_svg]:h-10"
          )}
          innerHTML={icon()}
          aria-hidden="true"
        />
        <Show when={showCount()}>
          <Badge
            text={String(props.categories.length)}
            customClass="absolute -bottom-1.5 -right-1.5 z-1 size-8"
            customTextClass="text-lg text-muted-foreground"
          />
        </Show>
      </div>

      <div class="min-w-0 flex-1 pt-0.5">
        <div class="flex flex-row items-start justify-between gap-2">
          <h3 class="min-w-0 flex-1 font-ultra text-base leading-none tracking-[-2%] text-muted-foreground">
            {title()}
          </h3>
          <div class="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-2.5 py-1 -mt-1.5 mb-1.5">
            <span class="font-cutive text-[0.725rem] leading-none text-primary-foreground whitespace-nowrap pt-1.5">
              {priceLabel()}
            </span>
            <Show when={props.hasTaxes}>
              <span
                class="size-4.5 shrink-0 [&_svg]:block [&_svg]:size-4.5"
                innerHTML={itemTaxesSvg}
                aria-hidden="true"
              />
            </Show>
            <Show when={props.hasShipping}>
              <span
                class="size-4.5 shrink-0 [&_svg]:block [&_svg]:size-4.5"
                innerHTML={itemShippingSvg}
                aria-hidden="true"
              />
            </Show>
          </div>
        </div>

        <p class="font-cutive text-sm leading-5 tracking-tighter text-foreground line-clamp-2">
          {props.name}
        </p>
      </div>
    </article>
  );
}

export interface ItemPreviewListProps {
  items: (ItemPreviewProps & { id?: string })[];
  class?: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function ItemPreviewList(props: ItemPreviewListProps) {
  const [openId, setOpenId] = createSignal<string | null>(null);
  const swipeable = () => Boolean(props.onEdit && props.onDelete);

  return (
    <ul class={cn("flex flex-col", props.class)}>
      <For each={props.items}>
        {(item, index) => (
          <li>
            <Show when={index() > 0}>
              <hr class="mx-5 h-px border-none bg-secondary" />
            </Show>
            <Show
              when={swipeable() && item.id}
              fallback={<ItemPreview {...item} />}
            >
              <SwipeRevealRow
                open={openId() === item.id}
                onOpenChange={(open) => setOpenId(open ? item.id! : null)}
                onEdit={() => {
                  setOpenId(null);
                  props.onEdit?.(item.id!);
                }}
                onDelete={() => {
                  setOpenId(null);
                  props.onDelete?.(item.id!);
                }}
              >
                <ItemPreview {...item} />
              </SwipeRevealRow>
            </Show>
          </li>
        )}
      </For>
    </ul>
  );
}
