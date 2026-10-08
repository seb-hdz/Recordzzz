import { cn } from "@/lib/utils";
import { createSignal, type ParentComponent } from "solid-js";
import { PILL_CHEVRON } from "./pillChevron";

export const FilterPillButton: ParentComponent<{
  class?: string;
  onClick: () => void;
  ariaLabel: string;
  ariaExpanded: boolean;
}> = (props) => {
  const [bounce, setBounce] = createSignal(false);

  return (
    <button
      type="button"
      aria-label={props.ariaLabel}
      aria-haspopup="dialog"
      aria-expanded={props.ariaExpanded}
      onClick={() => {
        setBounce(false);
        requestAnimationFrame(() => setBounce(true));
        props.onClick();
      }}
      onAnimationEnd={(event) => {
        if (event.animationName === "touch-scale") setBounce(false);
      }}
      class={cn(
        "flex shrink-0 items-center gap-2 rounded-full bg-muted-foreground text-white question-shadow hover:cursor-pointer",
        bounce() && "animate-touch-scale",
        props.class
      )}
    >
      {props.children}
      <span
        class="size-3 shrink-0 text-white [&_svg]:block [&_svg]:size-3"
        innerHTML={PILL_CHEVRON}
        aria-hidden="true"
      />
    </button>
  );
};
