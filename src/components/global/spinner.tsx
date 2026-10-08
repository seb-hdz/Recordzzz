import { cn } from "@/lib/utils";

import LoadingSVG from "@/assets/icons/loading.svg";

interface SpinnerProps {
  customClass?: string;
}

export default function Spinner(props: SpinnerProps) {
  const { customClass } = props;
  return (
    <div
      class={cn("animate-spin select-none pointer-events-none", customClass)}
    >
      <img src={LoadingSVG} alt="Spinner" />
    </div>
  );
}
