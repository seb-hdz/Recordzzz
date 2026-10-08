import { Show, type Accessor } from "solid-js";
import Button from "@/components/global/button";
import addShippingIcon from "@/assets/icons/register-steps/add-shipping.svg?raw";
import removeShippingIcon from "@/assets/icons/register-steps/item-types/remove-shipping.svg?raw";
import QuestionTitle from "../QuestionTitle";
import { cn } from "@/lib/utils";
import {
  SHIPPING_MODE_LABELS,
  WEIGHT_UNIT_LABELS,
  formatImportDate,
  formatImportTime,
  type ImportRecord,
} from "./shipping";

export type AddShippingPhase = "idle" | "editing";

export interface AddShippingProps {
  phase: Accessor<AddShippingPhase>;
  onAddShipping?: () => void;
  onClear?: () => void;
  onContinueWithout?: () => void;
}

function RemoveShippingButton(props: { onClear?: () => void; class?: string }) {
  return (
    <button
      type="button"
      aria-label="Quitar costo de envío"
      onClick={() => props.onClear?.()}
      class={cn(
        " shrink-0 rounded-full bg-muted-foreground p-2 question-shadow hover:cursor-pointer",
        props.class
      )}
    >
      <div
        class="size-7 [&_svg]:block [&_svg]:size-7"
        innerHTML={removeShippingIcon}
        aria-hidden="true"
      />
    </button>
  );
}

export default function AddShipping(props: AddShippingProps) {
  return (
    <Show
      when={props.phase() !== "idle"}
      fallback={
        <div class="flex flex-col">
          <QuestionTitle
            title="¿Agregas costo de envío?"
            customClass="mb-6 pl-4"
          />
          <div class="flex flex-row items-center justify-between -mt-4 pl-4">
            <div class="flex flex-col items-center gap-2">
              <Button
                text="Continuar"
                onClick={() => props.onContinueWithout?.()}
                customClass="question-shadow px-6"
              />
              <p class="text-sm font-cutive">sin agregar</p>
            </div>
            <button type="button" onClick={() => props.onAddShipping?.()}>
              <div class="question-shadow flex w-[8.5rem] flex-col items-center rounded-l-3xl bg-surface px-5 pb-4 pt-5">
                <div class="flex size-16 items-center justify-center rounded-full bg-muted-foreground question-shadow">
                  <div
                    class="size-10 [&_svg]:block [&_svg]:size-10"
                    innerHTML={addShippingIcon}
                  />
                </div>
                <p class="mt-3 font-cutive text-xl text-foreground">Agregar</p>
              </div>
            </button>
          </div>
        </div>
      }
    >
      <div class="flex flex-row items-end justify-between gap-3 pl-4">
        <QuestionTitle
          title="Agregas costo de envío"
          customClass="min-w-0 -mr-4"
        />
        <div class="shrink-0 rounded-l-3xl bg-surface py-2 pl-4 pr-3 question-shadow">
          <RemoveShippingButton onClear={props.onClear} />
        </div>
      </div>
    </Show>
  );
}

export function ImportSummary(props: { record: ImportRecord }) {
  return (
    <div class="flex min-w-0 flex-col items-end text-right">
      <p class="font-cutive text-sm leading-5 text-muted-foreground">
        {props.record.name}
      </p>
      <hr class="my-1.5 w-full border-border" />
      <p class="font-cutive text-sm leading-5 text-muted-foreground">
        {formatImportTime(props.record.datetime)}
      </p>
      <p class="font-cutive text-sm leading-5 text-muted-foreground">
        {formatImportDate(props.record.datetime)}
      </p>
    </div>
  );
}

export { SHIPPING_MODE_LABELS, WEIGHT_UNIT_LABELS };
