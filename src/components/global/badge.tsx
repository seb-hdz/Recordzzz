import { cn } from "@/lib/utils";

interface BadgeProps {
  customClass?: string;
  customTextClass?: string;
  text: string;
}

export default function Badge(props: BadgeProps) {
  const { text, customClass, customTextClass } = props;

  return (
    <div
      class={cn(
        "rounded-full flex items-center justify-center overflow-hidden question-shadow relative w-8 h-8 bg-background",
        customClass
      )}
    >
      <p
        class={cn(
          "font-ultra tracking-[-2%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-lg text-muted-foreground",
          customTextClass
        )}
      >
        {text}
      </p>
      {text}
    </div>
  );
}
