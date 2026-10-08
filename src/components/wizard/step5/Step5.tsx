import { createSignal, Show, type Accessor } from "solid-js";
import Button from "@/components/global/button";
import OptionsCarousel from "./OptionsCarousel";
import ImagesPanel from "./ImagesPanel";
import TagsPanel from "./TagsPanel";
import BarcodesPanel from "./BarcodesPanel";
import {
  getOptionById,
  type Step5OptionId,
  type Step5Panel,
} from "./options";

type Step5View = "overview" | Step5Panel;

interface Step5Props {
  images: Accessor<string[]>;
  tags: Accessor<string[]>;
  barcodes: Accessor<string[]>;
  onImagesChange: (images: string[]) => void;
  onTagsChange: (tags: string[]) => void;
  onBarcodesChange: (barcodes: string[]) => void;
  onFinalize: () => void;
  isSaving?: boolean;
}

export default function Step5(props: Step5Props) {
  const [view, setView] = createSignal<Step5View>("overview");
  const [activeOption, setActiveOption] =
    createSignal<Step5OptionId>("done");

  const badgeCounts = (): Record<Step5OptionId, number> => ({
    done: 0,
    images: props.images().length,
    tags: props.tags().length,
    barcodes: props.barcodes().length,
  });

  const activeConfig = () => getOptionById(activeOption());

  const handleOverviewCta = () => {
    const option = activeConfig();
    if (option.panel) {
      setView(option.panel);
      return;
    }
    props.onFinalize();
  };

  const backToOverview = () => setView("overview");

  return (
    <Show
      when={view() === "overview"}
      fallback={
        <>
          <Show when={view() === "images"}>
            <ImagesPanel
              images={props.images}
              onImagesChange={props.onImagesChange}
              onContinue={backToOverview}
            />
          </Show>
          <Show when={view() === "tags"}>
            <TagsPanel
              tags={props.tags}
              onTagsChange={props.onTagsChange}
              onContinue={backToOverview}
            />
          </Show>
          <Show when={view() === "barcodes"}>
            <BarcodesPanel
              barcodes={props.barcodes}
              onBarcodesChange={props.onBarcodesChange}
              onContinue={backToOverview}
            />
          </Show>
        </>
      }
    >
      <section class="flex flex-col mt-6">
        <p class="font-cutive text-xl text-foreground px-4">
          Información adicional
        </p>

        <OptionsCarousel
          activeOption={activeOption}
          onActiveChange={setActiveOption}
          badgeCounts={badgeCounts}
        />

        <div class="px-4 mt-2">
          <h2 class="font-ultra text-xl text-foreground tracking-[-2%]">
            {activeConfig().title}
          </h2>
          <p class="font-cutive text-sm text-foreground mt-1">
            {activeConfig().description}
          </p>
        </div>

        <hr class="border-secondary mt-6 mx-4" />
        <Button
          text={activeConfig().ctaLabel}
          onClick={handleOverviewCta}
          isLoading={props.isSaving && !activeConfig().panel}
          disabled={props.isSaving}
          customClass="question-shadow mt-4 mx-4"
        />
      </section>
    </Show>
  );
}
