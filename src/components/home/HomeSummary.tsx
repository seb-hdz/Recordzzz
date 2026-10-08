import ShippingSvg from "@/assets/icons/register-steps/shipping.svg?raw";
import TaxesSvg from "@/assets/icons/register-steps/taxes.svg?raw";
import { useDexieQuery } from "@/adapters/storage/dexie/useDexieQuery";
import { useApp } from "@/application/context";
import {
  oneYearAgoDateInput,
  todayDateInput,
} from "@/domain/dates";
import { computeHomeSummary } from "@/domain/home-summary";
import { centsToDecimal } from "@/domain/money";
import {
  CURRENCIES,
  DEFAULT_APP_CONFIG,
  type AppConfig,
  type Currency,
  type Item,
  type Wave,
} from "@/domain/types";
import { createEffect, createMemo, createSignal, Show } from "solid-js";
import DatePicker from "../global/DatePicker";

type TaxMode = "rate" | "amount";
type SummaryType =
  | "shipping"
  | "weight"
  | "import"
  | Exclude<TaxMode, "amount">
  | "taxes";

interface SummaryItemProps {
  type: SummaryType;
  value: number;
  currency: Currency;
}

interface SummaryCardProps {
  value: number;
  label: string;
}

const RANGE_STORAGE_KEY = "home-summary-date-range";

function isShippingType(type: SummaryType): boolean {
  return type === "shipping" || type === "weight" || type === "import";
}

function isEstimatedType(type: SummaryType): boolean {
  return type === "weight" || type === "import" || type === "rate";
}

function getCurrencyMeta(currency: Currency) {
  return CURRENCIES.find((entry) => entry.id === currency) ?? CURRENCIES[0];
}

function formatAmount(value: number): string {
  return value.toFixed(2);
}

function loadStoredRange(): { from: string; to: string } {
  try {
    const raw = sessionStorage.getItem(RANGE_STORAGE_KEY);
    if (!raw) return { from: oneYearAgoDateInput(), to: todayDateInput() };
    const parsed = JSON.parse(raw) as { from?: string; to?: string };
    if (
      typeof parsed.from === "string" &&
      typeof parsed.to === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(parsed.from) &&
      /^\d{4}-\d{2}-\d{2}$/.test(parsed.to)
    ) {
      return { from: parsed.from, to: parsed.to };
    }
  } catch {
    // ignore corrupt session data
  }
  return { from: oneYearAgoDateInput(), to: todayDateInput() };
}

function SummaryItem(props: SummaryItemProps) {
  const shipping = isShippingType(props.type);
  const meta = getCurrencyMeta(props.currency);
  const estimatedMark = isEstimatedType(props.type) ? "*" : "";
  const kindLabel = shipping ? "envío" : "impuesto";

  return (
    <div class="flex flex-row items-center gap-1.5">
      <div
        class="size-[18px] shrink-0 [&_svg]:block [&_svg]:size-[18px]"
        innerHTML={shipping ? ShippingSvg : TaxesSvg}
        aria-hidden="true"
      />
      <p class="font-cutive text-[0.75rem] text-muted-foreground leading-none pt-0.5">
        {`+${formatAmount(props.value)}${estimatedMark} ${meta.symbol} (${
          meta.id
        }) - ${kindLabel}`}
      </p>
    </div>
  );
}

function SummaryCard(props: SummaryCardProps) {
  return (
    <article class="flex flex-col items-end justify-start rounded-3xl bg-surface px-5 pb-2 pt-3 question-shadow">
      <p class="font-ultra text-4xl text-muted-foreground leading-none">
        {props.value}
      </p>
      <p class="mt-2 max-w-[8.5rem] font-cutive text-sm text-right leading-5">
        {props.label}
      </p>
    </article>
  );
}

export default function HomeSummary() {
  const { itemService, waveService, configRepo } = useApp();
  const initialRange = loadStoredRange();

  const [fromDate, setFromDate] = createSignal(initialRange.from);
  const [toDate, setToDate] = createSignal(initialRange.to);

  const items = useDexieQuery<Item[]>(() => itemService.getAllItems(), []);
  const waves = useDexieQuery<Wave[]>(() => waveService.getAllWaves(), []);
  const config = useDexieQuery<AppConfig>(
    () => configRepo.getConfig(),
    DEFAULT_APP_CONFIG
  );

  createEffect(() => {
    sessionStorage.setItem(
      RANGE_STORAGE_KEY,
      JSON.stringify({ from: fromDate(), to: toDate() })
    );
  });

  const summary = createMemo(() =>
    computeHomeSummary({
      items: items(),
      waves: waves(),
      currency: config().defaultCurrency,
      fromDate: fromDate(),
      toDate: toDate(),
    })
  );

  const currencyMeta = () => getCurrencyMeta(summary().currency);
  const totalDisplay = () => Number(centsToDecimal(summary().totalCents));
  const taxDisplay = () => Number(centsToDecimal(summary().taxCents));
  const shippingDisplay = () => Number(centsToDecimal(summary().shippingCents));

  return (
    <section class="mb-4 flex min-h-0 w-full flex-1 flex-col">
      <aside class="flex shrink-0 flex-row items-center justify-between">
        <DatePicker
          label="Desde"
          value={fromDate}
          onChange={setFromDate}
          class="mb-4"
          textClass="text-white"
        />
        <DatePicker
          label="Hasta"
          value={toDate}
          onChange={setToDate}
          class="mb-4"
          textClass="text-white"
        />
      </aside>
      <div class="flex flex-col gap-4">
        <article class="flex flex-col items-end rounded-3xl bg-surface px-6 py-5 question-shadow">
          <p class="font-cutive text-base text-muted-foreground leading-none">
            Costos totales
          </p>
          <p class="mt-1 font-ultra text-3xl text-muted-foreground leading-none">
            {formatAmount(totalDisplay())} {currencyMeta().symbol}
          </p>
          <Show when={summary().taxCents > 0 || summary().shippingCents > 0}>
            <hr class="my-3 h-px w-full border-none bg-border" />
            <div class="flex flex-col items-end gap-1.5">
              <Show when={summary().taxCents > 0}>
                <SummaryItem
                  type={summary().taxEstimated ? "rate" : "taxes"}
                  value={taxDisplay()}
                  currency={summary().currency}
                />
              </Show>
              <Show when={summary().shippingCents > 0}>
                <SummaryItem
                  type="shipping"
                  value={shippingDisplay()}
                  currency={summary().currency}
                />
              </Show>
            </div>
          </Show>
        </article>

        <div class="flex flex-row gap-4">
          <SummaryCard
            value={summary().waveCount}
            label="Oleadas de importación"
          />
          <SummaryCard
            value={summary().itemCount}
            label="Artículos registrados"
          />
        </div>
      </div>
    </section>
  );
}
