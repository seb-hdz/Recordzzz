import boxDiscSvg from "@/assets/icons/register-steps/box-disc.svg";
import checkSvg from "@/assets/icons/register-steps/check.svg?raw";
import piggySvg from "@/assets/icons/register-steps/piggy.svg?raw";
import { createPersistedDraft } from "@/application/draft-store";
import { useApp } from "@/application/context";
import {
  createItemDraft,
  type ItemDraft,
  type ItemWizardStep,
  type WaveDraft,
} from "@/domain/drafts";
import { itemToDraft } from "@/domain/draft-mappers";
import { decimalToCents, formatCents } from "@/domain/money";
import { taxFieldsFromDraft } from "@/domain/pricing";
import { readPositiveId } from "@/lib/route-id";
import { ITEM_TYPES } from "@/components/wizard/step2/itemTypes";
import { ITEM_STATUSES } from "@/components/wizard/step3/SelectItemStatus";
import CollapsedQuestion from "@/components/wizard/CollapsedQuestion";
import WizardHeader from "@/components/wizard/WizardHeader";
import Success from "@/components/wizard/success/Success";
import Step1 from "@/components/wizard/step1/Step1";
import Step2 from "@/components/wizard/step2/Step2";
import Step3 from "@/components/wizard/step3/Step3";
import Step4 from "@/components/wizard/step4/Step4";
import Step5 from "@/components/wizard/step5/Step5";
import ConfirmDeleteSheet from "@/components/ui/ConfirmDeleteSheet";
import { useNavigate, useSearchParams } from "@solidjs/router";
import { createEffect, createSignal, Show } from "solid-js";
import { reconcile, unwrap } from "solid-js/store";

function TypeIcon(props: { categories: ItemDraft["categories"] }) {
  const icon = () => {
    const first = props.categories[0];
    return first ? ITEM_TYPES[first].icon : ITEM_TYPES.other.icon;
  };

  return (
    <div
      class="size-14 text-primary [&_svg]:block [&_svg]:size-full"
      innerHTML={icon()}
      aria-hidden="true"
    />
  );
}

function StatusIcon(props: { status: NonNullable<ItemDraft["status"]> }) {
  return (
    <div
      class="size-14 [&_svg]:block [&_svg]:size-full"
      innerHTML={ITEM_STATUSES[props.status].icon}
      aria-hidden="true"
    />
  );
}

