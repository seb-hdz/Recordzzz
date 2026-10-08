import { createSignal, onMount, Show } from "solid-js";
import { RefreshCw, X } from "lucide-solid";
import { Button } from "@/components/ui/Button";

export function PwaUpdatePrompt() {
  const [needRefresh, setNeedRefresh] = createSignal(false);
  let updateSW: ((reloadPage?: boolean) => Promise<void>) | undefined;

  onMount(() => {
    // Dynamic import to support SSR/build environments cleanly
    import("virtual:pwa-register")
      .then(({ registerSW }) => {
        updateSW = registerSW({
          onNeedRefresh() {
            setNeedRefresh(true);
          },
          onOfflineReady() {
            console.log("Recordzzz PWA: Lista para funcionar offline.");
          },
        });
      })
      .catch(() => {});
  });

  const handleUpdate = () => {
    if (updateSW) {
      updateSW(true);
    }
  };

  const handleClose = () => {
    setNeedRefresh(false);
  };

  return (
    <Show when={needRefresh()}>
      <div class="fixed top-16 inset-x-4 max-w-md mx-auto z-50 animate-fade-in">
        <div class="bg-surface border border-primary/30 shadow-xl rounded-2xl p-4 flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
              <RefreshCw size={20} class="animate-spin" />
            </div>
            <div>
              <h4 class="text-sm font-bold text-foreground">
                Actualización disponible
              </h4>
              <p class="text-xs text-muted-foreground">
                Hay una nueva versión de Recordzzz lista.
              </p>
            </div>
          </div>

          <div class="flex items-center gap-1.5 shrink-0">
            <Button size="sm" onClick={handleUpdate}>
              Actualizar
            </Button>
            <button
              type="button"
              onClick={handleClose}
              class="p-1 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
}
