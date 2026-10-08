import type { Currency } from "@/domain/types";
import { cn } from "@/lib/utils";
import { createSignal, type Accessor } from "solid-js";
import CurrencyIcon from "./CurrencyIcon";
import { getWizardCurrency } from "./currencies";

export interface PriceInputProps {
  currency: Accessor<Currency>;
  value: Accessor<string>;
  onValueChange: (value: string) => void;
  customClass?: string;
}

function sanitizeAmount(raw: string): string {
  const cleaned = raw.replace(/[^\d.,]/g, "").replace(",", ".");
  const parts = cleaned.split(".");
  if (parts.length <= 1) return parts[0] ?? "";
  return `${parts[0]}.${parts.slice(1).join("").slice(0, 2)}`;
}

export default function PriceInput(props: PriceInputProps) {
  const [bounce, setBounce] = createSignal(false);
  const currencyMeta = () => getWizardCurrency(props.currency());

  const handleInput = (raw: string) => {
    props.onValueChange(sanitizeAmount(raw));
  };

  const handleFocus = () => {
    setBounce(false);
    requestAnimationFrame(() => setBounce(true));
  };

  return (
    <div
      onAnimationEnd={(event) => {
        if (event.animationName === "touch-scale") setBounce(false);
      }}
      class={cn(
        "flex flex-row items-center w-full bg-surface rounded-full question-shadow py-2.5 pl-5 pr-4 min-w-0",
        bounce() && "animate-touch-scale",
        props.customClass
      )}
    >
      <input
        type="text"
        inputmode="decimal"
        placeholder="0.00"
        value={props.value()}
        onFocus={handleFocus}
        onInput={(e) => handleInput(e.currentTarget.value)}
        class="flex-1 font-ultra text-3xl text-foreground bg-transparent outline-none text-right min-w-0 p-0 m-0 placeholder:text-foreground/40 mr-1"
      />
      <CurrencyIcon icon={currencyMeta().icon} variant="input" class="ml-2" />
    </div>
  );
}
