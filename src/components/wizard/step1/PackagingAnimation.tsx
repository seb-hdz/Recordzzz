import { createEffect, createSignal, onCleanup } from "solid-js";
import discSvg from "@/assets/icons/register-steps/disc.svg?raw";
import boxSvg from "@/assets/icons/register-steps/box.svg?raw";
import { cn } from "@/lib/utils";

type Phase = "idle" | "converging" | "settled";

export interface PackagingAnimationProps {
  /** When true, runs the one-shot converge → settled sequence. Remount to replay. */
  ready?: boolean;
  /** Disc final offset from its idle position (px). */
  discMeetX?: number;
  discMeetY?: number;
  /** Box final offset from its idle position (px). */
  boxMeetX?: number;
  boxMeetY?: number;
  /** Delay before the box starts its bounce + fly (ms). */
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

export default function PackagingAnimation(props: PackagingAnimationProps) {
  const [phase, setPhase] = createSignal<Phase>("idle");

  createEffect(() => {
    if (props.ready && phase() === "idle") {
      setPhase("converging");
    }
  });

  const cssVars = () =>
    ({
      "--disc-meet-x": `${props.discMeetX ?? DEFAULTS.discMeetX}px`,
      "--disc-meet-y": `${props.discMeetY ?? DEFAULTS.discMeetY}px`,
      "--box-meet-x": `${props.boxMeetX ?? DEFAULTS.boxMeetX}px`,
      "--box-meet-y": `${props.boxMeetY ?? DEFAULTS.boxMeetY}px`,
      "--box-delay": `${props.boxDelayMs ?? DEFAULTS.boxDelayMs}ms`,
    } as Record<string, string>);

  const onBoxAnimationEnd = (event: AnimationEvent) => {
    if (event.animationName !== "packaging-box-converge") return;
    setPhase("settled");
  };

  createEffect(() => {
    if (phase() !== "converging") return;
    const delay = props.boxDelayMs ?? DEFAULTS.boxDelayMs;
    const id = window.setTimeout(() => setPhase("settled"), delay + 1100);
    onCleanup(() => clearTimeout(id));
  });

  const accented = () => phase() !== "idle";

  return (
    <div
      class={cn("packaging-stage", props.class)}
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
