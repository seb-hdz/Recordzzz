import { createSignal, onCleanup, Accessor } from "solid-js";
import { liveQuery, PromiseExtended } from "dexie";

/**
 * SolidJS reactive hook for Dexie live queries.
 * Automatically tracks Dexie table changes and cleans up subscriptions on component unmount.
 */
export function useDexieQuery<T>(
  querier: () => PromiseExtended<T> | Promise<T> | T,
  initialValue: T
): Accessor<T> {
  const [data, setData] = createSignal<T>(initialValue);

  const observable = liveQuery(querier);
  const subscription = observable.subscribe({
    next: (val) => {
      setData(() => val as any);
    },
    error: (err) => {
      console.error("Dexie liveQuery error:", err);
    },
  });

  onCleanup(() => {
    subscription.unsubscribe();
  });

  return data;
}
