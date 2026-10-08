import importSvg from "@/assets/icons/import-steps/import.svg?raw";
import boxDiscSvg from "@/assets/icons/register-steps/box-disc.svg";
import Badge from "@/components/global/badge";
import ItemPreview from "@/components/items/ItemPreview";
import { toListedItem, type ListedItem } from "@/components/items/filterItems";
import CollapsedQuestion from "@/components/wizard/CollapsedQuestion";
import WizardHeader from "@/components/wizard/WizardHeader";
import Success from "@/components/wizard/success/Success";
import { useDexieQuery } from "@/adapters/storage/dexie/useDexieQuery";
import { createPersistedDraft } from "@/application/draft-store";
import { useApp } from "@/application/context";
import { useNavigate } from "@/router";
import {
  createWaveDraft,
  type WaveDraft,
  type WaveWizardStep,
} from "@/domain/drafts";
import { decimalToCents } from "@/domain/money";
import { proratedLineShippingCents, wavePriceTotal } from "@/domain/pricing";
import type { Item } from "@/domain/types";
import { createMemo, createSignal, For, Match, Show, Switch } from "solid-js";
import { unwrap } from "solid-js/store";
import Step1 from "./step1/Step1";
import Step2 from "./step2/Step2";
import Step3 from "./step3/Step3";

function ImportIcon() {
  return (
    <div
      class="size-14 text-primary [&_svg]:block [&_svg]:size-full"
      innerHTML={importSvg}
      aria-hidden="true"
    />
  );
}

