import { JSX, splitProps } from "solid-js";
import { cn } from "@/lib/utils";

export interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export function Input(props: InputProps) {
  const [local, rest] = splitProps(props, ["class", "error"]);

  return (
    <div class="w-full">
      <input
        class={cn(
          "flex h-11 w-full rounded-xl border border-input bg-surface px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
          local.error && "border-destructive focus-visible:ring-destructive",
          local.class
        )}
        {...rest}
      />
      {local.error && (
        <span class="mt-1 text-xs text-destructive font-medium block">
          {local.error}
        </span>
      )}
    </div>
  );
}
