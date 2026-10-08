import { A, useLocation } from "@solidjs/router";
import { Home, Disc3, Plus, BarChart3, Settings } from "lucide-solid";
import { cn } from "@/lib/utils";

export function BottomNavigation() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/" || location.pathname === "";
    return location.pathname.startsWith(path);
  };

  return (
    <nav class="fixed bottom-0 inset-x-0 z-40 safe-bottom glass-nav border-t border-border/60 transition-colors">
      <div class="max-w-md mx-auto h-[4.25rem] px-3 flex items-center justify-around">
        {/* Inicio */}
        <A
          href="/"
          class={cn(
            "flex flex-col items-center justify-center flex-1 h-full py-1 gap-1 text-[11px] font-medium transition-colors",
            isActive("/")
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Home size={20} stroke-width={isActive("/") ? 2.5 : 2} />
          <span>Inicio</span>
        </A>

        {/* Colección */}
        <A
          href="/records"
          class={cn(
            "flex flex-col items-center justify-center flex-1 h-full py-1 gap-1 text-[11px] font-medium transition-colors",
            isActive("/records") && location.pathname !== "/records/new"
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Disc3
            size={20}
            stroke-width={
              isActive("/records") && location.pathname !== "/records/new" ? 2.5 : 2
            }
          />
          <span>Catálogo</span>
        </A>

        {/* FAB: Nuevo Registro */}
        <div class="flex items-center justify-center flex-1 -mt-4">
          <A
            href="/records/new"
            class={cn(
              "w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/25 hover:bg-primary-hover hover:scale-105 active:scale-95 transition-all",
              isActive("/records/new") && "ring-4 ring-primary/20 scale-105"
            )}
            aria-label="Nuevo registro"
          >
            <Plus size={24} stroke-width={2.5} />
          </A>
        </div>

        {/* Reportes */}
        <A
          href="/reports"
          class={cn(
            "flex flex-col items-center justify-center flex-1 h-full py-1 gap-1 text-[11px] font-medium transition-colors",
            isActive("/reports")
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <BarChart3 size={20} stroke-width={isActive("/reports") ? 2.5 : 2} />
          <span>Reportes</span>
        </A>

        {/* Ajustes */}
        <A
          href="/settings"
          class={cn(
            "flex flex-col items-center justify-center flex-1 h-full py-1 gap-1 text-[11px] font-medium transition-colors",
            isActive("/settings")
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Settings size={20} stroke-width={isActive("/settings") ? 2.5 : 2} />
          <span>Ajustes</span>
        </A>
      </div>
    </nav>
  );
}
