import Badge from "@/components/global/badge";
import { cn } from "@/lib/utils";
import { Show } from "solid-js";

export interface OptionTileProps {
  icon: string;
  active: boolean;
  badgeCount?: number;
  size?: "carousel" | "header";
  customClass?: string;
  onClick?: () => void;
}

export default function OptionTile(props: OptionTileProps) {
  const size = () => props.size ?? "carousel";
  const showBadge = () => (props.badgeCount ?? 0) > 0;

  return (
    <div
      class={cn(
        "relative flex items-center justify-center rounded-3xl transition-all duration-300 shrink-0",
        size() === "carousel"
          ? "size-20"
          : "size-16 bg-primary text-primary-foreground question-shadow",
        size() === "carousel" && props.active
          ? "bg-primary text-primary-foreground question-shadow"
          : size() === "carousel"
            ? "bg-primary/25 text-primary/50"
            : null,
        props.onClick && "hover:cursor-pointer",
        !props.onClick && "pointer-events-none",
        props.customClass
      )}
      onClick={() => props.onClick?.()}
      role={props.onClick ? "button" : undefined}
    >
      <div
        class={cn(
          "flex items-center justify-center [&>svg]:w-full [&>svg]:h-full",
          size() === "carousel"
            ? props.active
              ? "size-10"
              : "size-8"
            : "size-9"
        )}
        innerHTML={props.icon}
      />
      <Show when={showBadge()}>
        <Badge
          text={String(props.badgeCount)}
          customClass="absolute -top-1.5 -right-1.5 z-1 bg-ring"
          customTextClass="font-ultra text-base text-muted-foreground"
        />
      </Show>
    </div>
  );
}
