import editSvg from "@/assets/icons/edit.svg?raw";
import trashSvg from "@/assets/icons/trash.svg?raw";
import { createEffect, onCleanup, type JSX } from "solid-js";

const REVEAL = 144;
const THRESHOLD = 48;

export interface SwipeRevealRowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  children: JSX.Element;
}

export default function SwipeRevealRow(props: SwipeRevealRowProps) {
  let sheet: HTMLDivElement | undefined;
  let startX = 0;
  let startY = 0;
  let origin = 0;
  let current = 0;
  let axis: "x" | "y" | null = null;
  let active = false;
  let dragging = false;
  let pointerId: number | null = null;

  const paint = (x: number, animate: boolean) => {
    current = Math.min(0, Math.max(-REVEAL, x));
    if (!sheet) return;
    sheet.style.transition = animate ? "transform 200ms ease-out" : "none";
    sheet.style.transform = `translate3d(${current}px, 0, 0)`;
  };

  const settle = (open: boolean) => {
    paint(open ? -REVEAL : 0, true);
    if (open !== props.open) props.onOpenChange(open);
  };

  createEffect(() => {
    const open = props.open;
    if (dragging) return;
    paint(open ? -REVEAL : 0, true);
  });

  const onMove = (event: PointerEvent) => {
    if (!active || event.pointerId !== pointerId) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    if (!axis) {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
      axis = Math.abs(dx) >= Math.abs(dy) ? "x" : "y";
      if (axis === "y") {
        active = false;
        return;
      }
      dragging = true;
    }
    event.preventDefault();
    paint(origin + dx, false);
  };

  const onUp = (event: PointerEvent) => {
    if (event.pointerId !== pointerId) return;
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    window.removeEventListener("pointercancel", onUp);
    const wasDragging = dragging;
    const x = current;
    active = false;
    dragging = false;
    axis = null;
    pointerId = null;
    if (!wasDragging) {
      if (props.open) props.onOpenChange(false);
      return;
    }
    settle(x <= -THRESHOLD);
  };

  const onDown = (event: PointerEvent) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const target = event.target;
    if (target instanceof Element && target.closest("[data-swipe-action]")) {
      return;
    }
    event.preventDefault();
    active = true;
    dragging = false;
    axis = null;
    pointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    origin = current;
    paint(current, false);
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  onCleanup(() => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    window.removeEventListener("pointercancel", onUp);
  });

  return (
    <div
      class="relative overflow-hidden select-none"
      style={{ "-webkit-user-drag": "none" }}
      onDragStart={(event) => event.preventDefault()}
    >
      <div class="absolute inset-y-0 right-0 z-0 flex w-36">
        <button
          type="button"
          data-swipe-action
          class="flex w-18 items-center justify-center bg-primary text-white"
          aria-label="Editar"
          onClick={() => props.onEdit()}
        >
          <span
            class="size-6 [&_svg]:block [&_svg]:size-6"
            innerHTML={editSvg}
            aria-hidden="true"
          />
        </button>
        <button
          type="button"
          data-swipe-action
          class="flex w-18 items-center justify-center bg-destructive text-white"
          aria-label="Eliminar"
          onClick={() => props.onDelete()}
        >
          <span
            class="size-6 [&_svg]:block [&_svg]:size-6"
            innerHTML={trashSvg}
            aria-hidden="true"
          />
        </button>
      </div>
      <div
        ref={(element) => {
          sheet = element;
          paint(props.open ? -REVEAL : 0, false);
        }}
        class="relative z-10 bg-background"
        style={{
          "touch-action": "pan-y",
          transform: "translate3d(0, 0, 0)",
        }}
        onPointerDown={onDown}
      >
        {props.children}
      </div>
    </div>
  );
}
