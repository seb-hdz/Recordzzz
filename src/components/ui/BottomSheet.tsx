import {
  JSX,
  Show,
  createEffect,
  onCleanup,
  type ParentComponent,
} from "solid-js";
import { Portal } from "solid-js/web";
import { cn } from "@/lib/utils";

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: JSX.Element;
  class?: string;
}

function lockBodyScroll() {
  const scrollY = window.scrollY;
  const { body, documentElement } = document;
  const prev = {
    bodyOverflow: body.style.overflow,
    bodyPosition: body.style.position,
    bodyTop: body.style.top,
    bodyWidth: body.style.width,
    htmlOverflow: documentElement.style.overflow,
  };

  body.style.overflow = "hidden";
  body.style.position = "fixed";
  body.style.top = `-${scrollY}px`;
  body.style.width = "100%";
  documentElement.style.overflow = "hidden";

  return () => {
    body.style.overflow = prev.bodyOverflow;
    body.style.position = prev.bodyPosition;
    body.style.top = prev.bodyTop;
    body.style.width = prev.bodyWidth;
    documentElement.style.overflow = prev.htmlOverflow;
    window.scrollTo(0, scrollY);
  };
}

export const BottomSheet: ParentComponent<BottomSheetProps> = (props) => {
  createEffect(() => {
    if (!props.open) return;
    const unlock = lockBodyScroll();
    onCleanup(unlock);
  });

  const preventFocusScroll = (event: MouseEvent) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.closest("input, textarea, select, [contenteditable]")) return;
    event.preventDefault();
  };

  return (
    <Show when={props.open}>
      <Portal>
        <div class="fixed inset-0 z-50 flex items-end justify-center overflow-hidden overscroll-none">
          <div
            class="fixed inset-0 bg-black/40 transition-opacity animate-fade-in"
            onClick={props.onClose}
            aria-hidden="true"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={props.title ? "bottom-sheet-title" : undefined}
            onMouseDown={preventFocusScroll}
            class={cn(
              "relative z-10 w-full max-w-lg rounded-t-3xl bg-surface question-shadow animate-slide-up safe-bottom",
              props.class
            )}
          >
            {props.title && (
              <h2
                id="bottom-sheet-title"
                class="font-ultra text-3xl text-foreground px-6 pt-6 pb-6"
              >
                {props.title}
              </h2>
            )}
            {props.children}
          </div>
        </div>
      </Portal>
    </Show>
  );
};
