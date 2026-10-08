import { Show } from "solid-js";
import { circleSvg, multiSvg, ITEM_TYPES, type ItemTypeKey } from "./itemTypes";
import Badge from "@/components/global/badge";

export interface TypeAnimationProps {
  selected: ItemTypeKey[];
}

export default function TypeAnimation(props: TypeAnimationProps) {
  const singleKey = () =>
    props.selected.length === 1 ? props.selected[0] : undefined;

  return (
    <div class="relative">
      <Show when={props.selected.length > 1}>
        <Badge
          text={props.selected.length.toString()}
          customClass="absolute -top-1.5 -right-1.5 z-1 type-animation-icon-sway"
        />
      </Show>
      <div class="type-animation-stage">
        <div class="type-animation-circle" innerHTML={circleSvg} />
        <Show when={props.selected.length >= 2}>
          <div
            class="type-animation-icon type-animation-icon-sway"
            innerHTML={multiSvg}
          />
        </Show>
        <Show when={singleKey()} keyed>
          {(key) => (
            <div
              class="type-animation-icon type-animation-icon-sway"
              innerHTML={ITEM_TYPES[key].selectedIcon}
            />
          )}
        </Show>
      </div>
    </div>
  );
}
