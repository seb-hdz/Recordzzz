import { cn } from "@/lib/utils";
import Spinner from "./spinner";
import { Show } from "solid-js";
import type { ParentComponent } from "solid-js";

interface ButtonProps {
  customClass?: string;
  text: string;
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

const Button: ParentComponent<ButtonProps> = (props) => {
  return (
    <button
      disabled={props.disabled}
      onClick={() => props.onClick()}
      class={cn(
        "bg-primary px-11 py-4 rounded-full transition-all duration-300 self-end relative",
        props.disabled || props.isLoading
          ? "bg-muted-foreground opacity-40"!
          : "hover:cursor-pointer",
        props.customClass
      )}
    >
      <Show when={!!props.text && !props.children}>
        <p
          class={cn(
            "font-ultra text-background text-2xl",
            props.isLoading ? "opacity-0" : ""
          )}
        >
          {props.text}
        </p>
      </Show>
      <Show when={!!props.children}>{props.children}</Show>
      {props.isLoading ? (
        <Spinner
          customClass={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          )}
        />
      ) : null}
    </button>
  );
};

export default Button;
