import {
  For,
  onCleanup,
  onMount,
  type Accessor,
} from "solid-js";
import OptionTile from "./OptionTile";
import { STEP5_OPTIONS, type Step5OptionId } from "./options";
import { cn } from "@/lib/utils";

export interface OptionsCarouselProps {
  activeOption: Accessor<Step5OptionId>;
  onActiveChange: (id: Step5OptionId) => void;
  badgeCounts: Accessor<Record<Step5OptionId, number>>;
}

/** Fixed snap slot = active tile size (5rem). Edge pad matches pl-4. */
const SLOT_PX = 80;
const EDGE_PAD = 16;

export default function OptionsCarousel(props: OptionsCarouselProps) {
  let scrollRef: HTMLDivElement | undefined;
  const itemRefs = new Map<Step5OptionId, HTMLDivElement>();
  let scrollEndTimer: ReturnType<typeof setTimeout> | undefined;

  const scrollToOption = (
    id: Step5OptionId,
    behavior: ScrollBehavior = "smooth"
  ) => {
    const el = itemRefs.get(id);
    if (!el || !scrollRef) return;
    const left = el.offsetLeft - EDGE_PAD;
    scrollRef.scrollTo({ left: Math.max(0, left), behavior });
  };

  const updateActiveFromScroll = () => {
    if (!scrollRef) return;
    const target = scrollRef.scrollLeft + EDGE_PAD;
    let closestId: Step5OptionId = props.activeOption();
    let closestDist = Infinity;

    for (const option of STEP5_OPTIONS) {
      const el = itemRefs.get(option.id);
      if (!el) continue;
      const dist = Math.abs(el.offsetLeft - target);
      if (dist < closestDist) {
        closestDist = dist;
        closestId = option.id;
      }
    }

    if (closestId !== props.activeOption()) {
      props.onActiveChange(closestId);
    }
  };

  const handleScroll = () => {
    if (scrollEndTimer) clearTimeout(scrollEndTimer);
    scrollEndTimer = setTimeout(updateActiveFromScroll, 80);
  };

  const handleTileSelect = (id: Step5OptionId) => {
    props.onActiveChange(id);
    scrollToOption(id);
  };

  onMount(() => {
    requestAnimationFrame(() => scrollToOption(props.activeOption(), "auto"));

    const el = scrollRef;
    if (!el) return;

    el.addEventListener("scroll", handleScroll, { passive: true });
    el.addEventListener("scrollend", updateActiveFromScroll, { passive: true });

    onCleanup(() => {
      el.removeEventListener("scroll", handleScroll);
      el.removeEventListener("scrollend", updateActiveFromScroll);
      if (scrollEndTimer) clearTimeout(scrollEndTimer);
    });
  });

  return (
    <div
      ref={scrollRef}
      class="w-full overflow-x-auto snap-x snap-mandatory py-4 touch-pan-x overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ "-webkit-overflow-scrolling": "touch" }}
    >
      <div
        class="flex flex-row items-center gap-4 pl-4"
        style={{ "padding-right": `calc(100% - ${SLOT_PX}px - ${EDGE_PAD}px)` }}
      >
        <For each={STEP5_OPTIONS}>
          {(option) => {
            const isActive = () => props.activeOption() === option.id;
            return (
              <div
                ref={(el) => itemRefs.set(option.id, el)}
                class={cn(
                  "snap-start shrink-0 flex items-center justify-center size-20 transition-transform duration-300 origin-center hover:cursor-pointer",
                  isActive() ? "scale-100" : "scale-[0.72]"
                )}
                onClick={() => handleTileSelect(option.id)}
              >
                <OptionTile
                  icon={option.icon}
                  active={isActive()}
                  badgeCount={
                    option.id === "done"
                      ? undefined
                      : props.badgeCounts()[option.id]
                  }
                />
              </div>
            );
          }}
        </For>
      </div>
    </div>
  );
}
