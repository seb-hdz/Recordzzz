import { Show, type Accessor } from "solid-js";
import type { Currency } from "@/domain/types";
import type { ShippingDraftPhase } from "@/domain/drafts";
import { decimalToCents } from "@/domain/money";
import AddShipping from "@/components/wizard/step4/AddShipping";
import SelectCurrency from "@/components/wizard/step4/SelectCurrency";
import ShippingPanel from "@/components/wizard/step4/ShippingPanel";

interface Step3Props {
  currency: Accessor<Currency>;
  amount: Accessor<string>;
  phase: Accessor<ShippingDraftPhase>;
  onCurrencyChange: (currency: Currency) => void;
  onAmountChange: (amount: string) => void;
  onPhaseChange: (phase: ShippingDraftPhase) => void;
  onContinueWithout: () => void;
  onContinueWithShipping: () => void;
}

export default function Step3(props: Step3Props) {
  const canSaveShipping = () => decimalToCents(props.amount()) > 0;

  return (
    <section class="flex flex-col mt-6 pb-8">
      <AddShipping
        phase={props.phase}
        onAddShipping={() => props.onPhaseChange("editing")}
        onClear={() => {
          props.onAmountChange("");
          props.onPhaseChange("idle");
        }}
        onContinueWithout={props.onContinueWithout}
      />
      <Show when={props.phase() === "editing"}>
        <div class="mt-6 pl-4">
          <SelectCurrency
            selected={props.currency}
            onSelectedChange={props.onCurrencyChange}
          />
        </div>
        <ShippingPanel
          currency={props.currency}
          allowModeSwitch={false}
          totalValue={props.amount}
          onTotalChange={props.onAmountChange}
          onContinue={() => {
            if (!canSaveShipping()) return;
            props.onContinueWithShipping();
          }}
        />
      </Show>
    </section>
  );
}
