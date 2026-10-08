import {
  createSignal,
  For,
  Show,
  type Accessor,
} from "solid-js";
import Button from "@/components/global/button";
import { BottomSheet } from "@/components/ui/BottomSheet";
import PanelHeader from "./PanelHeader";
import { getOptionById, MAX_IMAGES } from "./options";

export interface ImagesPanelProps {
  images: Accessor<string[]>;
  onImagesChange: (images: string[]) => void;
  onContinue: () => void;
}

export default function ImagesPanel(props: ImagesPanelProps) {
  const option = getOptionById("images");
  let galleryInput: HTMLInputElement | undefined;
  let cameraInput: HTMLInputElement | undefined;
  const [pickerOpen, setPickerOpen] = createSignal(false);

  const remaining = () => MAX_IMAGES - props.images().length;
  const canAdd = () => remaining() > 0;

  const readAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") resolve(reader.result);
        else reject(new Error("No se pudo leer la imagen"));
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  const handleFiles = async (files: FileList | null) => {
    if (!files || !canAdd()) return;
    const next = [...props.images()];
    for (const file of Array.from(files)) {
      if (next.length >= MAX_IMAGES) break;
      if (!file.type.startsWith("image/")) continue;
      try {
        next.push(await readAsDataUrl(file));
      } catch {
        continue;
      }
    }
    props.onImagesChange(next);
    setPickerOpen(false);
  };

  const removeImage = (index: number) => {
    const current = props.images();
    const url = current[index];
    if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
    props.onImagesChange(current.filter((_, i) => i !== index));
  };

  const openGallery = () => {
    setPickerOpen(false);
    // Defer so the sheet can close before the file dialog steals focus
    requestAnimationFrame(() => galleryInput?.click());
  };

  const openCamera = () => {
    setPickerOpen(false);
    requestAnimationFrame(() => cameraInput?.click());
  };

  return (
    <section class="flex flex-col mt-6">
      <PanelHeader
        title={option.title}
        description={option.description}
        icon={option.icon}
        badgeCount={props.images().length}
      />

      <div class="mt-8 px-4 flex flex-row items-center gap-3 overflow-x-auto pb-2">
        <Show when={props.images().length > 0}>
          <For each={props.images()}>
            {(src, index) => (
              <div class="relative shrink-0">
                <img
                  src={src}
                  alt={`Imagen ${index() + 1}`}
                  class="h-28 w-40 object-cover rounded-2xl bg-surface question-shadow"
                />
                <button
                  type="button"
                  class="absolute -top-1.5 -right-1.5 size-7 rounded-full bg-ring question-shadow flex items-center justify-center hover:cursor-pointer"
                  onClick={() => removeImage(index())}
                  aria-label="Eliminar imagen"
                >
                  <span class="font-ultra text-muted-foreground text-sm leading-none">
                    ×
                  </span>
                </button>
              </div>
            )}
          </For>
        </Show>

        <Show when={canAdd()}>
          <button
            type="button"
            class="size-16 shrink-0 rounded-full bg-primary question-shadow flex items-center justify-center hover:cursor-pointer text-primary-foreground"
            onClick={() => setPickerOpen(true)}
            aria-label="Agregar imagen"
          >
            <span class="font-ultra text-4xl leading-none pb-1">+</span>
          </button>
        </Show>
      </div>

      <BottomSheet
        open={pickerOpen()}
        onClose={() => setPickerOpen(false)}
        title="Agregar imagen"
      >
        <div class="flex flex-col gap-2 px-6 pb-8">
          <button
            type="button"
            class="w-full rounded-2xl bg-primary text-primary-foreground font-ultra text-xl py-4 question-shadow hover:cursor-pointer"
            onClick={openGallery}
          >
            Galería
          </button>
          <button
            type="button"
            class="w-full rounded-2xl bg-surface text-foreground font-ultra text-xl py-4 question-shadow hover:cursor-pointer border border-secondary"
            onClick={openCamera}
          >
            Cámara
          </button>
        </div>
      </BottomSheet>

      <input
        ref={galleryInput}
        type="file"
        accept="image/*"
        multiple
        class="hidden"
        onChange={(e) => {
          handleFiles(e.currentTarget.files);
          e.currentTarget.value = "";
        }}
      />
      <input
        ref={cameraInput}
        type="file"
        accept="image/*"
        capture="environment"
        class="hidden"
        onChange={(e) => {
          handleFiles(e.currentTarget.files);
          e.currentTarget.value = "";
        }}
      />

      <hr class="border-secondary mt-10 mx-4" />
      <Button
        text="Continuar"
        onClick={props.onContinue}
        customClass="question-shadow mt-4 mx-4"
      />
    </section>
  );
}
