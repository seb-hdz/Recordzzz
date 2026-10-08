import { Show, type Accessor } from "solid-js";
import type { Currency } from "@/domain/types";
import { decimalToCents } from "@/domain/money";
import Button from "@/components/global/button";
import QuestionTitle from "../QuestionTitle";
import PriceAnimation from "./PriceAnimation";
import PriceInput from "./PriceInput";
import SelectCurrency from "./SelectCurrency";
import AddTaxes, { type AddTaxesPhase, type ConfirmedTax } from "./AddTaxes";
import TaxPanel from "./TaxPanel";

interface Step4Props {
  currency: Accessor<Currency>;
  amount: Accessor<string>;
  taxesPhase: Accessor<AddTaxesPhase>;
  confirmedTax: Accessor<ConfirmedTax | null>;
  onCurrencyChange: (currency: Currency) => void;
  onAmountChange: (amount: string) => void;
  onTaxesPhaseChange: (phase: AddTaxesPhase) => void;
  onConfirmedTaxChange: (tax: ConfirmedTax | null) => void;
  onContinue: () => void;
}

export default function Step4(props: Step4Props) {
  const canAdvance = () => decimalToCents(props.amount()) > 0;

  const clearTaxes = () => {
    props.onTaxesPhaseChange("idle");
    props.onConfirmedTaxChange(null);
  };

  const advance = () => {
    if (!canAdvance()) return;
    props.onContinue();
  };

  return (
    <section class="flex flex-col mt-6">
      <div class="flex w-full justify-between items-end px-8 relative">
        <QuestionTitle
          title="¿Cuánto costó el artículo?"
          customClass="w-[25rem] -mr-7"
        />
        <div class="flex-1 flex flex-row items-end absolute right-4 top-9">
          <PriceAnimation />
        </div>
      </div>
      <div class="mt-12 flex flex-row items-center gap-3 px-4">
        <SelectCurrency
          selected={props.currency}
          onSelectedChange={props.onCurrencyChange}
        />
        <PriceInput
          currency={props.currency}
          value={props.amount}
          onValueChange={props.onAmountChange}
          customClass="flex-1"
        />
      </div>
      <div class="mt-6">
        <AddTaxes
          phase={props.taxesPhase}
          confirmed={props.confirmedTax}
          currency={props.currency}
          continueDisabled={!canAdvance()}
          onAddTaxes={() => props.onTaxesPhaseChange("editing")}
          onClear={clearTaxes}
          onContinueWithout={advance}
        />
      </div>
      <Show when={props.taxesPhase() === "editing"}>
        <div class="mx-4 mt-6">
          <TaxPanel
            currency={props.currency}
            onContinue={(tax) => {
              props.onConfirmedTaxChange(tax);
              props.onTaxesPhaseChange("confirmed");
            }}
          />
        </div>
      </Show>
      <Show when={props.taxesPhase() === "confirmed"}>
        <Button
          text="Continuar"
          disabled={!canAdvance()}
          onClick={advance}
          customClass="question-shadow mt-6 mx-4"
        />
      </Show>
    </section>
  );
}
