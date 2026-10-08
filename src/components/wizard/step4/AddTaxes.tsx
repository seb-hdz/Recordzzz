import { Show, type Accessor } from "solid-js";
import type { Currency } from "@/domain/types";
import Button from "@/components/global/button";
import AddTaxesSvg from "@/assets/icons/register-steps/add-taxes.svg?raw";
import percentageIcon from "@/assets/icons/percentage.svg?raw";
import closeIcon from "@/assets/icons/x.svg?raw";
import { cn } from "@/lib/utils";
import CurrencyIcon from "./CurrencyIcon";
import { getWizardCurrency } from "./currencies";
import type { TaxSwitcherMode } from "./TaxSwitcher";

export type AddTaxesPhase = "idle" | "editing" | "confirmed";

export interface ConfirmedTax {
  mode: TaxSwitcherMode;
  value: string;
}

export interface AddTaxesProps {
  phase: Accessor<AddTaxesPhase>;
  confirmed: Accessor<ConfirmedTax | null>;
  currency: Accessor<Currency>;
  onAddTaxes?: () => void;
  onClear?: () => void;
  onContinueWithout?: () => void;
  continueDisabled?: boolean;
}

function TaxHeader(props: { onClear?: () => void; class?: string }) {
  return (
    <div class={cn("flex flex-row items-center gap-3", props.class)}>
      <div class="rounded-full bg-muted-foreground size-12 shrink-0 flex items-center justify-center question-shadow">
        <div
          class="size-8 [&_svg]:block [&_svg]:size-8"
          innerHTML={AddTaxesSvg}
        />
      </div>
      <div class="flex flex-row flex-1 items-center -mt-2">
        <p class="flex-1 font-cutive text-xl text-foreground text-left h-4">
          Agregas impuestos
        </p>
        <button
          type="button"
          aria-label="Quitar impuestos"
          onClick={() => props.onClear?.()}
          class="shrink-0 p-1 hover:cursor-pointer mt-2"
        >
          <div
            class="size-8 [&_svg]:block [&_svg]:size-8"
            innerHTML={closeIcon}
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  );
}

export default function AddTaxes(props: AddTaxesProps) {
  const isRate = () => props.confirmed()?.mode === "primary";
  const currencyMeta = () => getWizardCurrency(props.currency());
  const displayValue = () => props.confirmed()?.value || "0.00";

  const summaryText = () =>
    isRate()
      ? "aplicada sobre el precio de compra del artículo"
      : "no incluidos en el precio de compra del artículo";

  return (
    <Show
      when={props.phase() !== "idle"}
      fallback={
        <div class="flex flex-row items-center justify-between">
          <button type="button" onClick={() => props.onAddTaxes?.()}>
            <div class="question-shadow bg-surface pl-6 pt-3 pr-4 pb-4 rounded-r-3xl flex flex-col items-start">
              <div class="rounded-full bg-muted-foreground size-16 flex items-center justify-center question-shadow">
                <div innerHTML={AddTaxesSvg} />
              </div>
              <p class="text-xl font-cutive mt-3.5 self-start text-left">
                ¿Agregas impuestos?
              </p>
            </div>
          </button>
          <div class="flex flex-col items-center justify-center mr-4 ml-4 gap-3">
            <p class="text-xl font-cutive">o</p>
            <div class="flex flex-col items-center justify-center gap-2">
              <Button
                text="Continuar"
                disabled={props.continueDisabled}
                onClick={() => props.onContinueWithout?.()}
                customClass="question-shadow px-6"
              />
              <p class="text-sm font-cutive">sin agregar</p>
            </div>
          </div>
        </div>
      }
    >
      <Show
        when={props.phase() === "editing"}
        fallback={
          <div class="question-shadow bg-surface pl-5 pt-3 pr-4 pb-4 rounded-r-3xl flex flex-col">
            <TaxHeader onClear={props.onClear} />
            <hr class="mt-3 border-border" />
            <div class="mt-3 flex flex-row items-center gap-2 pr-1">
              <p class="font-ultra text-3xl text-black shrink-0">
                {displayValue()}
              </p>
              <Show
                when={isRate()}
                fallback={
                  <CurrencyIcon
                    icon={currencyMeta().icon}
                    variant="input"
                    class="shrink-0"
                  />
                }
              >
                <div
                  class="size-7 shrink-0 text-foreground [&_svg]:block [&_svg]:size-7 [&_path]:fill-current"
                  innerHTML={percentageIcon}
                  aria-hidden="true"
                />
              </Show>
              <p class="font-cutive text-base leading-5 text-muted-foreground ml-1">
                {summaryText()}
              </p>
            </div>
          </div>
        }
      >
        <div class="question-shadow bg-surface rounded-r-full pl-4 pr-5 py-2.5">
          <TaxHeader onClear={props.onClear} />
        </div>
      </Show>
    </Show>
  );
}
