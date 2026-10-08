import { type Accessor } from "solid-js";
import QuestionTitle from "../QuestionTitle";
import SelectItemStatus, { type ItemStatusKey } from "./SelectItemStatus";
import Button from "@/components/global/button";

interface Step3Props {
  selected: Accessor<ItemStatusKey | null>;
  onSelectedChange: (selected: ItemStatusKey) => void;
  onContinue: () => void;
}

export default function Step3(props: Step3Props) {
  const canContinue = () => props.selected() !== null;

  return (
    <section class="flex flex-col mt-6">
      <div class="flex w-full justify-between items-end px-8">
        <QuestionTitle
          title="¿En qué estado está el artículo?"
          customClass="w-[25rem]"
        />
      </div>
      <div class="mt-4.5 animate-float-vertical">
        <SelectItemStatus
          selected={props.selected}
          onSelectedChange={props.onSelectedChange}
        />
      </div>
      <hr class="h-[1] border-secondary mx-4 mt-4" />
      <Button
        text="Continuar"
        disabled={!canContinue()}
        onClick={() => {
          if (!canContinue()) return;
          props.onContinue();
        }}
        customClass="question-shadow mt-6 mx-4"
      />
    </section>
  );
}
