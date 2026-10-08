import { Show, createSignal, type Accessor } from "solid-js";
import type { Currency } from "@/domain/types";
import { cn } from "@/lib/utils";
import CurrencyIcon from "./CurrencyIcon";
import { getWizardCurrency } from "./currencies";
import {
  formatProrated,
  parseAmount,
  proratePerItem,
  sanitizeAmount,
  type ImportRecord,
  type ShippingMode,
} from "./shipping";

export interface ShippingAmountInputProps {
  mode: Accessor<ShippingMode>;
  currency: Accessor<Currency>;
  totalValue: Accessor<string>;
  onTotalChange: (value: string) => void;
  selectedImport: Accessor<ImportRecord | null>;
  prorateCount: Accessor<number>;
  customClass?: string;
}

export default function ShippingAmountInput(props: ShippingAmountInputProps) {
  const [bounce, setBounce] = createSignal(false);
  const currencyMeta = () => getWizardCurrency(props.currency());
  const importCurrencyMeta = () =>
    getWizardCurrency(props.selectedImport()?.currency ?? props.currency());

  const totalAmount = () => {
    if (props.mode() === "import") {
      return props.selectedImport()?.shippingAmount ?? "0.00";
    }
    return props.totalValue() || "0.00";
  };

  const perItemAmount = () => {
    const total = parseAmount(totalAmount());
    const count =
      props.mode() === "import"
        ? props.selectedImport()?.itemCount ?? 0
        : props.prorateCount();
    return formatProrated(proratePerItem(total, count));
  };

  const handleFocus = () => {
    setBounce(false);
    requestAnimationFrame(() => setBounce(true));
  };

  const handleInput = (raw: string) => {
    props.onTotalChange(sanitizeAmount(raw));
  };

  const isSimpleTotal = () => props.mode() === "total";
  const isSplit = () => props.mode() === "weight" || props.mode() === "import";

  return (
    <div
      onAnimationEnd={(event) => {
        if (event.animationName === "touch-scale") setBounce(false);
      }}
      class={cn(
        "flex flex-row items-center bg-surface rounded-full question-shadow py-2.5 pl-5 pr-4 min-w-0",
        bounce() && "animate-touch-scale",
        props.customClass
      )}
    >
      <Show when={isSplit()}>
        <div class="-mb-3 mr-3 flex shrink-0 flex-col items-start">
          <span class="font-ultra text-sm text-muted-foreground leading-1">
            {props.mode() === "import" ? "De" : "Total"}
          </span>
          <Show
            when={props.mode() === "weight"}
            fallback={
              <span class="flex flex-row items-center gap-1 font-ultra text-lg text-muted-foreground">
                {totalAmount()}
                <CurrencyIcon
                  icon={importCurrencyMeta().icon}
                  variant="modal"
                  class="size-5 [&_svg]:size-5"
                />
              </span>
            }
          >
            <div class="inline-flex w-fit flex-row items-center gap-2">
              <input
                type="text"
                inputmode="decimal"
                placeholder="0.00"
                value={props.totalValue()}
                onFocus={handleFocus}
                onInput={(e) => handleInput(e.currentTarget.value)}
                class="[field-sizing:content] min-w-[3ch] w-auto max-w-full bg-transparent p-0 m-0 text-left font-ultra text-lg text-muted-foreground outline-none placeholder:text-muted-foreground/40"
              />
              <CurrencyIcon
                icon={currencyMeta().icon}
                variant="modal"
                class="size-5 [&_svg]:size-5"
              />
            </div>
          </Show>
        </div>
      </Show>

      <Show
        when={isSimpleTotal()}
        fallback={
          <div class="flex min-w-0 flex-1 flex-row items-center justify-end gap-1">
            <span class="font-ultra text-3xl text-foreground">
              {perItemAmount()}
              <Show when={props.mode() === "import"}>
                <span class="align-super text-lg">*</span>
              </Show>
            </span>
            <CurrencyIcon
              icon={currencyMeta().icon}
              variant="input"
              class="pb-3 mr-1.5"
            />
          </div>
        }
      >
        <input
          type="text"
          inputmode="decimal"
          placeholder="0.00"
          value={props.totalValue()}
          onFocus={handleFocus}
          onInput={(e) => handleInput(e.currentTarget.value)}
          class="min-w-0 flex-1 bg-transparent p-0 m-0 text-right font-ultra text-3xl text-foreground outline-none placeholder:text-foreground/40 mr-1.5"
        />
        <CurrencyIcon
          icon={currencyMeta().icon}
          variant="input"
          class="ml-2 pb-3"
        />
      </Show>
    </div>
  );
}
