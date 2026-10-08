import { BottomSheet } from "@/components/ui/BottomSheet";
import { cn } from "@/lib/utils";
import { For, createSignal, type Accessor } from "solid-js";
import { WEIGHT_UNIT_LABELS, type WeightUnit } from "./shipping";

const UNITS: WeightUnit[] = ["kg", "lb"];

export interface WeightUnitSelectorProps {
  value: Accessor<WeightUnit>;
  onChange: (unit: WeightUnit) => void;
}

export default function WeightUnitSelector(props: WeightUnitSelectorProps) {
  const [open, setOpen] = createSignal(false);
  const [bounce, setBounce] = createSignal(false);

  const handleOpen = () => {
    setBounce(false);
    requestAnimationFrame(() => setBounce(true));
    setOpen(true);
  };

  const handleSelect = (unit: WeightUnit) => {
    props.onChange(unit);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        onAnimationEnd={(event) => {
          if (event.animationName === "touch-scale") setBounce(false);
        }}
        class={cn(
          "flex shrink-0 items-center justify-center rounded-r-full bg-secondary px-4 py-2.5 font-cutive text-base text-foreground hover:cursor-pointer min-w-[3.5rem]",
          bounce() && "animate-touch-scale"
        )}
      >
        <span class="pt-1">{props.value()}</span>
      </button>

      <BottomSheet
        open={open()}
        onClose={() => setOpen(false)}
        title="Selecciona la unidad de peso"
      >
        <ul class="pb-4">
          <For each={UNITS}>
            {(unit) => (
              <li>
                <button
                  type="button"
                  onClick={() => handleSelect(unit)}
                  class={cn(
                    "w-full px-6 py-4 text-left font-cutive text-base text-foreground transition-colors hover:cursor-pointer hover:bg-muted/40",
                    props.value() === unit && "bg-muted/40"
                  )}
                >
                  {WEIGHT_UNIT_LABELS[unit]}
                </button>
                <hr class="mx-6 border-secondary" />
              </li>
            )}
          </For>
        </ul>
      </BottomSheet>
    </>
  );
}
