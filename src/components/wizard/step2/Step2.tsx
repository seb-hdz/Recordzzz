import { type Accessor } from "solid-js";
import QuestionTitle from "../QuestionTitle";
import Button from "@/components/global/button";
import TypeAnimation from "./TypeAnimation";
import MultiSelectType, { type ItemTypeKey } from "./MultiSelectType";

interface Step2Props {
  selected: Accessor<ItemTypeKey[]>;
  onSelectedChange: (selected: ItemTypeKey[]) => void;
  onContinue: () => void;
}

export default function Step2(props: Step2Props) {
  const canContinue = () => props.selected().length > 0;

  return (
    <section class="flex flex-col mt-6">
      <div class="flex w-full justify-between items-end px-8">
        <QuestionTitle title="¿Qué es el artículo?" customClass="w-[25rem]" />
        <TypeAnimation selected={props.selected()} />
      </div>
      <div class="mx-4 mt-5 animate-float-vertical">
        <MultiSelectType
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
