import { useNavigate } from "@solidjs/router";
import { createSignal, For, Show } from "solid-js";
import { Plus, Check } from "lucide-solid";
import { useApp } from "@/application/context";
import {
  ItemCategory,
  ItemStatus,
  Currency,
  ITEM_CATEGORIES,
  ITEM_STATUSES,
  CURRENCIES,
} from "@/domain/types";
import { decimalToCents, calculateTaxAmount } from "@/domain/money";
import { dateInputToIso } from "@/domain/dates";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

export default function NewRecord() {
  const navigate = useNavigate();
  const { itemService } = useApp();

  const [name, setName] = createSignal("");
  const [selectedCategories, setSelectedCategories] = createSignal<ItemCategory[]>(["cd"]);
  const [status, setStatus] = createSignal<ItemStatus>("new");
  const [currency, setCurrency] = createSignal<Currency>("PEN");
  const [amountStr, setAmountStr] = createSignal("");
  const [includesTaxes, setIncludesTaxes] = createSignal(true);
  const [taxPercentageStr, setTaxPercentageStr] = createSignal("18");
  const [purchaseDate, setPurchaseDate] = createSignal(
    new Date().toISOString().split("T")[0]
  );
  const [tagInput, setTagInput] = createSignal("");
  const [tags, setTags] = createSignal<string[]>([]);
  const [error, setError] = createSignal("");
  const [isSubmitting, setIsSubmitting] = createSignal(false);

  const toggleCategory = (cat: ItemCategory) => {
    const current = selectedCategories();
    if (current.includes(cat)) {
      if (current.length > 1) {
        setSelectedCategories(current.filter((c) => c !== cat));
      }
    } else {
      setSelectedCategories([...current, cat]);
    }
  };

  const handleAddTag = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = tagInput().trim().replace(/^#/, "");
      if (val && !tags().includes(val)) {
        setTags([...tags(), val]);
        setTagInput("");
      }
    }
  };

  const removeTag = (t: string) => {
    setTags(tags().filter((item) => item !== t));
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!name().trim()) {
      setError("El nombre del artículo es obligatorio.");
      return;
    }
    const cents = decimalToCents(amountStr());
    if (cents <= 0) {
      setError("Ingresa un monto válido.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const taxPct = parseFloat(taxPercentageStr());
      const taxBasisPoints = isNaN(taxPct) ? undefined : Math.round(taxPct * 100);
      const taxAmountCents = taxBasisPoints
        ? calculateTaxAmount(cents, taxBasisPoints)
        : undefined;

      await itemService.createItem({
        name: name().trim(),
        categories: selectedCategories(),
        status: status(),
        price_currency: currency(),
        price_amount_cents: cents,
        price_includes_taxes: includesTaxes(),
        price_tax_amount_cents: taxAmountCents,
        price_tax_percentage: taxBasisPoints,
        purchase_datetime: purchaseDate()
          ? dateInputToIso(purchaseDate())
          : undefined,
        tags: tags().length > 0 ? tags() : undefined,
      });

      navigate("/records");
    } catch (err: any) {
      setError(err.message || "Error al guardar el artículo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div class="space-y-6 pt-2 pb-8 animate-fade-in">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-extrabold text-foreground tracking-tight">
            Nuevo Registro
          </h2>
          <p class="text-xs text-muted-foreground">
            Agrega un medio físico a tu colección
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} class="space-y-5">
        <Show when={error()}>
          <div class="p-3 bg-destructive/15 text-destructive border border-destructive/20 rounded-xl text-xs font-semibold">
            {error()}
          </div>
        </Show>

        {/* Nombre / Título */}
        <div class="space-y-1.5">
          <label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Nombre / Título *
          </label>
          <Input
            type="text"
            placeholder="Ej. The Dark Side of the Moon [LP Edición 50 Aniversario]"
            value={name()}
            onInput={(e) => setName(e.currentTarget.value)}
            required
          />
        </div>

        {/* Categorías (Múltiples) */}
        <div class="space-y-1.5">
          <label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Categoría(s) *
          </label>
          <div class="grid grid-cols-2 gap-2">
            <For each={ITEM_CATEGORIES}>
              {(cat) => {
                const selected = selectedCategories().includes(cat.id);
                return (
                  <button
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    class={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                      selected
                        ? "bg-primary/10 border-primary text-primary shadow-xs"
                        : "bg-surface border-border text-foreground hover:bg-surface-raised"
                    }`}
                  >
                    <span>{cat.label}</span>
                    <Show when={selected}>
                      <Check size={16} class="text-primary" />
                    </Show>
                  </button>
                );
              }}
            </For>
          </div>
        </div>

        {/* Estado Físico */}
        <div class="space-y-1.5">
          <label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Estado Físico *
          </label>
          <div class="grid grid-cols-3 gap-2">
            <For each={ITEM_STATUSES}>
              {(st) => {
                const selected = status() === st.id;
                return (
                  <button
                    type="button"
                    onClick={() => setStatus(st.id)}
                    class={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                      selected
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "bg-surface border-border text-foreground hover:bg-surface-raised"
                    }`}
                  >
                    {st.label}
                  </button>
                );
              }}
            </For>
          </div>
        </div>

        {/* Detalles de Precio */}
        <Card class="space-y-4">
          <h3 class="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Detalles de Precio y Moneda
          </h3>

          <div class="grid grid-cols-3 gap-2.5">
            <div class="col-span-1">
              <label class="text-[11px] font-semibold text-muted-foreground block mb-1">
                Moneda *
              </label>
              <Select
                value={currency()}
                onChange={(e) => setCurrency(e.currentTarget.value as Currency)}
              >
                <For each={CURRENCIES}>
                  {(c) => <option value={c.id}>{c.id}</option>}
                </For>
              </Select>
            </div>

            <div class="col-span-2">
              <label class="text-[11px] font-semibold text-muted-foreground block mb-1">
                Precio * (Ej. 150.50)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amountStr()}
                onInput={(e) => setAmountStr(e.currentTarget.value)}
                required
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2.5 items-center pt-1">
            <div class="flex items-center gap-2">
              <input
                type="checkbox"
                id="includesTaxes"
                checked={includesTaxes()}
                onChange={(e) => setIncludesTaxes(e.currentTarget.checked)}
                class="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer accent-primary"
              />
              <label
                for="includesTaxes"
                class="text-xs font-semibold text-foreground cursor-pointer select-none"
              >
                Incluye impuestos
              </label>
            </div>

            <div>
              <Input
                type="number"
                step="0.1"
                placeholder="% Impuesto (Ej. 18)"
                value={taxPercentageStr()}
                onInput={(e) => setTaxPercentageStr(e.currentTarget.value)}
              />
            </div>
          </div>
        </Card>

        {/* Fecha de Compra */}
        <div class="space-y-1.5">
          <label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Fecha de Compra (Opcional)
          </label>
          <Input
            type="date"
            value={purchaseDate()}
            onInput={(e) => setPurchaseDate(e.currentTarget.value)}
          />
        </div>

        {/* Etiquetas / Tags */}
        <div class="space-y-1.5">
          <label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Etiquetas (Escribe y presiona Enter)
          </label>
          <Input
            type="text"
            placeholder="Ej. rock, pink-floyd, remastered"
            value={tagInput()}
            onInput={(e) => setTagInput(e.currentTarget.value)}
            onKeyDown={handleAddTag}
          />
          <Show when={tags().length > 0}>
            <div class="flex flex-wrap gap-1.5 pt-1">
              <For each={tags()}>
                {(t) => (
                  <span class="inline-flex items-center gap-1 bg-surface-raised border border-border text-foreground px-2 py-1 rounded-lg text-xs font-medium">
                    #{t}
                    <button
                      type="button"
                      onClick={() => removeTag(t)}
                      class="text-muted-foreground hover:text-destructive ml-0.5 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                )}
              </For>
            </div>
          </Show>
        </div>

        {/* Submit Buttons */}
        <div class="pt-2 flex gap-3">
          <Button
            type="button"
            variant="outline"
            class="flex-1"
            onClick={() => navigate(-1)}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            class="flex-2"
            disabled={isSubmitting()}
          >
            <Plus size={18} />
            {isSubmitting() ? "Guardando..." : "Guardar Registro"}
          </Button>
        </div>
      </form>
    </div>
  );
}