export default function ItemWizard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { itemService, draftRepo } = useApp();
  const { state: draft, setState: setDraft, hydrated, pause } =
    createPersistedDraft("item", createItemDraft);
  const [returnToWave, setReturnToWave] = createSignal(false);
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
      if (draft.editingId != null) setDraft(reconcile(createItemDraft()));
      setBootstrapped(true);
      void draftRepo.get<WaveDraft>("wave").then((wave) => {
        setReturnToWave(wave?.payload.awaitingItem === true);
      });
      return;
    }

    if (draft.editingId === id) {
      setDraft("step", 5);
      setBootstrapped(true);
      return;
    }

    setBootstrapped(false);
    void itemService.getItemById(id).then((item) => {
      if (appliedId !== id) return;
      if (!item || item.id == null) {
        navigate("/items");
        return;
      }
      setDraft(reconcile(itemToDraft(item)));
      setBootstrapped(true);
    });
  });

  const categories = () => draft.categories;
  const status = () => draft.status;
  const currency = () => draft.currency;
  const amount = () => draft.amount;
  const taxesPhase = () => draft.taxesPhase;
  const confirmedTax = () => draft.confirmedTax;
  const images = () => draft.images;
  const tags = () => draft.tags;
  const barcodes = () => draft.barcodes;

  const categoryAnswer = () =>
    draft.categories.map((key) => ITEM_TYPES[key].text).join(", ");

  const priceAnswer = () => {
    const price = formatCents(decimalToCents(draft.amount), draft.currency);
    const tax = draft.confirmedTax;
    if (draft.taxesPhase !== "confirmed" || !tax) return price;
    if (tax.mode === "primary") return `${price} + ${tax.value}% de impuesto`;
    return `${price} + ${tax.value} de impuesto`;
  };

  const extrasAnswer = () => {
    const images = draft.images.length;
    const tags = draft.tags.length;
    const barcodes = draft.barcodes.length;
    const parts: string[] = [];
    if (images > 0) {
      parts.push(`${images} ${images === 1 ? "imagen" : "imágenes"}`);
    }
    if (tags > 0) {
      parts.push(`${tags} ${tags === 1 ? "etiqueta" : "etiquetas"}`);
    }
    if (barcodes > 0) {
      parts.push(`${barcodes} ${barcodes === 1 ? "código" : "códigos"}`);
    }
    return parts.length > 0
      ? parts.join(", ")
      : "Sin imágenes, etiquetas ni códigos";
  };

  const showCollapsed = (step: ItemWizardStep) =>
    editing() ? draft.step !== step : draft.step > step;

  const goTo = (step: ItemWizardStep) => setDraft("step", step);

  const openStep = (step: ItemWizardStep) => {
    if (!editing()) return;
    goTo(step);
  };

  const discardEdit = async () => {
    pause();
    await draftRepo.delete("item");
    navigate("/items");
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
    setDraft("step", (draft.step - 1) as ItemWizardStep);
  };

  const finalize = async () => {
    const priceCents = decimalToCents(draft.amount);
    const current = unwrap(draft);
    if (
      !current.name.trim() ||
      current.categories.length === 0 ||
      !current.status ||
      priceCents <= 0
    ) {
      setError("Completa el nombre, la categoría, el estado y el precio.");
      return;
    }

    const status = current.status;
    const tax = taxFieldsFromDraft(
      priceCents,
      current.taxesPhase === "confirmed" ? current.confirmedTax : null
    );

    try {
      setSaving(true);
      setError("");
      const shared = {
        name: current.name.trim(),
        categories: [...current.categories],
        status,
        price_currency: current.currency,
        price_amount_cents: priceCents,
      };
      const id =
        current.editingId != null
          ? current.editingId
          : await itemService.createItem({
              ...shared,
              ...tax.fields,
              photo_urls:
                current.images.length > 0 ? [...current.images] : undefined,
              tags: current.tags.length > 0 ? [...current.tags] : undefined,
              barcodes:
                current.barcodes.length > 0 ? [...current.barcodes] : undefined,
            });
      if (current.editingId != null) {
        await itemService.updateItem(current.editingId, {
          ...shared,
          price_includes_taxes: tax.fields.price_includes_taxes,
          price_tax_amount_cents: tax.fields.price_tax_amount_cents ?? 0,
          price_tax_percentage: tax.fields.price_tax_percentage ?? 0,
          photo_urls: [...current.images],
          tags: [...current.tags],
          barcodes: [...current.barcodes],
        });
      }
      setDraft("saved", {
        id,
        name: draft.name.trim(),
        price: { amountCents: priceCents, currency: draft.currency },
        tax: tax.success
          ? {
              amountCents: tax.success.amountCents,
              currency: draft.currency,
              estimated: tax.success.estimated,
            }
          : undefined,
      });
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No se pudo guardar el artículo."
      );
    } finally {
      setSaving(false);
    }
  };

  const leaveSuccess = async () => {
    pause();
    const wasEditing = draft.editingId != null;
    await draftRepo.delete("item");
    if (wasEditing) {
      navigate("/items");
      return;
    }
    if (returnToWave()) {
      const wave = await draftRepo.get<WaveDraft>("wave");
      if (wave) {
        await draftRepo.put("wave", {
          ...wave.payload,
          awaitingItem: false,
        });
        if (wave.payload.editingId != null) {
          navigate(`/waves/new-wave?id=${wave.payload.editingId}`);
          return;
        }
      }
      navigate("/waves/new-wave");
      return;
    }
    navigate("/");
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
            <div class="min-h-0 flex-1 overflow-y-auto">
              <Show when={showCollapsed(1)}>
                <CollapsedQuestion
                  step={1}
                  icon={<img src={boxDiscSvg} alt="" class="size-14" />}
                  question="¿Cuál es el nombre del artículo?"
                  answer={draft.name}
                  onClick={editing() ? () => openStep(1) : undefined}
                />
              </Show>
              <Show when={draft.step === 1}>
                <Step1
                  name={draft.name}
                  onNameChange={(name) => setDraft("name", name)}
                  onContinue={() => goTo(2)}
                />
              </Show>
              <Show when={showCollapsed(2)}>
                <CollapsedQuestion
                  step={2}
                  icon={<TypeIcon categories={draft.categories} />}
                  question="¿Qué es el artículo?"
                  answer={categoryAnswer()}
                  onClick={editing() ? () => openStep(2) : undefined}
                />
              </Show>
              <Show when={draft.step === 2}>
                <Step2
                  selected={categories}
                  onSelectedChange={(selected) =>
                    setDraft("categories", selected)
                  }
                  onContinue={() => goTo(3)}
                />
              </Show>
              <Show when={showCollapsed(3) && draft.status}>
                <CollapsedQuestion
                  step={3}
                  icon={<StatusIcon status={draft.status!} />}
                  question="¿En qué estado está el artículo?"
                  answer={ITEM_STATUSES[draft.status!].text}
                  onClick={editing() ? () => openStep(3) : undefined}
                />
              </Show>
              <Show when={draft.step === 3}>
                <Step3
                  selected={status}
                  onSelectedChange={(selected) => setDraft("status", selected)}
                  onContinue={() => goTo(4)}
                />
              </Show>
              <Show when={showCollapsed(4)}>
                <CollapsedQuestion
                  step={4}
                  icon={
                    <div
                      class="size-14 [&_svg]:block [&_svg]:size-full"
                      innerHTML={piggySvg}
                    />
                  }
                  question="¿Cuánto costó el artículo?"
                  answer={priceAnswer()}
                  onClick={editing() ? () => openStep(4) : undefined}
                />
              </Show>
              <Show when={draft.step === 4}>
                <Step4
                  currency={currency}
                  amount={amount}
                  taxesPhase={taxesPhase}
                  confirmedTax={confirmedTax}
                  onCurrencyChange={(next) => setDraft("currency", next)}
                  onAmountChange={(next) => setDraft("amount", next)}
                  onTaxesPhaseChange={(next) => setDraft("taxesPhase", next)}
                  onConfirmedTaxChange={(next) =>
                    setDraft("confirmedTax", next)
                  }
                  onContinue={() => goTo(5)}
                />
              </Show>
              <Show when={showCollapsed(5)}>
                <CollapsedQuestion
                  step={5}
                  icon={
                    <div
                      class="size-14 [&_svg]:block [&_svg]:size-full"
                      innerHTML={checkSvg}
                    />
                  }
                  question="Información adicional"
                  answer={extrasAnswer()}
                  onClick={() => openStep(5)}
                />
              </Show>
              <Show when={draft.step === 5}>
                <Step5
                  images={images}
                  tags={tags}
                  barcodes={barcodes}
                  onImagesChange={(next) => setDraft("images", next)}
                  onTagsChange={(next) => setDraft("tags", next)}
                  onBarcodesChange={(next) => setDraft("barcodes", next)}
                  onFinalize={() => void finalize()}
                  isSaving={saving()}
                />
              </Show>
            </div>
          </main>
        }
      >
        {(saved) => (
          <Success
            variant="item"
            name={saved().name}
            price={saved().price}
            tax={saved().tax}
            actionLabel={
              !editing() && returnToWave() ? "Volver a la importación" : "Listo"
            }
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
