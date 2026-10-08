import successContainerPng from "@/assets/icons/success-icon-container.png";
import boxDiscWhiteSvg from "@/assets/icons/box-disc-white.svg";
import importWhiteSvg from "@/assets/icons/import-white.svg";
import itemShippingSvg from "@/assets/icons/item-shipping.svg?raw";
import itemTaxesSvg from "@/assets/icons/item-taxes.svg?raw";
import { formatPreviewPrice } from "@/components/items/ItemPreview";
import { ITEM_TYPES } from "@/components/wizard/step2/itemTypes";
import { CURRENCIES, type Currency, type ItemCategory } from "@/domain/types";
import { cn } from "@/lib/utils";
import Button from "@/components/global/button";
import { For, Show } from "solid-js";

export type SuccessMoneyLine = {
  amountCents: number;
  currency: Currency;
  /** When true, appends "*" after the amount (calculated / approximate). */
  estimated?: boolean;
};

export type SuccessItem = {
  categories: ItemCategory[];
  name: string;
  priceAmountCents: number;
  priceCurrency: Currency;
  quantity?: number;
  hasTaxes?: boolean;
  hasShipping?: boolean;
};

type ItemSuccessProps = {
  variant: "item";
  name: string;
  price: SuccessMoneyLine;
  tax?: SuccessMoneyLine;
  shipping?: SuccessMoneyLine;
  class?: string;
};

type WaveSuccessProps = {
  variant: "wave";
  name: string;
  price: SuccessMoneyLine;
  shipping?: SuccessMoneyLine;
  items: SuccessItem[];
  class?: string;
};

type SuccessAction = {
  actionLabel?: string;
  onAction?: () => void;
};

export type SuccessProps = (ItemSuccessProps | WaveSuccessProps) & SuccessAction;

function formatMoneyAmount(
  cents: number,
  currency: Currency,
  estimated?: boolean
): string {
  const meta = CURRENCIES.find((entry) => entry.id === currency);
  const amount = (cents / 100).toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const symbol = meta?.symbol ?? currency;
  const mark = estimated ? "*" : "";
  return `${amount}${mark} ${symbol} (${currency})`;
}

function typeTitle(categories: ItemCategory[]): string {
  return categories.map((key) => ITEM_TYPES[key].text).join(", ");
}

function MoneyAddon(props: {
  kind: "tax" | "shipping";
  line: SuccessMoneyLine;
  class?: string;
}) {
  const label = () => (props.kind === "tax" ? "impuesto" : "envío");
  const icon = () => (props.kind === "tax" ? itemTaxesSvg : itemShippingSvg);

  return (
    <div
      class={cn("inline-flex items-center justify-center gap-1.5", props.class)}
    >
      <span
        class="size-4.5 shrink-0 [&_svg]:block [&_svg]:size-4.5"
        innerHTML={icon()}
        aria-hidden="true"
      />
      <p class="font-cutive text-sm leading-none text-white pt-0.5">
        {`+${formatMoneyAmount(
          props.line.amountCents,
          props.line.currency,
          props.line.estimated
        )} - ${label()}`}
      </p>
    </div>
  );
}

function SuccessItemRow(props: SuccessItem) {
  const title = () => typeTitle(props.categories);
  const priceLabel = () =>
    formatPreviewPrice(props.priceAmountCents, props.priceCurrency);

  return (
    <article class="flex flex-col gap-1 px-5 py-3 text-left">
      <div class="flex flex-row items-start justify-between gap-3">
        <h3 class="min-w-0 flex-1 font-ultra text-base leading-none tracking-[-2%] text-ring">
          {title()}
          <Show when={props.quantity != null}>
            <span class="ml-2 font-cutive text-sm">{` × ${props.quantity}`}</span>
          </Show>
        </h3>
        <div class="inline-flex shrink-0 items-center gap-1">
          <span class="font-cutive text-[0.725rem] leading-none text-ring whitespace-nowrap pt-1">
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
      <p class="font-cutive text-sm leading-5 tracking-tighter text-white line-clamp-2">
        {props.name}
      </p>
    </article>
  );
}

