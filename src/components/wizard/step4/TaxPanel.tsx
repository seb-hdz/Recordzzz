import { createSignal, Show, type Accessor } from "solid-js";
import type { Currency } from "@/domain/types";
import Button from "@/components/global/button";
import percentageIcon from "@/assets/icons/percentage.svg?raw";
import QuestionTitle from "../QuestionTitle";
import CurrencyIcon from "./CurrencyIcon";
import { getWizardCurrency } from "./currencies";
import TaxSwitcher, { type TaxSwitcherMode } from "./TaxSwitcher";
import type { ConfirmedTax } from "./AddTaxes";
import { cn } from "@/lib/utils";

export interface TaxPanelProps {
  currency: Accessor<Currency>;
  onContinue?: (tax: ConfirmedTax) => void;
}

function sanitizeAmount(raw: string): string {
  const cleaned = raw.replace(/[^\d.,]/g, "").replace(",", ".");
  const parts = cleaned.split(".");
  if (parts.length <= 1) return parts[0] ?? "";
  return `${parts[0]}.${parts.slice(1).join("").slice(0, 2)}`;
}

export default function TaxPanel(props: TaxPanelProps) {
  const [mode, setMode] = createSignal<TaxSwitcherMode>("primary");
  const [rateValue, setRateValue] = createSignal("");
  const [amountValue, setAmountValue] = createSignal("");
  const [bounce, setBounce] = createSignal(false);

  const isRate = () => mode() === "primary";
  const currencyMeta = () => getWizardCurrency(props.currency());

  const title = () =>
    isRate() ? "Tasa total del impuesto" : "Valor total del impuesto";

  const description = () =>
    isRate()
      ? "Tasa porcentual aplicada sobre el precio de compra del artículo"
      : "Monto total de los impuestos no incluidos en el precio de compra del artículo";

  const value = () => (isRate() ? rateValue() : amountValue());

  const handleInput = (raw: string) => {
    const next = sanitizeAmount(raw);
    if (isRate()) setRateValue(next);
    else setAmountValue(next);
  };

  const handleFocus = () => {
    setBounce(false);
    requestAnimationFrame(() => setBounce(true));
  };

  const handleContinue = () => {
    const current = value();
    if (!current) return;
    props.onContinue?.({ mode: mode(), value: current });
  };

  return (
    <div class="flex flex-col">
      <div class="flex items-center justify-between gap-3">
        <QuestionTitle
          title={title()}
          customClass="-mr-7 w-[16rem] tracking-4"
        />
        <TaxSwitcher value={mode} onChange={setMode} class="scale-[1.05]" />
      </div>

      <p class="mt-3.5 font-cutive text-base leading-6 text-foreground">
        {description()}
      </p>

      <div
        onAnimationEnd={(event) => {
          if (event.animationName === "touch-scale") setBounce(false);
        }}
        class={cn(
          "mt-4 flex flex-row items-center bg-surface rounded-full question-shadow py-2.5 pl-5 pr-4",
          bounce() && "animate-touch-scale"
        )}
      >
        <input
          type="text"
          inputmode="decimal"
          placeholder="0.00"
          value={value()}
          onFocus={handleFocus}
          onInput={(e) => handleInput(e.currentTarget.value)}
          class="flex-1 min-w-0 bg-transparent p-0 m-0 text-right font-ultra text-3xl text-foreground outline-none placeholder:text-foreground/40 mr-2"
        />
        <Show
          when={isRate()}
          fallback={
            <CurrencyIcon
              icon={currencyMeta().icon}
              variant="input"
              class="ml-2"
            />
          }
        >
          <div
            class="ml-2 size-8 shrink-0 text-foreground [&_svg]:block [&_svg]:size-7 [&_path]:fill-current"
            innerHTML={percentageIcon}
            aria-hidden="true"
          />
        </Show>
      </div>

      <hr class="mx-4 mt-6 h-px border-secondary" />
      <Button
        text="Continuar"
        onClick={handleContinue}
        disabled={!value()}
        customClass="question-shadow mt-6 mx-4"
      />
    </div>
  );
}
