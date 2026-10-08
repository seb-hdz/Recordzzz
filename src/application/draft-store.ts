import { createEffect, createSignal, onMount } from "solid-js";
import { createStore, reconcile, type SetStoreFunction } from "solid-js/store";
import { useApp } from "@/application/context";
import type { DraftId } from "@/domain/drafts";

export interface PersistedDraft<T extends object> {
  state: T;
  setState: SetStoreFunction<T>;
  hydrated: () => boolean;
  /** Stops further writes. Call before deleting the row. */
  pause: () => void;
}

function trackStore(value: unknown, seen: Set<object>) {
  if (!value || typeof value !== "object") return;
  if (seen.has(value)) return;
  seen.add(value);
  if (Array.isArray(value)) {
    for (const entry of value) trackStore(entry, seen);
    return;
  }
  for (const key of Object.keys(value)) {
    trackStore((value as Record<string, unknown>)[key], seen);
  }
}

export function createPersistedDraft<T extends object>(
  id: DraftId,
  createInitial: () => T
): PersistedDraft<T> {
  const { draftRepo } = useApp();
  const [state, setState] = createStore<T>(createInitial());
  const [hydrated, setHydrated] = createSignal(false);
  let allowPersist = false;

  onMount(async () => {
    const stored = await draftRepo.get<T>(id);
    if (stored?.payload && typeof stored.payload === "object") {
      setState(reconcile({ ...createInitial(), ...stored.payload }));
    }
    allowPersist = true;
    setHydrated(true);
  });

  createEffect(() => {
    trackStore(state, new Set());
    const payload = JSON.parse(JSON.stringify(state)) as T;
    if (!allowPersist) return;
    void draftRepo.put(id, payload).catch((error) => {
      console.error("No se pudo guardar el borrador", error);
    });
  });

  return {
    state,
    setState,
    hydrated,
    pause: () => {
      allowPersist = false;
    },
  };
}
