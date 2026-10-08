import { cn } from "@/lib/utils";
import { createSignal, For, type Accessor } from "solid-js";
import { ITEM_TYPES, type ItemTypeKey } from "./itemTypes";

export type { ItemTypeKey } from "./itemTypes";

export interface MultiSelectTypeProps {
  selected: Accessor<ItemTypeKey[]>;
  onSelectedChange: (selected: ItemTypeKey[]) => void;
}

interface TypeOptionButtonProps {
  typeKey: ItemTypeKey;
  isSelected: boolean;
  onToggle: (key: ItemTypeKey) => void;
}

function TypeOptionButton(props: TypeOptionButtonProps) {
  const item = ITEM_TYPES[props.typeKey];
  const [bounce, setBounce] = createSignal(false);

  const handleClick = () => {
    if (!props.isSelected) {
      setBounce(false);
      requestAnimationFrame(() => setBounce(true));
    }
    props.onToggle(props.typeKey);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onAnimationEnd={(event) => {
        if (event.animationName === "touch-scale") setBounce(false);
      }}
      class={cn(
        "question-shadow rounded-full transition-colors duration-300 hover:cursor-pointer p-0 m-0 mr-2 mb-2.5",
        props.isSelected ? "bg-primary" : "bg-muted-foreground",
        bounce() && "animate-touch-scale"
      )}
    >
      <div class="flex flex-row items-center justify-center py-2.5 px-4">
        <div innerHTML={item.icon} />
        <p class="font-ultra text-surface text-lg ml-1">{item.text}</p>
      </div>
    </button>
  );
}

export default function MultiSelectType(props: MultiSelectTypeProps) {
  const toggle = (key: ItemTypeKey) => {
    const current = props.selected();
    props.onSelectedChange(
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key]
    );
  };

  return (
    <div>
      <For each={Object.keys(ITEM_TYPES) as ItemTypeKey[]}>
        {(typeKey) => (
          <TypeOptionButton
            typeKey={typeKey}
            isSelected={props.selected().includes(typeKey)}
            onToggle={toggle}
          />
        )}
      </For>
    </div>
  );
}
