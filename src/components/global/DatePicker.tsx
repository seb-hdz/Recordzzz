import { createSignal, createUniqueId, type Accessor } from "solid-js";
import { cn } from "@/lib/utils";
import { formatDateDisplay } from "@/domain/dates";

const chevronIcon = `<svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export interface DatePickerProps {
  label: string;
  value: Accessor<string>;
  onChange: (ymd: string) => void;
  min?: string;
  max?: string;
  class?: string;
  textClass?: string;
}

export default function DatePicker(props: DatePickerProps) {
  const inputId = createUniqueId();
  const [bounce, setBounce] = createSignal(false);

  const display = () => formatDateDisplay(props.value()) || "Seleccionar";

  const handlePointerDown = () => {
    setBounce(false);
    requestAnimationFrame(() => setBounce(true));
  };

  return (
    <div class={cn("flex flex-col items-start gap-1", props.class)}>
      <label
        for={inputId}
        class={cn(
          "font-cutive text-sm text-foreground leading-none pt-1",
          props.textClass
        )}
      >
        {props.label}
      </label>
      <div
        class="relative inline-flex"
        onPointerDown={handlePointerDown}
        onAnimationEnd={(event) => {
          if (event.animationName === "touch-scale") setBounce(false);
        }}
      >
        <div
          class={cn(
            "pointer-events-none inline-flex items-center gap-2 rounded-full bg-ring question-shadow px-5 py-2.5",
            bounce() && "animate-touch-scale"
          )}
        >
          <span class="font-cutive text-sm text-foreground leading-none pt-1">
            {display()}
          </span>
          <span
            class="size-3 shrink-0 text-foreground [&_svg]:block [&_svg]:size-3"
            innerHTML={chevronIcon}
            aria-hidden="true"
          />
        </div>
        <input
          id={inputId}
          type="date"
          value={props.value()}
          min={props.min}
          max={props.max}
          onInput={(e) => props.onChange(e.currentTarget.value)}
          class={cn(
            "absolute inset-0 z-10 cursor-pointer opacity-0",
            "[&::-webkit-calendar-picker-indicator]:absolute",
            "[&::-webkit-calendar-picker-indicator]:inset-0",
            "[&::-webkit-calendar-picker-indicator]:h-full",
            "[&::-webkit-calendar-picker-indicator]:w-full",
            "[&::-webkit-calendar-picker-indicator]:cursor-pointer"
          )}
        />
      </div>
    </div>
  );
}
