import { createEffect, createSignal, onCleanup, onMount } from "solid-js";
import discSvg from "@/assets/icons/register-steps/disc.svg?raw";
import boxSvg from "@/assets/icons/register-steps/box.svg?raw";
import { cn } from "@/lib/utils";

type Phase = "unpacking" | "idle" | "ready";

export interface UnpackAnimationProps {
  /** When true, paints both icons primary at their original positions. Remount to replay unpack. */
  ready?: boolean;
  discMeetX?: number;
  discMeetY?: number;
  boxMeetX?: number;
  boxMeetY?: number;
  boxDelayMs?: number;
  class?: string;
}

const DEFAULTS = {
  discMeetX: -2,
  discMeetY: 14,
  boxMeetX: -10,
  boxMeetY: -21,
  boxDelayMs: 450,
} as const;

export default function UnpackAnimation(props: UnpackAnimationProps) {
  const [phase, setPhase] = createSignal<Phase>("unpacking");

  onMount(() => {
    const delay = props.boxDelayMs ?? DEFAULTS.boxDelayMs;
    const id = window.setTimeout(() => {
      if (!props.ready) setPhase("idle");
    }, delay + 1100);
    onCleanup(() => clearTimeout(id));
  });

  createEffect(() => {
    if (props.ready) setPhase("ready");
  });

  const cssVars = () =>
    ({
      "--disc-meet-x": `${props.discMeetX ?? DEFAULTS.discMeetX}px`,
      "--disc-meet-y": `${props.discMeetY ?? DEFAULTS.discMeetY}px`,
      "--box-meet-x": `${props.boxMeetX ?? DEFAULTS.boxMeetX}px`,
      "--box-meet-y": `${props.boxMeetY ?? DEFAULTS.boxMeetY}px`,
      "--box-delay": `${props.boxDelayMs ?? DEFAULTS.boxDelayMs}ms`,
    }) as Record<string, string>;

  const onBoxAnimationEnd = (event: AnimationEvent) => {
    if (event.animationName !== "unpack-box-diverge") return;
    if (!props.ready) setPhase("idle");
  };

  const accented = () => phase() === "ready";

  return (
    <div
      class={cn("unpack-stage packaging-stage", props.class)}
      data-phase={phase()}
      style={cssVars()}
    >
      <div
        role="img"
        aria-label="Disc"
        class={cn(
          "packaging-icon packaging-disc",
          accented() ? "text-primary" : "text-muted-foreground"
        )}
        innerHTML={discSvg}
      />
      <div
        role="img"
        aria-label="Box"
        class={cn(
          "packaging-icon packaging-box",
          accented() ? "text-primary" : "text-muted-foreground"
        )}
        innerHTML={boxSvg}
        onAnimationEnd={onBoxAnimationEnd}
      />
    </div>
  );
}
