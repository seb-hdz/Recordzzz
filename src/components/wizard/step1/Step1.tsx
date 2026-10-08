import { createSignal } from "solid-js";
import QuestionTitle from "@/components/wizard/QuestionTitle";
import Button from "@/components/global/button";
import QuestionTextArea from "@/components/wizard/QuestionTextArea";
import PackagingAnimation from "@/components/wizard/step1/PackagingAnimation";

interface Step1Props {
  name: string;
  onNameChange: (name: string) => void;
  onContinue: () => void;
}

export default function Step1(props: Step1Props) {
  const [ready, setReady] = createSignal(false);
  const canContinue = () => props.name.trim().length > 0;

  return (
    <section class="flex flex-col mt-6">
      <div class="flex w-full justify-between items-end px-8">
        <QuestionTitle
          title="¿Cuál es el nombre del artículo?"
          customClass="w-[25rem]"
        />
        <PackagingAnimation ready={ready()} class="mr-2" />
      </div>
      <QuestionTextArea
        placeholder='Ejm. Disco Vinilo 7"'
        customClass="mt-4.5 mx-4"
        value={props.name}
        onValueChange={props.onNameChange}
      />
      <Button
        text="Continuar"
        disabled={!canContinue()}
        onClick={() => {
          if (!canContinue()) return;
          setReady(true);
          props.onContinue();
        }}
        customClass="question-shadow mt-4 mx-4"
      />
    </section>
  );
}
