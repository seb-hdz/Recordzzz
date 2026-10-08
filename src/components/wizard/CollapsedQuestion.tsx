import { JSX, Show } from "solid-js";
import Badge from "@/components/global/badge";
import { cn } from "@/lib/utils";

interface CollapsedQuestionProps {
  icon: JSX.Element;
  question: string;
  answer: string | JSX.Element;
  step: number;
  onClick?: () => void;
}

function CollapsedQuestionBody(props: CollapsedQuestionProps) {
  return (
    <>
      <div class="relative shrink-0">
        {props.icon}
        <Badge
          text={props.step.toString()}
          customClass="absolute bottom-1 -right-1.5"
        />
      </div>
      <div class="ml-4 flex min-w-0 flex-1 flex-col gap-[0.125rem]">
        <p class="font-ultra tracking-[-2%]">{props.question}</p>
        {typeof props.answer === "string" ? (
          <p class="overflow-hidden text-ellipsis font-cutive leading-5 tracking-[-2%] line-clamp-3">
            {props.answer}
          </p>
        ) : (
          props.answer
        )}
      </div>
    </>
  );
}

export default function CollapsedQuestion(props: CollapsedQuestionProps) {
  const rowClass =
    "flex w-full flex-row items-start border-b-2 border-b-muted px-2 py-3.5 text-left";

  return (
    <Show
      when={props.onClick}
      fallback={
        <div class={rowClass}>
          <CollapsedQuestionBody {...props} />
        </div>
      }
    >
      <button
        type="button"
        class={cn(rowClass, "cursor-pointer")}
        onClick={() => props.onClick?.()}
      >
        <CollapsedQuestionBody {...props} />
      </button>
    </Show>
  );
}
