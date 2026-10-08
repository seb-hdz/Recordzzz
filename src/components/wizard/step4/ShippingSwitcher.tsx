import { BottomSheet } from "@/components/ui/BottomSheet";
import { cn } from "@/lib/utils";
import { For, createSignal, type Accessor } from "solid-js";
import { SHIPPING_MODE_LABELS, type ShippingMode } from "./shipping";

const chevronIcon = `<svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const MODES: ShippingMode[] = ["total", "weight", "import"];

export interface ShippingSwitcherProps {
  value: Accessor<ShippingMode>;
  onChange: (mode: ShippingMode) => void;
  class?: string;
}

export default function ShippingSwitcher(props: ShippingSwitcherProps) {
  const [open, setOpen] = createSignal(false);
  const [bounce, setBounce] = createSignal(false);

  const handleOpen = () => {
    setBounce(false);
    requestAnimationFrame(() => setBounce(true));
    setOpen(true);
  };

  const handleSelect = (mode: ShippingMode) => {
    props.onChange(mode);
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
          "flex shrink-0 flex-row items-center gap-2 rounded-full bg-secondary px-4 py-2.5 question-shadow hover:cursor-pointer",
          bounce() && "animate-touch-scale",
          props.class
        )}
      >
        <span class="font-cutive text-base text-foreground pt-1">
          {SHIPPING_MODE_LABELS[props.value()]}
        </span>
        <span
          class="size-3 shrink-0 text-muted-foreground [&_svg]:block [&_svg]:size-3"
          innerHTML={chevronIcon}
          aria-hidden="true"
        />
      </button>

      <BottomSheet
        open={open()}
        onClose={() => setOpen(false)}
        title="Selecciona el tipo de costo de envío"
      >
        <ul class="pb-4">
          <For each={MODES}>
            {(mode) => (
              <li>
                <button
                  type="button"
                  onClick={() => handleSelect(mode)}
                  class={cn(
                    "w-full px-6 py-4 text-left font-cutive text-base text-foreground transition-colors hover:cursor-pointer hover:bg-muted/40",
                    props.value() === mode && "bg-muted/40"
                  )}
                >
                  {SHIPPING_MODE_LABELS[mode]}
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
