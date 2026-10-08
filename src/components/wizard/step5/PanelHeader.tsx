import OptionTile from "./OptionTile";
import { Show } from "solid-js";

export interface PanelHeaderProps {
  title: string;
  description: string;
  icon: string;
  badgeCount?: number;
  showStepLabel?: boolean;
}

export default function PanelHeader(props: PanelHeaderProps) {
  return (
    <div class="flex flex-col gap-1 px-4">
      <Show when={props.showStepLabel !== false}>
        <p class="font-cutive text-xl text-foreground">Información adicional</p>
      </Show>
      <div class="flex flex-row items-start justify-between gap-3 mt-2">
        <div class="flex-1 min-w-0">
          <h2 class="font-ultra text-3xl text-foreground leading-tight tracking-[-2%]">
            {props.title}
          </h2>
          <p class="font-cutive text-sm text-foreground mt-1">
            {props.description}
          </p>
        </div>
        <OptionTile
          icon={props.icon}
          active
          size="header"
          badgeCount={props.badgeCount}
          customClass="shrink-0"
        />
      </div>
    </div>
  );
}
