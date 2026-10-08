import searchSvg from "@/assets/icons/search.svg?raw";
import { cn } from "@/lib/utils";
import { createSignal, type Accessor } from "solid-js";

export interface SearchControlProps {
  expanded: Accessor<boolean>;
  hasText: Accessor<boolean>;
  onClick: () => void;
}

export default function SearchControl(props: SearchControlProps) {
  const [bounce, setBounce] = createSignal(false);

  return (
    <button
      type="button"
      aria-label={
        props.expanded()
          ? props.hasText()
            ? "Buscar"
            : "Cerrar búsqueda"
          : "Abrir búsqueda"
      }
      aria-expanded={props.expanded()}
      onClick={() => {
        setBounce(false);
        requestAnimationFrame(() => setBounce(true));
        props.onClick();
      }}
      onAnimationEnd={(event) => {
        if (event.animationName === "touch-scale") setBounce(false);
      }}
      class={cn(
        "flex size-12 shrink-0 items-center justify-center rounded-full text-white question-shadow transition-colors duration-300 hover:cursor-pointer",
        props.hasText() ? "bg-primary" : "bg-muted-foreground",
        bounce() && "animate-touch-scale"
      )}
    >
      <span
        class="size-6 [&_svg]:block [&_svg]:size-6"
        innerHTML={searchSvg}
        aria-hidden="true"
      />
    </button>
  );
}