export default function ImportWizard() {
  const navigate = useNavigate();
  const { itemService, waveService, draftRepo } = useApp();
  const { state: draft, setState: setDraft, hydrated, pause } =
    createPersistedDraft("wave", createWaveDraft);
  const catalogue = useDexieQuery<Item[]>(() => itemService.getAllItems(), []);
  const [saving, setSaving] = createSignal(false);
  const [error, setError] = createSignal("");

  const listed = createMemo(() =>
    catalogue().flatMap((item) => {
      const row = toListedItem(item);
      return row ? [row] : [];
    })
  );

  const selected = createMemo(() =>
    draft.lines.flatMap((line) => {
      const item = listed().find((row) => Number(row.id) === line.itemId);
      if (!item || line.quantity < 1) return [];
      return [{ item, quantity: line.quantity }];
    })
  );

  const currency = () => draft.shippingCurrency;
  const amount = () => draft.shippingAmount;
  const phase = () => draft.shippingPhase;

  const goTo = (step: WaveWizardStep) => setDraft("step", step);

  const back = () => {
    if (draft.step <= 1) {
      navigate("/");
      return;
    }
    setDraft("step", (draft.step - 1) as WaveWizardStep);
  };

  const toggle = (itemId: number) => {
    const exists = draft.lines.some((line) => line.itemId === itemId);
    if (exists) {
      setDraft(
        "lines",
        (lines) => lines.filter((line) => line.itemId !== itemId)
      );
      return;
    }
    setDraft("lines", (lines) => [...lines, { itemId, quantity: 1 }]);
  };

  const setQuantity = (itemId: number, quantity: number) => {
    if (quantity < 1) {
      setDraft(
        "lines",
        (lines) => lines.filter((line) => line.itemId !== itemId)
      );
      return;
    }
    setDraft("lines", (line) => line.itemId === itemId, "quantity", quantity);
  };

  const registerItem = async () => {
    const payload = JSON.parse(JSON.stringify(unwrap(draft))) as WaveDraft;
    payload.awaitingItem = true;
    setDraft("awaitingItem", true);
    await draftRepo.put("wave", payload);
    navigate("/items/new-item");
  };

  const persist = async (includeShipping: boolean) => {
    if (saving()) return;
    const rows = selected();
    if (!draft.name.trim() || rows.length === 0) {
      setError("Indica el nombre y selecciona al menos un artículo.");
      return;
    }

    const shippingCents = includeShipping
      ? decimalToCents(draft.shippingAmount)
      : 0;
    if (includeShipping && shippingCents <= 0) {
      setError("Indica un costo de envío mayor a cero, o continúa sin agregarlo.");
      return;
    }

    const totalQuantity = rows.reduce((sum, row) => sum + row.quantity, 0);
    const price = wavePriceTotal(
      rows.map((row) => ({
        priceAmountCents: row.item.priceAmountCents,
        priceCurrency: row.item.priceCurrency,
        quantity: row.quantity,
      }))
    );
    const shipping =
      shippingCents > 0
        ? { amountCents: shippingCents, currency: draft.shippingCurrency }
        : undefined;

    try {
      setSaving(true);
      setError("");
      const id = await waveService.createWave({
        name: draft.name.trim(),
        lines: rows.map((row) => ({
          item_id: Number(row.item.id),
          quantity: row.quantity,
        })),
        shipping_currency: shipping?.currency,
        shipping_amount_cents: shipping?.amountCents,
      });
      setDraft("saved", {
        id,
        name: draft.name.trim(),
        price,
        shipping,
        items: rows.map((row) => ({
          categories: row.item.categories,
          name: row.item.name,
          priceAmountCents: row.item.priceAmountCents,
          priceCurrency: row.item.priceCurrency,
          quantity: row.quantity,
          hasTaxes: Boolean(row.item.hasTaxes),
          hasShipping:
            proratedLineShippingCents(
              shippingCents,
              row.quantity,
              totalQuantity
            ) > 0,
        })),
      });
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No se pudo guardar la importación."
      );
    } finally {
      setSaving(false);
    }
  };

  const leaveSuccess = async () => {
    pause();
    await draftRepo.delete("wave");
    navigate("/");
  };

  return (
    <Show when={hydrated()}>
      <Show
        when={draft.saved}
        fallback={
          <main class="flex h-dvh flex-col overflow-hidden bg-background">
            <WizardHeader step={draft.step} showBack onBack={back} />
            <Show when={error()}>
              <p class="shrink-0 px-4 pt-3 text-center font-cutive text-sm text-destructive">
                {error()}
              </p>
            </Show>
            <Switch>
              <Match when={draft.step === 1}>
                <div class="min-h-0 flex-1 overflow-y-auto">
                  <Step1
                    name={draft.name}
                    onNameChange={(name) => setDraft("name", name)}
                    onContinue={() => goTo(2)}
                  />
                </div>
              </Match>
              <Match when={draft.step === 2}>
                <div class="shrink-0">
                  <CollapsedStep1 name={draft.name} />
                </div>
                <div class="flex min-h-0 flex-1 flex-col">
                  <Step2
                    items={listed()}
                    lines={draft.lines}
                    filters={draft.filters}
                    onFiltersChange={(filters) => setDraft("filters", filters)}
                    onToggle={toggle}
                    onQuantityChange={setQuantity}
                    onContinue={() => goTo(3)}
                    onRegister={() => void registerItem()}
                  />
                </div>
              </Match>
              <Match when={draft.step === 3}>
                <div class="min-h-0 flex-1 overflow-y-auto">
                  <CollapsedStep1 name={draft.name} />
                  <CollapsedStep2 rows={selected()} />
                  <Step3
                    currency={currency}
                    amount={amount}
                    phase={phase}
                    onCurrencyChange={(next) =>
                      setDraft("shippingCurrency", next)
                    }
                    onAmountChange={(next) => setDraft("shippingAmount", next)}
                    onPhaseChange={(next) => setDraft("shippingPhase", next)}
                    onContinueWithout={() => void persist(false)}
                    onContinueWithShipping={() => void persist(true)}
                  />
                </div>
              </Match>
            </Switch>
          </main>
        }
      >
        {(saved) => (
          <Success
            variant="wave"
            name={saved().name}
            price={saved().price}
            shipping={saved().shipping}
            items={saved().items}
            actionLabel="Listo"
            onAction={() => void leaveSuccess()}
          />
        )}
      </Show>
    </Show>
  );
}

function CollapsedStep1(props: { name: string }) {
  return (
    <CollapsedQuestion
      step={1}
      icon={<ImportIcon />}
      question="¿Cuál es el nombre de la importación?"
      answer={props.name}
    />
  );
}

function CollapsedStep2(props: {
  rows: { item: ListedItem; quantity: number }[];
}) {
  return (
    <div class="border-b-2 border-b-muted px-2 py-3.5">
      <div class="flex flex-row items-start">
        <div class="relative shrink-0">
          <img src={boxDiscSvg} alt="" class="size-14" />
          <Badge text="2" customClass="absolute bottom-1 -right-1.5" />
        </div>
        <p class="ml-4 font-ultra tracking-[-2%]">
          Selecciona los artículos incluídos
        </p>
      </div>
      <ul class="mt-2 flex flex-col">
        <For each={props.rows}>
          {(row) => (
            <li>
              <ItemPreview
                categories={row.item.categories}
                name={`${row.item.name} × ${row.quantity}`}
                priceAmountCents={row.item.priceAmountCents}
                priceCurrency={row.item.priceCurrency}
                hasTaxes={row.item.hasTaxes}
                class="px-0 py-2"
              />
            </li>
          )}
        </For>
      </ul>
    </div>
  );
}
