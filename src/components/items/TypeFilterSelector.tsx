import vinylGreenSvg from "@/assets/icons/item-types/vinyl-green.svg?raw";
import cdGreenSvg from "@/assets/icons/item-types/cd-green.svg?raw";
import boxsetGreenSvg from "@/assets/icons/item-types/boxset-green.svg?raw";
import otherGreenSvg from "@/assets/icons/item-types/other-green.svg?raw";
import checkSvg from "@/assets/icons/register-steps/check.svg?raw";
import { BottomSheet } from "@/components/ui/BottomSheet";
import {
  ITEM_TYPES,
  multiSvg,
  type ItemTypeKey,
} from "@/components/wizard/step2/itemTypes";
import { cn } from "@/lib/utils";
import { For, Show, createSignal, type Accessor } from "solid-js";
import { FilterPillButton } from "./FilterPillButton";

const TYPE_KEYS = Object.keys(ITEM_TYPES) as ItemTypeKey[];

const TYPE_GREEN_ICONS: Record<ItemTypeKey, string> = {
  vinyl: vinylGreenSvg,
  cd: cdGreenSvg,
  boxset: boxsetGreenSvg,
  other: otherGreenSvg,
};

function TypeFilterRow(props: {
  typeKey: ItemTypeKey;
  selected: Accessor<ItemTypeKey[]>;
  onToggle: (key: ItemTypeKey) => void;
}) {
  const isSelected = () => props.selected().includes(props.typeKey);

  return (
    <li>
      <button
        type="button"
        onClick={() => props.onToggle(props.typeKey)}
        class="flex w-full items-center gap-x-3 px-6 py-3.5 text-left hover:cursor-pointer hover:bg-muted/40"
      >
        <div
          class="h-8 shrink-0 [&_svg]:h-8 [&_svg]:w-auto [&_svg]:block"
          innerHTML={TYPE_GREEN_ICONS[props.typeKey]}
        />
        <span
          class={cn(
            "min-w-0 flex-1 font-ultra text-xl leading-none pt-1 transition-colors",
            isSelected() ? "text-primary" : "text-foreground"
          )}
        >
          {ITEM_TYPES[props.typeKey].text}
        </span>
        <Show when={isSelected()}>
          <span
            class="size-6 shrink-0 text-primary [&_svg]:block [&_svg]:size-6"
            innerHTML={checkSvg}
            aria-hidden="true"
          />
        </Show>
      </button>
      <hr class="border-foreground/80" />
    </li>
  );
}

export interface TypeFilterSelectorProps {
  selected: Accessor<ItemTypeKey[]>;
  onSelectedChange: (selected: ItemTypeKey[]) => void;
}

export default function TypeFilterSelector(props: TypeFilterSelectorProps) {
  const [open, setOpen] = createSignal(false);

  const selectedLabels = () =>
    props.selected().map((key) => ITEM_TYPES[key].text).join(", ");

  const triggerIcon = () => {
    const selected = props.selected();
    if (selected.length > 1) return multiSvg;
    if (selected.length === 1) return ITEM_TYPES[selected[0]].icon;
    return undefined;
  };

  const toggle = (key: ItemTypeKey) => {
    const current = props.selected();
    props.onSelectedChange(
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key]
    );
  };

  return (
    <>
      <FilterPillButton
        ariaLabel="Filtros por tipo"
        ariaExpanded={open()}
        onClick={() => setOpen(true)}
        class="px-5 py-2.5"
      >
        <Show
          when={props.selected().length > 0}
          fallback={
            <span class="font-ultra text-xl text-white leading-none pt-1 whitespace-nowrap">
              Filtros
            </span>
          }
        >
          <div
            class={cn(
              "h-6 shrink-0 [&_svg]:h-6 [&_svg]:w-auto [&_svg]:block",
              props.selected().length > 1 && "[&_path]:fill-white"
            )}
            innerHTML={triggerIcon()}
          />
          <span class="font-ultra text-xl text-white leading-none pt-1 whitespace-nowrap">
            {selectedLabels()}
          </span>
        </Show>
      </FilterPillButton>

      <BottomSheet
        open={open()}
        onClose={() => setOpen(false)}
        title="Selecciona filtro por tipo"
      >
        <ul class="pb-4">
          <For each={TYPE_KEYS}>
            {(typeKey) => (
              <TypeFilterRow
                typeKey={typeKey}
                selected={props.selected}
                onToggle={toggle}
              />
            )}
          </For>
        </ul>
      </BottomSheet>
    </>
  );
}