function Divider(props: { class?: string }) {
  return (
    <hr
      class={cn(
        "mx-auto h-[2px] w-[min(100%,18rem)] border-none bg-ring",
        props.class
      )}
    />
  );
}

function ItemDetails(props: ItemSuccessProps) {
  return (
    <div class="mt-5 flex w-full flex-col items-center gap-1">
      <p class="font-cutive text-3xl leading-none tracking-tight text-ring mb-1.5">
        {formatMoneyAmount(
          props.price.amountCents,
          props.price.currency,
          props.price.estimated
        )}
      </p>
      <Show when={props.tax}>
        {(tax) => <MoneyAddon kind="tax" line={tax()} />}
      </Show>
      <Show when={props.shipping}>
        {(shipping) => <MoneyAddon kind="shipping" line={shipping()} />}
      </Show>
    </div>
  );
}

function WaveDetails(props: WaveSuccessProps) {
  return (
    <div class="mt-5 flex min-h-0 w-full flex-col">
      <div class="flex shrink-0 flex-col items-center gap-2.5">
        <p class="font-cutive text-3xl leading-none tracking-tight text-white">
          {formatMoneyAmount(
            props.price.amountCents,
            props.price.currency,
            props.price.estimated
          )}
        </p>
        <Show when={props.shipping}>
          {(shipping) => <MoneyAddon kind="shipping" line={shipping()} />}
        </Show>
      </div>

      <Divider class="mt-5 mb-2 shrink-0" />

      <ul class="flex min-h-0 w-full flex-col overflow-y-auto">
        <For each={props.items}>
          {(item) => (
            <li>
              <SuccessItemRow {...item} />
            </li>
          )}
        </For>
      </ul>
    </div>
  );
}

export default function Success(props: SuccessProps) {
  const iconSrc = () =>
    props.variant === "item" ? boxDiscWhiteSvg : importWhiteSvg;

  return (
    <main
      class={cn(
        "success-screen flex h-dvh flex-col overflow-hidden",
        props.class
      )}
    >
      <div class="safe-top safe-bottom mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col items-center justify-center px-6 py-8">
        <div class="animate-success-pop flex shrink-0 flex-col items-center">
          <div class="relative size-36 shrink-0 rounded-full animate-float-drift-a">
            <img
              src={successContainerPng}
              alt=""
              class="size-full object-contain"
              aria-hidden="true"
            />
            <div class="absolute inset-0 flex items-center justify-center">
              <img
                src={iconSrc()}
                alt=""
                class="size-19 object-contain"
                aria-hidden="true"
              />
            </div>
          </div>

          <h1 class="mt-8 text-center font-ultra text-[2rem] leading-none tracking-[-2%] text-white">
            Has registrado
          </h1>
        </div>

        <div class="animate-success-body-open min-h-0 w-full flex-[1_1_auto]">
          <div class="success-body-clip flex min-h-0 flex-col">
            <div class="animate-success-unfold flex min-h-0 w-full flex-col items-center">
              <p class="mt-4 max-w-[20rem] shrink-0 text-center font-cutive text-base leading-6 tracking-tighter text-white">
                {props.name}
              </p>

              <Divider class="mt-6 shrink-0" />

              <Show when={props.variant === "item" ? props : false}>
                {(item) => (
                  <ItemDetails
                    variant="item"
                    name={item().name}
                    price={item().price}
                    tax={item().tax}
                    shipping={item().shipping}
                  />
                )}
              </Show>
              <Show when={props.variant === "wave" ? props : false}>
                {(wave) => (
                  <WaveDetails
                    variant="wave"
                    name={wave().name}
                    price={wave().price}
                    shipping={wave().shipping}
                    items={wave().items}
                  />
                )}
              </Show>
            </div>
          </div>
        </div>
      </div>
      <Show when={props.onAction}>
        <div class="flex shrink-0 justify-center px-6 pb-8">
          <Button
            text={props.actionLabel ?? "Continuar"}
            onClick={() => props.onAction?.()}
            customClass="question-shadow"
          />
        </div>
      </Show>
    </main>
  );
}
