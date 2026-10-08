import { Show, createEffect, createSignal, type Accessor } from "solid-js";
import type { Currency } from "@/domain/types";
import Button from "@/components/global/button";
import ImportPickerSheet from "./ImportPickerSheet";
import ShippingAmountInput from "./ShippingAmountInput";
import ShippingSwitcher from "./ShippingSwitcher";
import WeightUnitSelector from "./WeightUnitSelector";
import { ImportSummary } from "./AddShipping";
import {
  SYNTHETIC_IMPORTS,
  WEIGHT_UNIT_LABELS,
  sanitizeAmount,
  type ImportRecord,
  type ShippingMode,
  type WeightUnit,
} from "./shipping";

export interface ShippingPanelProps {
  currency: Accessor<Currency>;
  /** When false, locks to total amount and hides weight/import modes. Default true. */
  allowModeSwitch?: boolean;
  totalValue?: Accessor<string>;
  onTotalChange?: (value: string) => void;
  onContinue?: () => void;
}

const DEFAULT_WEIGHT_ITEM_COUNT = 2;

export default function ShippingPanel(props: ShippingPanelProps) {
  const allowModeSwitch = () => props.allowModeSwitch !== false;
  const [mode, setMode] = createSignal<ShippingMode>("total");
  const [internalTotal, setInternalTotal] = createSignal("");
  const totalValue = () => props.totalValue?.() ?? internalTotal();
  const setTotalValue = (value: string) => {
    if (props.onTotalChange) props.onTotalChange(value);
    else setInternalTotal(value);
  };
  const [weightValue, setWeightValue] = createSignal("");
  const [weightUnit, setWeightUnit] = createSignal<WeightUnit>("kg");
  const [selectedImportId, setSelectedImportId] = createSignal<string | null>(
    null
  );
  const [importPickerOpen, setImportPickerOpen] = createSignal(false);

  const selectedImport = (): ImportRecord | null =>
    SYNTHETIC_IMPORTS.find((record) => record.id === selectedImportId()) ??
    null;

  createEffect(() => {
    if (!allowModeSwitch()) return;
    if (mode() === "import" && !selectedImportId()) {
      setImportPickerOpen(true);
    }
  });

  const handleModeChange = (next: ShippingMode) => {
    if (!allowModeSwitch()) return;
    setMode(next);
    if (next === "import" && !selectedImportId()) {
      setImportPickerOpen(true);
    }
  };

  const handleImportSelect = (record: ImportRecord) => {
    setSelectedImportId(record.id);
  };

  const canContinue = () => {
    if (mode() === "total") return Boolean(totalValue());
    if (mode() === "weight") {
      return Boolean(totalValue()) && Boolean(weightValue());
    }
    return Boolean(selectedImport());
  };

  return (
    <div class="mx-4 mt-4 flex flex-col">
      <ShippingAmountInput
        mode={mode}
        currency={props.currency}
        totalValue={totalValue}
        onTotalChange={setTotalValue}
        selectedImport={selectedImport}
        prorateCount={() => DEFAULT_WEIGHT_ITEM_COUNT}
      />

      <Show when={allowModeSwitch() && mode() === "weight"}>
        <div class="mt-4 flex flex-row items-start gap-3">
          <div class="flex min-w-0 flex-1 flex-col items-end">
            <div class="flex w-full flex-row overflow-hidden rounded-full question-shadow">
              <input
                type="text"
                inputmode="decimal"
                placeholder="0.00"
                value={weightValue()}
                onInput={(e) =>
                  setWeightValue(sanitizeAmount(e.currentTarget.value))
                }
                class="min-w-0 flex-1 bg-surface px-5 py-3 text-right font-ultra text-2xl text-foreground outline-none placeholder:text-foreground/40"
              />
              <WeightUnitSelector value={weightUnit} onChange={setWeightUnit} />
            </div>
            <p class="mt-2 font-cutive text-sm text-muted-foreground">
              {WEIGHT_UNIT_LABELS[weightUnit()]}
            </p>
          </div>

          <div class="mt-1 h-16 w-px shrink-0 bg-border" aria-hidden="true" />

          <ShippingSwitcher
            value={mode}
            onChange={handleModeChange}
            class="mt-1 self-start"
          />
        </div>
      </Show>

      <Show when={allowModeSwitch() && mode() === "import"}>
        <div class="mt-4 flex flex-row items-start justify-between gap-3">
          <button
            type="button"
            aria-label={
              selectedImport()
                ? "Cambiar importación"
                : "Seleccionar importación"
            }
            onClick={() => setImportPickerOpen(true)}
            class="min-w-0 flex-1 rounded-md border border-dashed border-muted-foreground px-3 py-2.5 hover:cursor-pointer"
          >
            <Show
              when={selectedImport()}
              keyed
              fallback={
                <p class="text-center font-cutive text-sm leading-5 text-muted-foreground">
                  Seleccionar
                  <br />
                  importación...
                </p>
              }
            >
              {(record) => <ImportSummary record={record} />}
            </Show>
          </button>

          <div class="flex shrink-0 flex-col items-end">
            <ShippingSwitcher value={mode} onChange={handleModeChange} />
            <Show when={selectedImport()} keyed>
              {(record) => (
                <p class="mt-2 max-w-[11.5rem] text-right font-cutive text-sm leading-5 text-muted-foreground">
                  *: aproximado en base a otros{" "}
                  <span class="underline underline-offset-2">
                    {record.itemCount}
                  </span>{" "}
                  artículos
                </p>
              )}
            </Show>
          </div>
        </div>
      </Show>

      <Show when={allowModeSwitch() && mode() === "total"}>
        <div class="mt-4 flex justify-end">
          <ShippingSwitcher value={mode} onChange={handleModeChange} />
        </div>
      </Show>

      <Show when={allowModeSwitch()}>
        <ImportPickerSheet
          open={importPickerOpen()}
          onClose={() => setImportPickerOpen(false)}
          selectedId={selectedImportId}
          onSelect={handleImportSelect}
        />
      </Show>

      <hr class="mx-0 mt-6 h-px border-secondary" />
      <Button
        text="Continuar"
        onClick={() => props.onContinue?.()}
        disabled={!canContinue()}
        customClass="question-shadow mt-6"
      />
    </div>
  );
}
