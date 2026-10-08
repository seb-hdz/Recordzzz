import ItemsFilterPanel, {
  type ItemsFilters,
} from "@/components/items/ItemsFilterPanel";
import { applyWaveFilters, toListedWaves } from "@/components/waves/filterWaves";
import WavePreviewList from "@/components/waves/WavePreview";
import CommonHeader from "@/components/ui/CommonHeader";
import ConfirmDeleteSheet from "@/components/ui/ConfirmDeleteSheet";
import { useDexieQuery } from "@/adapters/storage/dexie/useDexieQuery";
import { useApp } from "@/application/context";
import { todayDateInput } from "@/domain/dates";
import type { Wave, WaveItem } from "@/domain/types";
import { useNavigate } from "@solidjs/router";
import { createMemo, createSignal, Show } from "solid-js";

export default function WavesPage() {
  const navigate = useNavigate();
  const { waveService } = useApp();
  const waves = useDexieQuery<Wave[]>(() => waveService.getAllWaves(), []);
  const lines = useDexieQuery<WaveItem[]>(() => waveService.listAllLines(), []);
  const initialFilters: ItemsFilters = {
    query: "",
    types: [],
    sort: "recent",
    fromDate: "2026-01-01",
    toDate: todayDateInput(),
  };
  const [filters, setFilters] = createSignal<ItemsFilters>(initialFilters);
  const [pendingDeleteId, setPendingDeleteId] = createSignal<string | null>(
    null
  );
  const [deleting, setDeleting] = createSignal(false);

  const listed = createMemo(() => toListedWaves(waves(), lines()));
  const visible = createMemo(() => applyWaveFilters(listed(), filters()));
  const pending = () =>
    listed().find((wave) => wave.id === pendingDeleteId()) ?? null;

  const countLabel = () => {
    const count = visible().length;
    const noun = count === 1 ? "importación" : "importaciones";
    const scope = count === listed().length ? "todas las" : "las";
    return { scope, count, noun };
  };

  const confirmDelete = async () => {
    const id = Number(pendingDeleteId());
    if (!Number.isInteger(id) || id <= 0 || deleting()) return;
    try {
      setDeleting(true);
      await waveService.deleteWave(id);
      setPendingDeleteId(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main class="flex h-dvh flex-col overflow-hidden">
      <CommonHeader title="Importaciones" showBack onBack={() => navigate("/")} />
      <p class="shrink-0 bg-ring py-1.5 text-center font-cutive text-sm text-muted-foreground">
        Mostrando {countLabel().scope}{" "}
        <span class="underline underline-offset-3">{countLabel().count}</span>{" "}
        {countLabel().noun}
      </p>
      <div class="min-h-0 flex-1 overflow-y-auto">
        <Show
          when={visible().length > 0}
          fallback={
            <p class="px-5 py-8 text-center font-cutive text-base text-muted-foreground">
              Ninguna importación coincide con los filtros.
            </p>
          }
        >
          <WavePreviewList
            waves={visible()}
            onEdit={(id) => navigate(`/waves/new-wave?id=${id}`)}
            onDelete={setPendingDeleteId}
          />
        </Show>
      </div>
      <ItemsFilterPanel
        hideTypes
        initial={initialFilters}
        onFiltersChange={setFilters}
      />
      <ConfirmDeleteSheet
        open={pending() != null}
        title="Eliminar importación"
        message={
          pending()
            ? `¿Eliminar «${pending()!.name}»? Los artículos se conservan.`
            : ""
        }
        confirming={deleting()}
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={() => void confirmDelete()}
      />
    </main>
  );
}
