import { Show } from "solid-js";

import BackIconSVG from "@/assets/icons/back.svg";
import { useNavigate } from "@solidjs/router";

interface CommonHeaderProps {
  showBack?: boolean;
  title: string;
  onBack?: () => void;
}

export default function CommonHeader(props: CommonHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (props.onBack) {
      props.onBack();
      return;
    }
    navigate(-1);
  };

  return (
    <header class="safe-top bg-surface transition-colors question-shadow">
      <div class="max-w-2xl mx-auto h-full px-4 flex items-center justify-between">
        <div class="flex items-baseline justify-between py-2.5 w-full">
          <Show when={props.showBack}>
            <button
              type="button"
              onClick={handleBack}
              class="rounded-full bg-surface-raised transition-colors cursor-pointer question-shadow h-12 w-12 flex items-center justify-center"
              aria-label="Volver"
            >
              <img src={BackIconSVG} alt="Volver" />
            </button>
          </Show>
          <h1 class="text-lg font-cutive text-foreground tracking-tight grow text-center mr-12 mb-">
            {props.title}
          </h1>
        </div>
      </div>
    </header>
  );
}
