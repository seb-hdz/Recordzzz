import { cn } from "@/lib/utils";

interface CurrencyIconProps {
  icon: string;
  variant?: "input" | "modal";
  class?: string;
}

export default function CurrencyIcon(props: CurrencyIconProps) {
  const isModal = (props.variant ?? "input") === "modal";

  return (
    <div
      class={cn(
        "size-8 [&_svg]:size-8 shrink-0",
        isModal ? "text-muted-foreground" : "text-black",
        "[&_svg]:block [&_path]:fill-current",
        props.class
      )}
      innerHTML={props.icon}
      aria-hidden="true"
    />
  );
}
