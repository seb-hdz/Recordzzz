import { cn } from "@/lib/utils";

interface QuestionTextAreaProps {
  customClass?: string;
  placeholder: string;
  value: string;
  onValueChange: (value: string) => void;
}

export default function QuestionTextArea(props: QuestionTextAreaProps) {
  const { placeholder, customClass } = props;

  return (
    <textarea
      name="item-name"
      id="item-name"
      placeholder={placeholder}
      value={props.value}
      onInput={(event) => props.onValueChange(event.currentTarget.value)}
      class={cn(
        "bg-surface rounded-xl p-4 h-36 resize-none placeholder:font-cutive font-cutive text-xl outline-none transition-all duration-300 question-shadow focus:animate-touch-scale leading-6",
        customClass
      )}
    ></textarea>
  );
}
