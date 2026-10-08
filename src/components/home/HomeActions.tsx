import ImportSvg from "@/assets/icons/import.svg?raw";
import CatalogueSvg from "@/assets/icons/catalogue.svg?raw";
import ItemSvg from "@/assets/icons/package.svg?raw";
import { For } from "solid-js";
import { A } from "@solidjs/router";
import { cn } from "@/lib/utils";

export const HOME_ACTIONS = {
  item: {
    title: "Nuevo artículo",
    icon: ItemSvg,
    class: "bg-ring",
    textClass: "text-muted-foreground text-lg",
    href: "/items/new-item",
  },
  import: {
    title: "Nueva importación",
    icon: ImportSvg,
    class: "bg-muted-foreground",
    textClass: "text-primary-foreground text-lg",
    href: "/waves/new-wave",
  },
  catalogue: {
    title: "Ver Catálogo",
    icon: CatalogueSvg,
    class: "bg-primary",
    textClass: "text-primary-foreground text-lg",
    href: "/items",
  },
} as const;

export default function HomeActions() {
  return (
    <section class="flex w-full shrink-0 flex-col items-center">
      <h1 class="mb-3 font-ultra text-[1.725rem] text-white">
        ¿Qué quieres hacer?
      </h1>
      <div class="flex flex-col rounded-3xl overflow-hidden question-shadow w-full">
        <For each={Object.values(HOME_ACTIONS)}>
          {(action) => (
            <A
              href={action.href}
              class={cn(
                "flex flex-row items-center justify-start p-4 gap-4 px-5 py-2",
                action.class
              )}
            >
              <div class="w-16 h-16 bg-white flex items-center justify-center rounded-lg">
                <div innerHTML={action.icon} />
              </div>
              <h2 class={cn("text-2xl font-cutive pt-1.5", action.textClass)}>
                {action.title.split(" ").map((word) => (
                  <>
                    <span>{word}</span>
                    <br />
                  </>
                ))}
              </h2>
            </A>
          )}
        </For>
      </div>
    </section>
  );
}
