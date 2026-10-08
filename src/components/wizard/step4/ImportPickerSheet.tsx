import { BottomSheet } from "@/components/ui/BottomSheet";
import { cn } from "@/lib/utils";
import { For, Show, createSignal, type Accessor } from "solid-js";
import type { Currency } from "@/domain/types";
import CurrencyIcon from "./CurrencyIcon";
import { getWizardCurrency } from "./currencies";
import {
  SYNTHETIC_IMPORTS,
  formatImportDatetime,
  type ImportRecord,
} from "./shipping";

export interface ImportPickerSheetProps {
  open: boolean;
  onClose: () => void;
  selectedId: Accessor<string | null>;
  onSelect: (record: ImportRecord) => void;
}

function ImportRow(props: {
  record: ImportRecord;
  selected: boolean;
  onSelect: () => void;
}) {
  const currencyMeta = () => getWizardCurrency(props.record.currency);

  return (
    <li>
      <button
        type="button"
        onClick={props.onSelect}
        class={cn(
          "flex flex-col gap-x-3 gap-y-1 px-6 py-4 text-left transition-colors hover:cursor-pointer hover:bg-muted/40 w-full",
          props.selected && "bg-muted/40"
        )}
      >
        <div class="flex flex-row items-start justify-between gap-1 w-full">
          <div>
            <p class="min-w-0 font-cutive text-base text-foreground truncate whitespace-normal">
              {props.record.name}
            </p>
            <p class="font-cutive text-sm text-muted-foreground">
              {formatImportDatetime(props.record.datetime)}
            </p>
          </div>
          <div class="flex flex-col items-end">
            <p class="font-cutive text-sm text-muted-foreground text-right">
              {props.record.itemCount} artículos
            </p>
            <div class="inline-flex flex-row shrink-0 items-center gap-1">
              <p class="font-ultra text-xl text-muted-foreground whitespace-nowrap">
                {props.record.shippingAmount}
              </p>
              <CurrencyIcon
                icon={currencyMeta().icon}
                variant="modal"
                class="size-5 [&_svg]:size-5 pb-3.5 pl-0.5"
              />
            </div>
            <p class="-mt-1.5 text-muted-foreground">de envío</p>
          </div>
        </div>
      </button>
      <hr class="mx-6 border-secondary" />
    </li>
  );
}

export default function ImportPickerSheet(props: ImportPickerSheetProps) {
  return (
    <BottomSheet
      open={props.open}
      onClose={props.onClose}
      title="Selecciona una importación"
    >
      <Show
        when={SYNTHETIC_IMPORTS.length > 0}
        fallback={
          <p class="px-6 pb-6 font-cutive text-base text-muted-foreground">
            No hay importaciones registradas.
          </p>
        }
      >
        <ul class="pb-4">
          <For each={SYNTHETIC_IMPORTS}>
            {(record) => (
              <ImportRow
                record={record}
                selected={props.selectedId() === record.id}
                onSelect={() => {
                  props.onSelect(record);
                  props.onClose();
                }}
              />
            )}
          </For>
        </ul>
      </Show>
    </BottomSheet>
  );
}
