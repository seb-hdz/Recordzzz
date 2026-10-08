import QuestionTitle from "@/components/wizard/QuestionTitle";
import type { WaveLineDraft } from "@/domain/drafts";
import type { ItemsFilters } from "@/components/items/ItemsFilterPanel";
import type { ListedItem } from "@/components/items/filterItems";
import ItemSelectList from "./ItemSelectList";
import UnpackAnimation from "./UnpackAnimation";

interface Step2Props {
  items: ListedItem[];
  lines: WaveLineDraft[];
  filters: ItemsFilters;
  onFiltersChange: (filters: ItemsFilters) => void;
  onToggle: (itemId: number) => void;
  onQuantityChange: (itemId: number, quantity: number) => void;
  onContinue: () => void;
  onRegister: () => void;
}

export default function Step2(props: Step2Props) {
  return (
    <section class="flex min-h-0 flex-1 flex-col mt-6">
      <div class="flex w-full shrink-0 justify-between items-end px-8">
        <QuestionTitle
          title="Selecciona los artículos incluídos"
          customClass="w-[25rem]"
        />
        <UnpackAnimation ready={false} class="mr-2" />
      </div>
      <ItemSelectList
        items={props.items}
        lines={props.lines}
        filters={props.filters}
        onFiltersChange={props.onFiltersChange}
        onToggle={props.onToggle}
        onQuantityChange={props.onQuantityChange}
        onContinue={props.onContinue}
        onRegister={props.onRegister}
      />
    </section>
  );
}
