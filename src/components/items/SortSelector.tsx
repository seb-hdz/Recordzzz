import checkSvg from "@/assets/icons/register-steps/check.svg?raw";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { cn } from "@/lib/utils";
import { For, Show, createSignal, type Accessor } from "solid-js";
import { FilterPillButton } from "./FilterPillButton";
import { SORT_OPTIONS, getSortOption, type SortKey } from "./sortOptions";

function SortOptionRow(props: {
  option: (typeof SORT_OPTIONS)[number];
  selected: Accessor<SortKey>;
  onSelect: (key: SortKey) => void;
}) {
  const isSelected = () => props.selected() === props.option.key;

  return (
    <li>
      <button
        type="button"
        onClick={() => props.onSelect(props.option.key)}
        class={cn(
          "flex w-full items-center gap-x-3 px-6 py-3.5 text-left transition-colors hover:cursor-pointer hover:bg-muted/40",
          isSelected() ? "text-primary" : "text-foreground"
        )}
      >
        <div
          class="size-8 shrink-0 [&_svg]:block [&_svg]:size-8"
          innerHTML={props.option.icon}
        />
        <span class="min-w-0 flex-1 font-cutive text-base pt-1">
          {props.option.label}
        </span>
        <Show when={isSelected()}>
          <span
            class="size-6 shrink-0 [&_svg]:block [&_svg]:size-6"
            innerHTML={checkSvg}
            aria-hidden="true"
          />
        </Show>
      </button>
      <hr class="border-foreground/80" />
    </li>
  );
}

export interface SortSelectorProps {
  value: Accessor<SortKey>;
  onChange: (key: SortKey) => void;
}

export default function SortSelector(props: SortSelectorProps) {
  const [open, setOpen] = createSignal(false);
  const current = () => getSortOption(props.value());

  const handleSelect = (key: SortKey) => {
    props.onChange(key);
    setOpen(false);
  };

  return (
    <>
      <FilterPillButton
        ariaLabel={`Orden: ${current().label}`}
        ariaExpanded={open()}
        onClick={() => setOpen(true)}
        class="px-4 py-2.5"
      >
        <div
          class="size-6 shrink-0 text-white [&_svg]:block [&_svg]:size-6"
          innerHTML={current().icon}
        />
      </FilterPillButton>

      <BottomSheet
        open={open()}
        onClose={() => setOpen(false)}
        title="Selecciona el orden de la lista"
      >
        <ul class="pb-4">
          <For each={SORT_OPTIONS}>
            {(option) => (
              <SortOptionRow
                option={option}
                selected={props.value}
                onSelect={handleSelect}
              />
            )}
          </For>
        </ul>
      </BottomSheet>
    </>
  );
}
