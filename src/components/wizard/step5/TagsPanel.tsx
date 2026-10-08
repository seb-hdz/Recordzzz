import {
  createSignal,
  For,
  Show,
  type Accessor,
} from "solid-js";
import Button from "@/components/global/button";
import PanelHeader from "./PanelHeader";
import { getOptionById, MAX_TAGS } from "./options";
import { cn } from "@/lib/utils";

export interface TagsPanelProps {
  tags: Accessor<string[]>;
  onTagsChange: (tags: string[]) => void;
  onContinue: () => void;
}

export default function TagsPanel(props: TagsPanelProps) {
  const option = getOptionById("tags");
  const [draft, setDraft] = createSignal("");
  const [focused, setFocused] = createSignal(false);
  const [areaBounce, setAreaBounce] = createSignal(false);
  const [bouncingTag, setBouncingTag] = createSignal<string | null>(null);

  const canAdd = () => props.tags().length < MAX_TAGS;

  const triggerAreaBounce = () => {
    setAreaBounce(false);
    requestAnimationFrame(() => setAreaBounce(true));
  };

  const commitTag = (raw: string) => {
    const val = raw.trim().replace(/,$/, "");
    if (!val || !canAdd()) {
      setDraft("");
      return;
    }
    const exists = props.tags().some(
      (t) => t.toLowerCase() === val.toLowerCase()
    );
    if (!exists) {
      props.onTagsChange([...props.tags(), val]);
      setBouncingTag(val);
    }
    setDraft("");
  };

  const removeTag = (tag: string) => {
    props.onTagsChange(props.tags().filter((t) => t !== tag));
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      commitTag(draft());
    } else if (e.key === "Backspace" && !draft() && props.tags().length > 0) {
      const last = props.tags()[props.tags().length - 1];
      removeTag(last);
    }
  };

  const handleInput = (value: string) => {
    if (/[,\s]$/.test(value)) {
      commitTag(value.slice(0, -1));
      return;
    }
    setDraft(value);
  };

  return (
    <section class="flex flex-col mt-6">
      <PanelHeader
        title={option.title}
        description={option.description}
        icon={option.icon}
        badgeCount={props.tags().length}
      />

      <div
        class={cn(
          "mt-8 mx-4 min-h-36 bg-surface rounded-3xl question-shadow p-4",
          "flex flex-wrap content-start gap-2 items-center",
          areaBounce() && "animate-touch-scale"
        )}
        onAnimationEnd={(event) => {
          if (event.animationName === "touch-scale") setAreaBounce(false);
        }}
        onClick={(e) => {
          const input = (e.currentTarget as HTMLElement).querySelector("input");
          input?.focus();
        }}
      >
        <For each={props.tags()}>
          {(tag) => (
            <button
              type="button"
              class={cn(
                "inline-flex items-center gap-1.5 rounded-full bg-ring px-3 py-1.5 hover:cursor-pointer",
                bouncingTag() === tag && "animate-touch-scale"
              )}
              onAnimationEnd={(event) => {
                if (
                  event.animationName === "touch-scale" &&
                  bouncingTag() === tag
                ) {
                  setBouncingTag(null);
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
            >
              <span class="font-cutive text-xl text-muted-foreground">{tag}</span>
            </button>
          )}
        </For>
        <Show when={canAdd()}>
          <input
            type="text"
            value={draft()}
            onInput={(e) => handleInput(e.currentTarget.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (!focused()) {
                setFocused(true);
                triggerAreaBounce();
              }
            }}
            onBlur={() => {
              setFocused(false);
              if (draft().trim()) commitTag(draft());
            }}
            placeholder={
              props.tags().length === 0 ? "Ejm. disco, vinilo, etc" : ""
            }
            class="flex-1 min-w-24 bg-transparent outline-none font-cutive text-xl text-foreground placeholder:text-muted-foreground/50"
          />
        </Show>
      </div>

      <hr class="border-secondary mt-10 mx-4" />
      <Button
        text="Continuar"
        onClick={props.onContinue}
        customClass="question-shadow mt-4 mx-4"
      />
    </section>
  );
}
