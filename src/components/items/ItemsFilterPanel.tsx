import DatePicker from "@/components/global/DatePicker";
import { type ItemTypeKey } from "@/components/wizard/step2/itemTypes";
import { todayDateInput } from "@/domain/dates";
import { createEffect, createSignal, Show } from "solid-js";
import SearchControl from "./SearchControl";
import SortSelector from "./SortSelector";
import TypeFilterSelector from "./TypeFilterSelector";
import type { SortKey } from "./sortOptions";

export interface ItemsFilters {
  query: string;
  types: ItemTypeKey[];
  sort: SortKey;
  fromDate: string;
  toDate: string;
}

export interface ItemsFilterPanelProps {
  initialFrom?: string;
  initialTo?: string;
  initial?: ItemsFilters;
  onFiltersChange: (filters: ItemsFilters) => void;
}

export default function ItemsFilterPanel(props: ItemsFilterPanelProps) {
  const [fromDate, setFromDate] = createSignal(
    props.initial?.fromDate ?? props.initialFrom ?? todayDateInput()
  );
  const [toDate, setToDate] = createSignal(
    props.initial?.toDate ?? props.initialTo ?? todayDateInput()
  );
  const [selectedTypes, setSelectedTypes] = createSignal<ItemTypeKey[]>(
    props.initial?.types ?? []
  );
  const [sort, setSort] = createSignal<SortKey>(props.initial?.sort ?? "a-to-z");
  const [searchExpanded, setSearchExpanded] = createSignal(
    Boolean(props.initial?.query)
  );
  const [searchText, setSearchText] = createSignal(props.initial?.query ?? "");
  const [, setCommittedQuery] = createSignal("");

  let searchInputRef: HTMLInputElement | undefined;

  const hasSearchText = () => searchText().trim().length > 0;

  createEffect(() => {
    props.onFiltersChange({
      query: searchText().trim(),
      types: selectedTypes(),
      sort: sort(),
      fromDate: fromDate(),
      toDate: toDate(),
    });
  });

  createEffect(() => {
    if (!searchExpanded()) return;
    requestAnimationFrame(() => searchInputRef?.focus());
  });

  const handleSearchClick = () => {
    if (!searchExpanded()) {
      setSearchExpanded(true);
      return;
    }
    if (!hasSearchText()) {
      setSearchExpanded(false);
      return;
    }
    setCommittedQuery(searchText().trim());
  };

  return (
    <div class="flex shrink-0 flex-col gap-4 bg-background px-5 pb-6 pt-4">
      <Show when={searchExpanded()}>
        <div class="flex h-12 w-full items-center rounded-full bg-surface question-shadow px-5">
          <input
            ref={searchInputRef}
            type="text"
            value={searchText()}
            onInput={(event) => setSearchText(event.currentTarget.value)}
            placeholder={"Ejm. Dua Lipa, Disco."}
            class="w-full min-w-0 bg-transparent font-cutive-field text-base leading-normal text-foreground placeholder:text-muted-foreground/40 outline-none"
          />
        </div>
      </Show>
      <div class="flex flex-row items-center justify-between gap-2">
        <TypeFilterSelector
          selected={selectedTypes}
          onSelectedChange={setSelectedTypes}
        />
        <div class="flex flex-row items-center gap-2">
          <SortSelector value={sort} onChange={setSort} />
          <SearchControl
            expanded={searchExpanded}
            hasText={hasSearchText}
            onClick={handleSearchClick}
          />
        </div>
      </div>
      <div class="flex flex-row items-center justify-between">
        <DatePicker
          label="Desde"
          value={fromDate}
          onChange={setFromDate}
          class="flex-col-reverse items-end"
          textClass="text-muted-foreground"
        />
        <DatePicker
          label="Hasta"
          value={toDate}
          onChange={setToDate}
          class="flex-col-reverse items-end"
          textClass="text-muted-foreground"
        />
      </div>
    </div>
  );
}
