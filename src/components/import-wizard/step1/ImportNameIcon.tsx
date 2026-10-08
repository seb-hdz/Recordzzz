import importSvg from "@/assets/icons/import-steps/import.svg?raw";
import { cn } from "@/lib/utils";

interface ImportNameIconProps {
  class?: string;
}

export default function ImportNameIcon(props: ImportNameIconProps) {
  return (
    <div
      role="img"
      aria-label="Importación"
      class={cn(
        "size-20 shrink-0 text-primary animate-float-drift-a [&_svg]:block [&_svg]:size-full",
        props.class
      )}
      innerHTML={importSvg}
    />
  );
}
