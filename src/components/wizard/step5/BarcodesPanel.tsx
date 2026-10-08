import {
  createSignal,
  For,
  Show,
  type Accessor,
} from "solid-js";
import Button from "@/components/global/button";
import Badge from "@/components/global/badge";
import PanelHeader from "./PanelHeader";
import BarcodeCamera from "./BarcodeCamera";
import BarcodeManualInput from "./BarcodeManualInput";
import { getOptionById, MAX_BARCODES } from "./options";
import CameraSvg from "@/assets/icons/register-steps/camera.svg?raw";
import PenSvg from "@/assets/icons/register-steps/pen.svg?raw";
import { cn } from "@/lib/utils";

export interface BarcodesPanelProps {
  barcodes: Accessor<string[]>;
  onBarcodesChange: (barcodes: string[]) => void;
  onContinue: () => void;
}

type SubView = "chooser" | "camera" | "manual";

export default function BarcodesPanel(props: BarcodesPanelProps) {
  const option = getOptionById("barcodes");
  const [subView, setSubView] = createSignal<SubView>("chooser");
  const [manualValue, setManualValue] = createSignal("");

  const canAdd = () => props.barcodes().length < MAX_BARCODES;

  const addCode = (code: string) => {
    const trimmed = code.trim();
    if (!trimmed || !canAdd()) {
      setSubView("chooser");
      return;
    }
    const exists = props.barcodes().includes(trimmed);
    if (!exists) {
      props.onBarcodesChange([...props.barcodes(), trimmed]);
    }
    setManualValue("");
    setSubView("chooser");
  };

  const removeCode = (code: string) => {
    props.onBarcodesChange(props.barcodes().filter((b) => b !== code));
  };

  const handleContinue = () => {
    if (subView() === "manual") {
      const draft = manualValue().trim();
      if (draft) addCode(draft);
      else setSubView("chooser");
      return;
    }
    if (subView() === "camera") {
      setSubView("chooser");
      return;
    }
    props.onContinue();
  };

  return (
    <section class="flex flex-col mt-6">
      <PanelHeader
        title={option.title}
        description={option.description}
        icon={option.icon}
        badgeCount={props.barcodes().length}
      />

      <Show when={subView() === "chooser"}>
        <div class="mt-8 px-4 flex flex-row gap-4 justify-center">
          <button
            type="button"
            disabled={!canAdd()}
            onClick={() => setSubView("camera")}
            class={cn(
              "flex flex-col items-center justify-between rounded-3xl question-shadow min-w-[9rem] min-h-[9rem] p-4 hover:cursor-pointer",
              "bg-primary text-primary-foreground",
              !canAdd() && "opacity-40 pointer-events-none"
            )}
          >
            <span class="font-cutive text-lg self-start">Cámara</span>
            <div
              class="size-14 [&>svg]:w-full [&>svg]:h-full"
              innerHTML={CameraSvg}
            />
          </button>
          <button
            type="button"
            disabled={!canAdd()}
            onClick={() => setSubView("manual")}
            class={cn(
              "flex flex-col items-center justify-between rounded-3xl question-shadow min-w-[9rem] min-h-[9rem] p-4 hover:cursor-pointer",
              "bg-surface text-foreground",
              !canAdd() && "opacity-40 pointer-events-none"
            )}
          >
            <span class="font-cutive text-lg self-start">Escribir</span>
            <div
              class="size-14 text-primary [&>svg]:w-full [&>svg]:h-full"
              innerHTML={PenSvg}
            />
          </button>
        </div>

        <Show when={props.barcodes().length > 0}>
          <div class="mt-8 px-4 overflow-x-auto flex flex-row gap-3 pb-2">
            <For each={props.barcodes()}>
              {(code) => (
                <div class="relative shrink-0">
                  <div class="bg-surface rounded-full question-shadow px-6 py-3">
                    <p class="font-ultra text-xl text-foreground whitespace-nowrap">
                      {code}
                    </p>
                  </div>
                  <button
                    type="button"
                    class="absolute -top-1.5 -right-1.5 hover:cursor-pointer"
                    onClick={() => removeCode(code)}
                    aria-label={`Eliminar ${code}`}
                  >
                    <Badge
                      text="×"
                      customClass="bg-ring size-7"
                      customTextClass="font-ultra text-base text-muted-foreground"
                    />
                  </button>
                </div>
              )}
            </For>
          </div>
        </Show>
      </Show>

      <Show when={subView() === "camera"}>
        <BarcodeCamera
          onDetected={addCode}
          onBack={() => setSubView("chooser")}
        />
      </Show>

      <Show when={subView() === "manual"}>
        <BarcodeManualInput
          value={manualValue}
          onValueChange={setManualValue}
          onSubmit={addCode}
          onBack={() => {
            setManualValue("");
            setSubView("chooser");
          }}
        />
      </Show>

      <hr class="border-secondary mt-10 mx-4" />
      <Button
        text="Continuar"
        onClick={handleContinue}
        customClass="question-shadow mt-4 mx-4"
      />
    </section>
  );
}
