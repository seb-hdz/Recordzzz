import { A } from "@solidjs/router";
import { Disc3, ArrowLeft } from "lucide-solid";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div class="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div class="w-16 h-16 rounded-2xl bg-surface-raised border border-border flex items-center justify-center text-muted-foreground mb-4">
        <Disc3 size={36} />
      </div>
      <h2 class="text-2xl font-bold tracking-tight text-foreground mb-2">
        Página no encontrada
      </h2>
      <p class="text-sm text-muted-foreground mb-6 max-w-xs">
        La ruta a la que intentas acceder no existe o fue movida.
      </p>
      <A href="/">
        <Button variant="primary">
          <ArrowLeft size={16} />
          Volver al Inicio
        </Button>
      </A>
    </div>
  );
}
