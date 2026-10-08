import { createSignal, Show, For } from "solid-js";
import {
  Sun,
  Moon,
  Clock,
  Download,
  Upload,
  Check,
  Smartphone,
  ShieldCheck,
  Sparkles,
} from "lucide-solid";
import { useApp } from "@/application/context";
import { ThemeStorageMode } from "@/domain/types";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export default function Settings() {
  const { themeService, backup, configRepo } = useApp();

  const [exporting, setExporting] = createSignal(false);
  const [importing, setImporting] = createSignal(false);
  const [message, setMessage] = createSignal("");
  const [importModalOpen, setImportModalOpen] = createSignal(false);
  const [importMode, setImportMode] = createSignal<"replace" | "merge">("merge");
  let fileInputRef: HTMLInputElement | undefined;

  const themes: { id: ThemeStorageMode; label: string; icon: any; desc: string }[] = [
    {
      id: "noom",
      label: "Noom (Claro)",
      icon: Sun,
      desc: "Paleta clara fresca con tonos menta y verde bosque",
    },
    {
      id: "noom-dark",
      label: "Noom Dark (Oscuro)",
      icon: Moon,
      desc: "Obsidiana profundo con acentos verde esmeralda",
    },
    {
      id: "auto",
      label: "Automático",
      icon: Clock,
      desc: "Cambia a oscuro según la hora programada",
    },
    {
      id: "system",
      label: "Sistema",
      icon: Smartphone,
      desc: "Sigue la preferencia del sistema operativo",
    },
  ];

  const handleExport = async () => {
    try {
      setExporting(true);
      const data = await backup.exportData();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const dateStr = new Date().toISOString().split("T")[0];
      a.href = url;
      a.download = `recordzzz-backup-${dateStr}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage("Copia de seguridad exportada correctamente.");
    } catch (err: any) {
      setMessage(`Error al exportar: ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  const handleFileSelected = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      const text = await file.text();
      const data = JSON.parse(text);
      const mode = importMode();
      const res = await backup.importData(data, mode);

      if (mode === "replace") {
        const config = await configRepo.getConfig();
        themeService.hydrateFromConfig(config);
      }

      setImportModalOpen(false);
      setMessage(`Se importaron ${res.importedCount} artículos exitosamente.`);
    } catch (err: any) {
      setMessage(`Error al importar: ${err.message}`);
    } finally {
      setImporting(false);
      if (fileInputRef) fileInputRef.value = "";
    }
  };

  return (
    <div class="space-y-6 pt-2 pb-8 animate-fade-in">
      <div>
        <h2 class="text-2xl font-extrabold text-foreground tracking-tight">
          Ajustes
        </h2>
        <p class="text-xs text-muted-foreground">
          Personalización de temas y gestión de datos
        </p>
      </div>

      <Show when={message()}>
        <div class="p-3.5 bg-primary/10 border border-primary/20 text-primary rounded-xl text-xs font-semibold flex items-center justify-between">
          <span>{message()}</span>
          <button
            type="button"
            onClick={() => setMessage("")}
            class="text-primary font-bold cursor-pointer"
          >
            ×
          </button>
        </div>
      </Show>

      {/* Tema y Apariencia */}
      <Card class="space-y-4">
        <div class="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
          <Sparkles size={16} class="text-primary" />
          <span>Tema y Apariencia</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <For each={themes}>
            {(th) => {
              const active = themeService.themeMode() === th.id;
              const IconComponent = th.icon;
              return (
                <button
                  type="button"
                  onClick={() => themeService.setThemeMode(th.id)}
                  class={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    active
                      ? "bg-primary/10 border-primary shadow-xs"
                      : "bg-surface border-border hover:bg-surface-raised"
                  }`}
                >
                  <div class="flex items-center justify-between mb-1">
                    <div class="flex items-center gap-2 font-bold text-xs text-foreground">
                      <IconComponent
                        size={16}
                        class={active ? "text-primary" : "text-muted-foreground"}
                      />
                      <span>{th.label}</span>
                    </div>
                    <Show when={active}>
                      <Check size={16} class="text-primary" />
                    </Show>
                  </div>
                  <p class="text-[11px] text-muted-foreground leading-snug">
                    {th.desc}
                  </p>
                </button>
              );
            }}
          </For>
        </div>

        <Show when={themeService.themeMode() === "auto"}>
          <div class="pt-3 border-t border-border flex items-center justify-between gap-4">
            <div>
              <div class="text-xs font-bold text-foreground">
                Hora de Modo Oscuro
              </div>
              <div class="text-[11px] text-muted-foreground">
                La app pasará a Noom Dark a partir de esta hora
              </div>
            </div>
            <div class="w-28">
              <Input
                type="time"
                value={themeService.autoDarkAt()}
                onInput={(e) =>
                  themeService.setAutoDarkAt(e.currentTarget.value)
                }
              />
            </div>
          </div>
        </Show>
      </Card>

      {/* Copia de Seguridad y Datos */}
      <Card class="space-y-4">
        <div class="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
          <ShieldCheck size={16} class="text-primary" />
          <span>Copia de Seguridad (JSON)</span>
        </div>

        <p class="text-xs text-muted-foreground leading-relaxed">
          Tus datos se almacenan exclusivamente de manera local en tu navegador
          mediante IndexedDB. Puedes exportar una copia de seguridad o restaurarla
          en cualquier momento.
        </p>

        <div class="flex flex-wrap gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={exporting()}
          >
            <Download size={16} />
            {exporting() ? "Exportando..." : "Exportar JSON"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setImportModalOpen(true)}
          >
            <Upload size={16} />
            Importar JSON
          </Button>
        </div>
      </Card>

      {/* Información de la Aplicación */}
      <Card class="space-y-2 text-xs text-muted-foreground">
        <div class="flex items-center justify-between">
          <span class="font-bold text-foreground">Recordzzz</span>
          <span class="font-mono">v0.1.0 (PWA)</span>
        </div>
        <div>
          Arquitectura reactiva con SolidJS + Vite + IndexedDB (Dexie).
        </div>
      </Card>

      {/* Modal de Importación */}
      <Modal
        open={importModalOpen()}
        onClose={() => setImportModalOpen(false)}
        title="Importar Copia de Seguridad"
      >
        <div class="space-y-4">
          <p class="text-xs text-muted-foreground">
            Selecciona el modo de importación para restaurar tus registros:
          </p>

          <div class="space-y-2">
            <label class="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-surface-raised cursor-pointer">
              <input
                type="radio"
                name="importMode"
                value="merge"
                checked={importMode() === "merge"}
                onChange={() => setImportMode("merge")}
                class="accent-primary"
              />
              <div>
                <div class="text-xs font-bold text-foreground">
                  Combinar (Recomendado)
                </div>
                <div class="text-[11px] text-muted-foreground">
                  Agrega los artículos importados conservando los existentes
                </div>
              </div>
            </label>

            <label class="flex items-center gap-2.5 p-3 rounded-xl border border-destructive/30 bg-destructive/5 cursor-pointer">
              <input
                type="radio"
                name="importMode"
                value="replace"
                checked={importMode() === "replace"}
                onChange={() => setImportMode("replace")}
                class="accent-destructive"
              />
              <div>
                <div class="text-xs font-bold text-destructive">
                  Reemplazar Todo
                </div>
                <div class="text-[11px] text-muted-foreground">
                  Borra todos los registros actuales y restaura la copia
                </div>
              </div>
            </label>
          </div>

          <input
            type="file"
            accept=".json,application/json"
            ref={(el) => (fileInputRef = el)}
            onChange={handleFileSelected}
            class="hidden"
          />

          <div class="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setImportModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => fileInputRef?.click()}
              disabled={importing()}
            >
              <Upload size={16} />
              {importing() ? "Importando..." : "Seleccionar Archivo JSON"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
