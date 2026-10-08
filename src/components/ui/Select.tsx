import { JSX, splitProps } from "solid-js";
import { cn } from "@/lib/utils";

export interface SelectProps extends JSX.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export function Select(props: SelectProps) {
  const [local, rest] = splitProps(props, ["class", "error", "children"]);

  return (
    <div class="w-full relative">
      <select
        class={cn(
          "flex h-11 w-full appearance-none rounded-xl border border-input bg-surface px-3.5 py-2 pr-10 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
          local.error && "border-destructive focus-visible:ring-destructive",
          local.class
        )}
        {...rest}
      >
        {local.children}
      </select>
      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
        <svg
          class="h-4 w-4 fill-current"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </div>
      {local.error && (
        <span class="mt-1 text-xs text-destructive font-medium block">
          {local.error}
        </span>
      )}
    </div>
  );
}
