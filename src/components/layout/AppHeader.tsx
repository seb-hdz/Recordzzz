import { useNavigate, useLocation } from "@solidjs/router";
import { Show } from "solid-js";
import { ArrowLeft, Moon, Sun } from "lucide-solid";
import { useApp } from "@/application/context";

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
}

export function AppHeader(props: AppHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { themeService } = useApp();

  const isHome = () => location.pathname === "/" || location.pathname === "";

  return (
    <header class="fixed top-0 inset-x-0 z-40 h-14 safe-top glass-nav border-b border-border/60 transition-colors">
      <div class="max-w-2xl mx-auto h-full px-4 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <Show when={props.showBack || !isHome()}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              class="p-2 -ml-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface-raised transition-colors cursor-pointer"
              aria-label="Volver"
            >
              <ArrowLeft size={20} />
            </button>
          </Show>

          <Show
            when={!props.title}
            fallback={
              <h1 class="text-lg font-bold text-foreground tracking-tight">
                {props.title}
              </h1>
            }
          >
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black text-base shadow-sm">
                R
              </div>
              <span class="font-extrabold text-lg text-foreground tracking-tight">
                Record<span class="text-primary">zzz</span>
              </span>
            </div>
          </Show>
        </div>

        <div class="flex items-center gap-1.5">
          <button
            type="button"
            onClick={themeService.toggleTheme}
            class="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface-raised transition-colors cursor-pointer"
            aria-label="Cambiar tema"
            title={`Tema actual: ${themeService.theme()}`}
          >
            <Show
              when={themeService.theme() === "noom-dark"}
              fallback={<Moon size={18} />}
            >
              <Sun size={18} />
            </Show>
          </button>
        </div>
      </div>
    </header>
  );
}
