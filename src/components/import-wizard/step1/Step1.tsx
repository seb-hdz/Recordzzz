import { createSignal } from "solid-js";
import QuestionTitle from "@/components/wizard/QuestionTitle";
import QuestionTextArea from "@/components/wizard/QuestionTextArea";
import Button from "@/components/global/button";
import { cn } from "@/lib/utils";
import ImportNameIcon from "./ImportNameIcon";

interface Step1Props {
  name: string;
  onNameChange: (name: string) => void;
  onContinue: () => void;
}

export default function Step1(props: Step1Props) {
  const [bounce, setBounce] = createSignal(false);
  const canContinue = () => props.name.trim().length > 0;

  return (
    <section class="flex flex-col mt-6">
      <div class="flex w-full justify-between items-end px-8">
        <QuestionTitle
          title="¿Cuál es el nombre de la importación?"
          customClass="w-[25rem]"
        />
        <ImportNameIcon class="mr-2" />
      </div>
      <QuestionTextArea
        placeholder="Ejm. Compra del 7 de abril"
        customClass="mt-4.5 mx-4"
        value={props.name}
        onValueChange={props.onNameChange}
      />
      <div class="mt-4 flex justify-center px-4">
        <Button
          text="Continuar"
          disabled={!canContinue()}
          onClick={() => {
            if (!canContinue()) return;
            setBounce(false);
            requestAnimationFrame(() => setBounce(true));
            props.onContinue();
          }}
          customClass={cn(
            "question-shadow",
            bounce() && "animate-touch-scale"
          )}
        />
      </div>
    </section>
  );
}
