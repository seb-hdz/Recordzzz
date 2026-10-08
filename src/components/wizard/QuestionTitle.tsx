import { cn } from "@/lib/utils";

interface QuestionTitleProps {
  customClass?: string;
  title: string;
}

export default function QuestionTitle(props: QuestionTitleProps) {
  const { title, customClass } = props;
  return (
    <p
      class={cn(
        "font-ultra text-[2rem] -tracking-[2%] text-left leading-11",
        customClass
      )}
    >
      {title}
    </p>
  );
}
