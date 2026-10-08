import importSvg from "@/assets/icons/import-steps/import.svg?raw";
import boxDiscSvg from "@/assets/icons/register-steps/box-disc.svg";
import addShippingSvg from "@/assets/icons/register-steps/add-shipping.svg?raw";
import Badge from "@/components/global/badge";
import ItemPreview from "@/components/items/ItemPreview";
import { toListedItem, type ListedItem } from "@/components/items/filterItems";
import CollapsedQuestion from "@/components/wizard/CollapsedQuestion";
import WizardHeader from "@/components/wizard/WizardHeader";
import Success from "@/components/wizard/success/Success";
import { useDexieQuery } from "@/adapters/storage/dexie/useDexieQuery";
import { createPersistedDraft } from "@/application/draft-store";
import { useApp } from "@/application/context";
import ConfirmDeleteSheet from "@/components/ui/ConfirmDeleteSheet";
import { useNavigate, useSearchParams } from "@solidjs/router";
import {
  createWaveDraft,
  type WaveDraft,
  type WaveWizardStep,
} from "@/domain/drafts";
import { waveToDraft } from "@/domain/draft-mappers";
import { decimalToCents, formatCents } from "@/domain/money";
import { proratedLineShippingCents, wavePriceTotal } from "@/domain/pricing";
import { readPositiveId } from "@/lib/route-id";
import { cn } from "@/lib/utils";
import type { Item } from "@/domain/types";
import { createEffect, createMemo, createSignal, For, Match, Show, Switch } from "solid-js";
import { reconcile, unwrap } from "solid-js/store";
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
  const [searchParams] = useSearchParams();
  const { itemService, waveService, draftRepo } = useApp();
  const { state: draft, setState: setDraft, hydrated, pause } =
    createPersistedDraft("wave", createWaveDraft);
  const catalogue = useDexieQuery<Item[]>(() => itemService.getAllItems(), []);
  const [saving, setSaving] = createSignal(false);
  const [error, setError] = createSignal("");
  const [bootstrapped, setBootstrapped] = createSignal(false);
  const [leaveOpen, setLeaveOpen] = createSignal(false);
  let appliedId: number | null | undefined;

  const editing = () => draft.editingId != null;

  createEffect(() => {
    if (!hydrated()) return;
    const id = readPositiveId(searchParams.id);
    if (appliedId === id) return;
    appliedId = id;

    if (id == null) {
      if (draft.editingId != null) setDraft(reconcile(createWaveDraft()));
      setBootstrapped(true);
      return;
    }

    if (draft.editingId === id) {
      setDraft("step", 3);
      setBootstrapped(true);
      return;
    }

    setBootstrapped(false);
    void Promise.all([
      waveService.getWaveById(id),
      waveService.listLines(id),
    ]).then(([wave, waveLines]) => {
      if (appliedId !== id) return;
      if (!wave || wave.id == null) {
        navigate("/waves");
        return;
      }
      setDraft(reconcile(waveToDraft(wave, waveLines)));
      setBootstrapped(true);
    });
  });

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

  const shippingAnswer = () => {
    const cents = decimalToCents(draft.shippingAmount);
    if (cents <= 0) return "Sin envío";
    return formatCents(cents, draft.shippingCurrency);
  };

  const goTo = (step: WaveWizardStep) => setDraft("step", step);

  const discardEdit = async () => {
    pause();
    await draftRepo.delete("wave");
    navigate("/waves");
  };

  const back = () => {
    if (editing()) {
      setLeaveOpen(true);
      return;
    }
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
      const editingId = draft.editingId;
      const id =
        editingId != null
          ? editingId
          : await waveService.createWave({
              name: draft.name.trim(),
              lines: rows.map((row) => ({
                item_id: Number(row.item.id),
                quantity: row.quantity,
              })),
              shipping_currency: shipping?.currency,
              shipping_amount_cents: shipping?.amountCents,
            });
      if (editingId != null) {
        await waveService.updateWave(editingId, {
          name: draft.name.trim(),
          lines: rows.map((row) => ({
            item_id: Number(row.item.id),
            quantity: row.quantity,
          })),
          shipping_currency: shipping?.currency,
          shipping_amount_cents: shipping?.amountCents,
        });
      }
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
    const wasEditing = draft.editingId != null;
    pause();
    await draftRepo.delete("wave");
    navigate(wasEditing ? "/waves" : "/");
  };

  return (
    <Show when={hydrated() && bootstrapped()}>
      <>
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
            <Show
              when={editing()}
              fallback={
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
              }
            >
              <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
                <Show
                  when={draft.step === 1}
                  fallback={
                    <div class="shrink-0">
                      <CollapsedStep1
                        name={draft.name}
                        onClick={() => goTo(1)}
                      />
                    </div>
                  }
                >
                  <div class="min-h-0 flex-1 overflow-y-auto">
                    <Step1
                      name={draft.name}
                      onNameChange={(name) => setDraft("name", name)}
                      onContinue={() => goTo(2)}
                    />
                  </div>
                </Show>
                <Show
                  when={draft.step === 2}
                  fallback={
                    <div class="max-h-[40%] shrink-0 overflow-y-auto">
                      <CollapsedStep2
                        rows={selected()}
                        onClick={() => goTo(2)}
                      />
                    </div>
                  }
                >
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
                </Show>
                <Show
                  when={draft.step === 3}
                  fallback={
                    <div class="shrink-0">
                      <CollapsedStep3
                        answer={shippingAnswer()}
                        onClick={() => goTo(3)}
                      />
                    </div>
                  }
                >
                  <div class="min-h-0 flex-1 overflow-y-auto">
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
                </Show>
              </div>
            </Show>
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
      <ConfirmDeleteSheet
        open={leaveOpen()}
        title="Salir sin guardar"
        message="Los cambios de esta edición se perderán."
        confirmLabel="Salir"
        onCancel={() => setLeaveOpen(false)}
        onConfirm={() => void discardEdit()}
      />
      </>
    </Show>
  );
}

function CollapsedStep1(props: { name: string; onClick?: () => void }) {
  return (
    <CollapsedQuestion
      step={1}
      icon={<ImportIcon />}
      question="¿Cuál es el nombre de la importación?"
      answer={props.name}
      onClick={props.onClick}
    />
  );
}

function CollapsedStep2(props: {
  rows: { item: ListedItem; quantity: number }[];
  onClick?: () => void;
}) {
  return (
    <div
      class={cn(
        "border-b-2 border-b-muted px-2 py-3.5",
        props.onClick && "cursor-pointer text-left"
      )}
      role={props.onClick ? "button" : undefined}
      tabIndex={props.onClick ? 0 : undefined}
      onClick={() => props.onClick?.()}
      onKeyDown={(event) => {
        if (!props.onClick) return;
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        props.onClick();
      }}
    >
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

function CollapsedStep3(props: { answer: string; onClick?: () => void }) {
  return (
    <CollapsedQuestion
      step={3}
      icon={
        <div
          class="size-14 text-primary [&_svg]:block [&_svg]:size-full"
          innerHTML={addShippingSvg}
        />
      }
      question="¿Agregas costo de envío?"
      answer={props.answer}
      onClick={props.onClick}
    />
  );
}
