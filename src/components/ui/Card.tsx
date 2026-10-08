import { JSX, splitProps } from "solid-js";
import { cn } from "@/lib/utils";

export interface CardProps extends JSX.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "raised" | "bordered" | "glass";
}

export function Card(props: CardProps) {
  const [local, rest] = splitProps(props, ["variant", "class", "children"]);

  const variantClass = () => {
    switch (local.variant) {
      case "raised":
        return "bg-surface-raised border border-surface-border shadow-sm";
      case "bordered":
        return "bg-surface border border-border";
      case "glass":
        return "glass-panel border border-border shadow-md";
      case "default":
      default:
        return "bg-surface border border-border/80 shadow-sm";
    }
  };

  return (
    <div
      class={cn("rounded-xl p-4 transition-all duration-200", variantClass(), local.class)}
      {...rest}
    >
      {local.children}
    </div>
  );
}
