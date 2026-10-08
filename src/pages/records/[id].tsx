import { useParams, useNavigate } from "@solidjs/router";
import { createSignal, createEffect, For, Show } from "solid-js";
import {
  Trash2,
  Save,
  Check,
  Disc,
  Disc3,
  Box,
  Calendar,
} from "lucide-solid";
import { useApp } from "@/application/context";
import {
  Item,
  ItemCategory,
  ItemStatus,
  Currency,
  ITEM_CATEGORIES,
  ITEM_STATUSES,
  CURRENCIES,
} from "@/domain/types";
import {
  formatCents,
  centsToDecimal,
  decimalToCents,
  calculateTaxAmount,
  formatTaxPercentage,
} from "@/domain/money";
import { dateInputToIso, isoToDateInput } from "@/domain/dates";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

export default function RecordDetail() {
  const params = useParams();
  const navigate = useNavigate();
  const { itemService } = useApp();

  const [item, setItem] = createSignal<Item | null>(null);
  const [isEditing, setIsEditing] = createSignal(false);
  const [deleteModalOpen, setDeleteModalOpen] = createSignal(false);
  const [isSaving, setIsSaving] = createSignal(false);
  const [error, setError] = createSignal("");

  // Edit Form state
  const [editName, setEditName] = createSignal("");
  const [editCategories, setEditCategories] = createSignal<ItemCategory[]>([]);
  const [editStatus, setEditStatus] = createSignal<ItemStatus>("new");
  const [editCurrency, setEditCurrency] = createSignal<Currency>("PEN");
  const [editAmountStr, setEditAmountStr] = createSignal("");
  const [editIncludesTaxes, setEditIncludesTaxes] = createSignal(true);
  const [editTaxPercentageStr, setEditTaxPercentageStr] = createSignal("");
  const [editPurchaseDate, setEditPurchaseDate] = createSignal("");
  const [editTags, setEditTags] = createSignal<string[]>([]);
  const [tagInput, setTagInput] = createSignal("");

  createEffect(async () => {
    const idStr = params.id;
    if (!idStr) return;
    const id = parseInt(idStr, 10);
    if (!isNaN(id)) {
      const data = await itemService.getItemById(id);
      if (data) {
        setItem(data);
        setEditName(data.name);
        setEditCategories(data.categories);
        setEditStatus(data.status);
        setEditCurrency(data.price_currency);
        setEditAmountStr(centsToDecimal(data.price_amount_cents));
        setEditIncludesTaxes(data.price_includes_taxes);
        setEditTaxPercentageStr(
          data.price_tax_percentage
            ? (data.price_tax_percentage / 100).toString()
            : ""
        );
        setEditPurchaseDate(isoToDateInput(data.purchase_datetime));
        setEditTags(data.tags || []);
      }
    }
  });

  const toggleCategory = (cat: ItemCategory) => {
    const current = editCategories();
    if (current.includes(cat)) {
      if (current.length > 1) {
        setEditCategories(current.filter((c) => c !== cat));
      }
    } else {
      setEditCategories([...current, cat]);
    }
  };

  const handleAddTag = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = tagInput().trim().replace(/^#/, "");
      if (val && !editTags().includes(val)) {
        setEditTags([...editTags(), val]);
        setTagInput("");
      }
    }
  };

  const removeTag = (t: string) => {
    setEditTags(editTags().filter((item) => item !== t));
  };

  const handleSave = async (e: Event) => {
    e.preventDefault();
    const currentItem = item();
    if (!currentItem?.id) return;

    if (!editName().trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    const cents = decimalToCents(editAmountStr());
    if (cents <= 0) {
      setError("Monto inválido.");
      return;
    }

    try {
      setIsSaving(true);
      setError("");

      const taxPct = parseFloat(editTaxPercentageStr());
      const taxBasisPoints = isNaN(taxPct) ? undefined : Math.round(taxPct * 100);
      const taxAmountCents = taxBasisPoints
        ? calculateTaxAmount(cents, taxBasisPoints)
        : undefined;

      await itemService.updateItem(currentItem.id, {
        name: editName().trim(),
        categories: editCategories(),
        status: editStatus(),
        price_currency: editCurrency(),
        price_amount_cents: cents,
        price_includes_taxes: editIncludesTaxes(),
        price_tax_amount_cents: taxAmountCents,
        price_tax_percentage: taxBasisPoints,
        purchase_datetime: editPurchaseDate()
          ? dateInputToIso(editPurchaseDate())
          : undefined,
        tags: editTags().length > 0 ? editTags() : undefined,
      });

      const updated = await itemService.getItemById(currentItem.id);
      if (updated) setItem(updated);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "Error al actualizar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const currentItem = item();
    if (!currentItem?.id) return;
    await itemService.deleteItem(currentItem.id);
    navigate("/records");
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "vinyl":
        return <Disc3 size={20} />;
      case "boxset":
        return <Box size={20} />;
      case "cd":
      default:
        return <Disc size={20} />;
    }
  };

  return (
    <div class="space-y-6 pt-2 pb-8 animate-fade-in">
      <Show
        when={item()}
        fallback={
          <div class="text-center py-16 text-muted-foreground">
            Cargando artículo...
          </div>
        }
      >
        {(current) => (
          <div>
            {/* Header with Title and Actions */}
            <div class="flex items-start justify-between gap-4 mb-4">
              <div class="min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <Badge variant="primary" size="sm">
                    ID #{current().id}
                  </Badge>
                  <span class="text-xs text-muted-foreground">
                    {new Date(current().created_at).toLocaleDateString("es-PE")}
                  </span>
                </div>
                <h2 class="text-2xl font-extrabold text-foreground tracking-tight leading-tight">
                  {current().name}
                </h2>
              </div>

              <div class="flex items-center gap-2 shrink-0">
                <Show when={!isEditing()}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteModalOpen(true)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </Show>
              </div>
            </div>

            {/* Readonly View */}
            <Show when={!isEditing()}>
              <div class="space-y-4">
                {/* Price Hero Card */}
                <Card class="bg-gradient-to-br from-surface via-surface to-surface-raised border-primary/20 p-5">
                  <div class="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Valor Registrado
                  </div>
                  <div class="text-3xl font-black text-foreground tracking-tight font-mono">
                    {formatCents(
                      current().price_amount_cents,
                      current().price_currency
                    )}
                  </div>
                  <div class="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                    <span>
                      Impuestos:{" "}
                      {current().price_includes_taxes ? "Incluidos" : "Excluidos"}
                    </span>
                    <Show when={current().price_tax_percentage}>
                      <span>•</span>
                      <span>
                        Tasa: {formatTaxPercentage(current().price_tax_percentage)}
                      </span>
                    </Show>
                  </div>
                </Card>

                {/* Categories & Status */}
                <Card class="space-y-3 p-4">
                  <div>
                    <span class="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                      Categorías
                    </span>
                    <div class="flex flex-wrap gap-2">
                      <For each={current().categories}>
                        {(cat) => (
                          <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 text-xs font-bold capitalize">
                            {getCategoryIcon(cat)}
                            {cat}
                          </span>
                        )}
                      </For>
                    </div>
                  </div>

                  <div class="pt-2 border-t border-border/60">
                    <span class="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                      Estado del Artículo
                    </span>
                    <span class="inline-block px-3 py-1 rounded-lg text-xs font-bold capitalize bg-surface-raised border border-border">
                      {ITEM_STATUSES.find((s) => s.id === current().status)?.label ||
                        current().status}
                    </span>
                  </div>

                  <Show when={current().purchase_datetime}>
                    <div class="pt-2 border-t border-border/60 flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar size={16} />
                      <span>
                        Fecha de compra:{" "}
                        <strong class="text-foreground">
                          {new Date(
                            current().purchase_datetime!
                          ).toLocaleDateString("es-PE", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </strong>
                      </span>
                    </div>
                  </Show>
                </Card>

                {/* Tags */}
                <Show when={current().tags && current().tags!.length > 0}>
                  <Card class="p-4">
                    <span class="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                      Etiquetas
                    </span>
                    <div class="flex flex-wrap gap-1.5">
                      <For each={current().tags}>
                        {(tag) => (
                          <span class="px-2.5 py-1 rounded-lg bg-surface-raised border border-border text-xs font-medium text-foreground">
                            #{tag}
                          </span>
                        )}
                      </For>
                    </div>
                  </Card>
                </Show>
              </div>
            </Show>

            {/* Edit Mode Form */}
            <Show when={isEditing()}>
              <form onSubmit={handleSave} class="space-y-4">
                <Show when={error()}>
                  <div class="p-3 bg-destructive/15 text-destructive border border-destructive/20 rounded-xl text-xs font-semibold">
                    {error()}
                  </div>
                </Show>

                <div class="space-y-1.5">
                  <label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Nombre / Título *
                  </label>
                  <Input
                    type="text"
                    value={editName()}
                    onInput={(e) => setEditName(e.currentTarget.value)}
                    required
                  />
                </div>

                {/* Categories */}
                <div class="space-y-1.5">
                  <label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Categorías *
                  </label>
                  <div class="grid grid-cols-2 gap-2">
                    <For each={ITEM_CATEGORIES}>
                      {(cat) => {
                        const selected = editCategories().includes(cat.id);
                        return (
                          <button
                            type="button"
                            onClick={() => toggleCategory(cat.id)}
                            class={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold cursor-pointer ${
                              selected
                                ? "bg-primary/10 border-primary text-primary"
                                : "bg-surface border-border text-foreground"
                            }`}
                          >
                            <span>{cat.label}</span>
                            <Show when={selected}>
                              <Check size={16} />
                            </Show>
                          </button>
                        );
                      }}
                    </For>
                  </div>
                </div>

                {/* Status */}
                <div class="space-y-1.5">
                  <label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Estado *
                  </label>
                  <div class="grid grid-cols-3 gap-2">
                    <For each={ITEM_STATUSES}>
                      {(st) => {
                        const selected = editStatus() === st.id;
                        return (
                          <button
                            type="button"
                            onClick={() => setEditStatus(st.id)}
                            class={`p-2 rounded-xl border text-center text-xs font-bold cursor-pointer ${
                              selected
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-surface border-border text-foreground"
                            }`}
                          >
                            {st.label}
                          </button>
                        );
                      }}
                    </For>
                  </div>
                </div>

                {/* Price */}
                <Card class="space-y-3">
                  <div class="grid grid-cols-3 gap-2">
                    <div>
                      <label class="text-[11px] font-semibold text-muted-foreground block mb-1">
                        Moneda
                      </label>
                      <Select
                        value={editCurrency()}
                        onChange={(e) =>
                          setEditCurrency(e.currentTarget.value as Currency)
                        }
                      >
                        <For each={CURRENCIES}>
                          {(c) => <option value={c.id}>{c.id}</option>}
                        </For>
                      </Select>
                    </div>

                    <div class="col-span-2">
                      <label class="text-[11px] font-semibold text-muted-foreground block mb-1">
                        Precio
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={editAmountStr()}
                        onInput={(e) => setEditAmountStr(e.currentTarget.value)}
                        required
                      />
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-2 items-center">
                    <div class="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="editIncludesTaxes"
                        checked={editIncludesTaxes()}
                        onChange={(e) =>
                          setEditIncludesTaxes(e.currentTarget.checked)
                        }
                        class="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer accent-primary"
                      />
                      <label
                        for="editIncludesTaxes"
                        class="text-xs font-semibold text-foreground cursor-pointer"
                      >
                        Incluye impuestos
                      </label>
                    </div>
                    <div>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="% Impuesto"
                        value={editTaxPercentageStr()}
                        onInput={(e) =>
                          setEditTaxPercentageStr(e.currentTarget.value)
                        }
                      />
                    </div>
                  </div>
                </Card>

                {/* Purchase Date */}
                <div class="space-y-1.5">
                  <label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Fecha de Compra
                  </label>
                  <Input
                    type="date"
                    value={editPurchaseDate()}
                    onInput={(e) => setEditPurchaseDate(e.currentTarget.value)}
                  />
                </div>

                {/* Tags */}
                <div class="space-y-1.5">
                  <label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Etiquetas
                  </label>
                  <Input
                    type="text"
                    placeholder="Escribe y presiona Enter..."
                    value={tagInput()}
                    onInput={(e) => setTagInput(e.currentTarget.value)}
                    onKeyDown={handleAddTag}
                  />
                  <Show when={editTags().length > 0}>
                    <div class="flex flex-wrap gap-1.5 pt-1">
                      <For each={editTags()}>
                        {(t) => (
                          <span class="inline-flex items-center gap-1 bg-surface-raised border border-border text-foreground px-2 py-1 rounded-lg text-xs font-medium">
                            #{t}
                            <button
                              type="button"
                              onClick={() => removeTag(t)}
                              class="text-muted-foreground hover:text-destructive ml-0.5"
                            >
                              ×
                            </button>
                          </span>
                        )}
                      </For>
                    </div>
                  </Show>
                </div>

                {/* Save Actions */}
                <div class="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    class="flex-1"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    class="flex-2"
                    disabled={isSaving()}
                  >
                    <Save size={16} />
                    {isSaving() ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </div>
              </form>
            </Show>

            {/* Delete Modal */}
            <Modal
              open={deleteModalOpen()}
              onClose={() => setDeleteModalOpen(false)}
              title="Eliminar Registro"
            >
              <div class="space-y-4">
                <p class="text-sm text-muted-foreground">
                  ¿Estás seguro de que deseas eliminar{" "}
                  <strong class="text-foreground">{current().name}</strong>? Esta
                  acción no se puede deshacer.
                </p>
                <div class="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button variant="destructive" onClick={handleDelete}>
                    <Trash2 size={16} />
                    Eliminar
                  </Button>
                </div>
              </div>
            </Modal>
          </div>
        )}
      </Show>
    </div>
  );
}
