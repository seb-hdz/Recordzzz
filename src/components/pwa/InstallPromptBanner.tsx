import { createSignal, onMount, onCleanup, Show } from "solid-js";
import { Download, X } from "lucide-solid";
import { Button } from "@/components/ui/Button";

const DISMISS_KEY = "recordzzz_install_prompt_dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return true;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

export function InstallPromptBanner() {
  const [deferred, setDeferred] = createSignal<BeforeInstallPromptEvent | null>(
    null
  );
  const [visible, setVisible] = createSignal(false);

  onMount(() => {
    if (isStandalone()) return;
    if (localStorage.getItem(DISMISS_KEY) === "1") return;

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", onBip);
    onCleanup(() => window.removeEventListener("beforeinstallprompt", onBip));
  });

  const dismiss = () => {
    setVisible(false);
    setDeferred(null);
    localStorage.setItem(DISMISS_KEY, "1");
  };

  const handleInstall = async () => {
    const event = deferred();
    if (!event) return;
    try {
      await event.prompt();
      await event.userChoice;
    } finally {
      dismiss();
    }
  };

  return (
    <Show when={visible() && deferred()}>
      <div class="fixed bottom-[calc(var(--dock-height)+0.75rem)] inset-x-4 max-w-md mx-auto z-50 animate-fade-in">
        <div class="bg-surface border border-primary/30 shadow-xl rounded-2xl p-4 flex items-center justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
              <Download size={20} />
            </div>
            <div class="min-w-0">
              <h4 class="text-sm font-bold text-foreground">
                Instalar Recordzzz
              </h4>
              <p class="text-xs text-muted-foreground">
                Acceso rápido y uso offline desde tu pantalla de inicio.
              </p>
            </div>
          </div>

          <div class="flex items-center gap-1.5 shrink-0">
            <Button size="sm" onClick={handleInstall}>
              Instalar
            </Button>
            <button
              type="button"
              onClick={dismiss}
              class="p-1 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
}
