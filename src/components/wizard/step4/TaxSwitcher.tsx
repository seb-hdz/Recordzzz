import { cn } from "@/lib/utils";
import type { Accessor } from "solid-js";
import taxPercentageIcon from "@/assets/icons/register-steps/tax-percentage.svg?raw";
import taxAmountIcon from "@/assets/icons/register-steps/tax-amount.svg?raw";

export type TaxSwitcherMode = "primary" | "secondary";

export interface TaxSwitcherProps {
  value: Accessor<TaxSwitcherMode>;
  onChange: (mode: TaxSwitcherMode) => void;
  class?: string;
}

export default function TaxSwitcher(props: TaxSwitcherProps) {
  const isPrimary = () => props.value() === "primary";

  return (
    <div
      role="group"
      aria-label="Tipo de impuesto"
      class={cn(
        "relative flex shrink-0 items-center rounded-full bg-surface question-shadow p-1",
        props.class
      )}
    >
      <div
        aria-hidden="true"
        class={cn(
          "pointer-events-none absolute top-1 left-1 size-11 rounded-full bg-primary transition-transform duration-300 ease-out",
          isPrimary() ? "translate-x-0" : "translate-x-11"
        )}
      />
      <button
        type="button"
        aria-pressed={isPrimary()}
        aria-label="Tasa porcentual"
        onClick={() => props.onChange("primary")}
        class="relative z-10 flex size-11 items-center justify-center rounded-full hover:cursor-pointer"
      >
        <span
          class={cn(
            "flex size-6 items-center justify-center transition-colors duration-300 [&_svg]:block [&_svg]:size-6 [&_path]:fill-current [&_path]:stroke-current",
            isPrimary() ? "text-primary-foreground" : "text-primary"
          )}
          innerHTML={taxPercentageIcon}
        />
      </button>
      <button
        type="button"
        aria-pressed={!isPrimary()}
        aria-label="Monto total"
        onClick={() => props.onChange("secondary")}
        class="relative z-10 flex size-11 items-center justify-center rounded-full hover:cursor-pointer"
      >
        <span
          class={cn(
            "flex size-6 items-center justify-center transition-colors duration-300 [&_svg]:block [&_svg]:size-6 [&_path]:fill-current",
            !isPrimary() ? "text-primary-foreground" : "text-primary"
          )}
          innerHTML={taxAmountIcon}
        />
      </button>
    </div>
  );
}
