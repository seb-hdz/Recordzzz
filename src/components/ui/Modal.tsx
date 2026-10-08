import { JSX, Show, createEffect, onCleanup, ParentComponent } from "solid-js";
import { cn } from "@/lib/utils";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: JSX.Element;
  class?: string;
}

export const Modal: ParentComponent<ModalProps> = (props) => {
  createEffect(() => {
    if (props.open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  });

  onCleanup(() => {
    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
    }
  });

  return (
    <Show when={props.open}>
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          class="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
          onClick={props.onClose}
        />

        {/* Modal Box */}
        <div
          class={cn(
            "relative w-full max-w-lg rounded-2xl bg-surface border border-border p-6 shadow-2xl z-10 animate-fade-in",
            props.class
          )}
        >
          {props.title && (
            <div class="mb-4 flex items-center justify-between">
              <h3 class="text-lg font-bold text-foreground">{props.title}</h3>
              <button
                type="button"
                class="rounded-full p-1.5 text-muted-foreground hover:bg-surface-raised hover:text-foreground transition-colors cursor-pointer"
                onClick={props.onClose}
              >
                <svg
                  class="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}
          {props.children}
        </div>
      </div>
    </Show>
  );
};
