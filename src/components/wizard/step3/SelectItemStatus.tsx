import NewItemSvg from "@/assets/icons/register-steps/status-new.svg?raw";
import OpenboxItemSvg from "@/assets/icons/register-steps/status-openbox.svg?raw";
import UsedItemSvg from "@/assets/icons/register-steps/status-used.svg?raw";
import { cn } from "@/lib/utils";
import { createSignal, For, type Accessor } from "solid-js";

export const ITEM_STATUSES = {
  new: {
    icon: NewItemSvg,
    text: "Nuevo",
  },
  openbox: {
    icon: OpenboxItemSvg,
    text: "Openbox",
  },
  used: {
    icon: UsedItemSvg,
    text: "Usado",
  },
} as const;

export type ItemStatusKey = keyof typeof ITEM_STATUSES;

export interface SelectItemStatusProps {
  selected: Accessor<ItemStatusKey | null>;
  onSelectedChange: (selected: ItemStatusKey) => void;
}

interface StatusOptionButtonProps {
  statusKey: ItemStatusKey;
  isSelected: boolean;
  onSelect: (key: ItemStatusKey) => void;
}

function StatusOptionButton(props: StatusOptionButtonProps) {
  const item = ITEM_STATUSES[props.statusKey];
  const [bounce, setBounce] = createSignal(false);

  const handleClick = () => {
    if (!props.isSelected) {
      setBounce(false);
      requestAnimationFrame(() => setBounce(true));
    }
    props.onSelect(props.statusKey);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onAnimationEnd={(event) => {
        if (event.animationName === "touch-scale") setBounce(false);
      }}
      class={cn(
        "flex flex-col items-center justify-center rounded-3xl question-shadow min-w-[6.75rem] min-h-[6.75rem] transition-colors duration-300 hover:cursor-pointer p-0 m-0",
        props.isSelected
          ? "bg-primary text-primary-foreground"
          : "bg-surface text-foreground",
        bounce() && "animate-touch-scale"
      )}
    >
      <p class="font-cutive text-sm mb-1">{item.text}</p>
      <div
        class={cn(
          "[&_path]:transition-colors [&_path]:duration-300",
          props.isSelected
            ? "[&_path]:fill-primary-foreground"
            : "[&_path]:fill-muted-foreground"
        )}
        innerHTML={item.icon}
      />
    </button>
  );
}

export default function SelectItemStatus(props: SelectItemStatusProps) {
  return (
    <div class="flex flex-row items-center justify-center gap-x-3.5">
      <For each={Object.keys(ITEM_STATUSES) as ItemStatusKey[]}>
        {(statusKey) => (
          <StatusOptionButton
            statusKey={statusKey}
            isSelected={props.selected() === statusKey}
            onSelect={props.onSelectedChange}
          />
        )}
      </For>
    </div>
  );
}
