import { JSX } from "solid-js";
import Badge from "@/components/global/badge";

interface CollapsedQuestionProps {
  icon: JSX.Element;
  question: string;
  answer: string | JSX.Element;
  step: number;
}

export default function CollapsedQuestion(props: CollapsedQuestionProps) {
  const { icon, question, answer, step } = props;

  return (
    <div class="flex flex-row items-start py-3.5 px-2 border-b-2 border-b-muted">
      <div class="relative shrink-0">
        {icon}
        <Badge
          text={step.toString()}
          customClass="absolute bottom-1 -right-1.5"
        />
      </div>
      <div class="flex min-w-0 flex-1 flex-col gap-[0.125rem] ml-4">
        <p class="font-ultra tracking-[-2%]">{question}</p>
        {typeof answer === "string" ? (
          <p class="font-cutive leading-5 tracking-[-2%] line-clamp-3 text-ellipsis overflow-hidden">
            {answer}
          </p>
        ) : (
          answer
        )}
      </div>
    </div>
  );
}
