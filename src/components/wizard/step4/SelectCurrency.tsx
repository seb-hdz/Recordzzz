import { BottomSheet } from "@/components/ui/BottomSheet";
import type { Currency } from "@/domain/types";
import { cn } from "@/lib/utils";
import { For, createSignal, type Accessor } from "solid-js";
import CurrencyIcon from "./CurrencyIcon";
import { WIZARD_CURRENCIES, getWizardCurrency } from "./currencies";

export interface SelectCurrencyProps {
  selected: Accessor<Currency>;
  onSelectedChange: (currency: Currency) => void;
}

export default function SelectCurrency(props: SelectCurrencyProps) {
  const [open, setOpen] = createSignal(false);
  const [bounce, setBounce] = createSignal(false);
  const current = () => getWizardCurrency(props.selected());

  const handleOpen = () => {
    setBounce(false);
    requestAnimationFrame(() => setBounce(true));
    setOpen(true);
  };

  const handleSelect = (currency: Currency) => {
    props.onSelectedChange(currency);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        onAnimationEnd={(event) => {
          if (event.animationName === "touch-scale") setBounce(false);
        }}
        class={cn(
          "flex flex-row items-center gap-2 bg-surface rounded-full question-shadow py-3 px-4 hover:cursor-pointer",
          bounce() && "animate-touch-scale"
        )}
      >
        <div
          class="w-8 h-8 shrink-0 [&_svg]:w-full [&_svg]:h-full"
          innerHTML={current().flag}
        />
        <span class="font-cutive text-xl text-foreground leading-5 pt-2">
          {current().id}
        </span>
      </button>

      <BottomSheet
        open={open()}
        onClose={() => setOpen(false)}
        title="Selecciona la moneda"
      >
        <ul class="pb-4">
          <For each={WIZARD_CURRENCIES}>
            {(currency) => (
              <li>
                <button
                  type="button"
                  onClick={() => handleSelect(currency.id)}
                  class={cn(
                    "grid w-full grid-cols-[2rem_1fr_2rem] items-center gap-x-3 px-6 py-3.5 font-cutive text-base text-foreground transition-colors hover:cursor-pointer hover:bg-muted/40",
                    props.selected() === currency.id && "bg-muted/40"
                  )}
                >
                  <div
                    class="size-8 shrink-0 [&_svg]:size-full"
                    innerHTML={currency.flag}
                  />
                  <span class="min-w-0 text-left pt-2">
                    {currency.id} - {currency.name} ({currency.country})
                  </span>
                  <CurrencyIcon icon={currency.icon} variant="modal" />
                </button>
                <hr class="mx-6 border-secondary" />
              </li>
            )}
          </For>
        </ul>
      </BottomSheet>
    </>
  );
}
