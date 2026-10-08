import { JSX, splitProps } from "solid-js";
import { cn } from "@/lib/utils";

export interface BadgeProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "outline"
    | "success"
    | "warning"
    | "destructive";
  size?: "sm" | "md";
}

export function Badge(props: BadgeProps) {
  const [local, rest] = splitProps(props, [
    "variant",
    "size",
    "class",
    "children",
  ]);

  const variantClass = () => {
    switch (local.variant) {
      case "primary":
        return "bg-primary/15 text-primary border border-primary/20";
      case "secondary":
        return "bg-secondary text-secondary-foreground border border-border/50";
      case "outline":
        return "bg-transparent text-foreground border border-border";
      case "success":
        return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";
      case "warning":
        return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20";
      case "destructive":
        return "bg-destructive/15 text-destructive border border-destructive/20";
      case "default":
      default:
        return "bg-surface-raised text-foreground border border-surface-border";
    }
  };

  const sizeClass = () => {
    return local.size === "sm"
      ? "px-2 py-0.5 text-[11px] rounded-md font-medium"
      : "px-2.5 py-1 text-xs rounded-lg font-semibold";
  };

  return (
    <span
      class={cn(
        "inline-flex items-center gap-1 font-medium transition-colors",
        variantClass(),
        sizeClass(),
        local.class
      )}
      {...rest}
    >
      {local.children}
    </span>
  );
}
