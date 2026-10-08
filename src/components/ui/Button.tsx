import { JSX, splitProps } from "solid-js";
import { cn } from "@/lib/utils";

export interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
}

export function Button(props: ButtonProps) {
  const [local, rest] = splitProps(props, [
    "variant",
    "size",
    "class",
    "children",
  ]);

  const variantClass = () => {
    switch (local.variant) {
      case "secondary":
        return "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-98";
      case "outline":
        return "border border-border bg-transparent text-foreground hover:bg-surface-raised active:scale-98";
      case "ghost":
        return "bg-transparent text-foreground hover:bg-surface-raised active:scale-98";
      case "destructive":
        return "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-98";
      case "primary":
      default:
        return "bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm active:scale-98";
    }
  };

  const sizeClass = () => {
    switch (local.size) {
      case "sm":
        return "h-8 px-3 text-xs rounded-md font-medium gap-1.5";
      case "lg":
        return "h-12 px-6 text-base rounded-xl font-semibold gap-2.5";
      case "icon":
        return "h-10 w-10 p-0 rounded-lg justify-center";
      case "md":
      default:
        return "h-10 px-4 text-sm rounded-lg font-medium gap-2";
    }
  };

  return (
    <button
      class={cn(
        "inline-flex items-center justify-center transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
        variantClass(),
        sizeClass(),
        local.class
      )}
      {...rest}
    >
      {local.children}
    </button>
  );
}
