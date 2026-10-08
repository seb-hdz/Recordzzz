import type { Accessor } from "solid-js";

export interface BarcodeManualInputProps {
  value: Accessor<string>;
  onValueChange: (value: string) => void;
  onSubmit: (code: string) => void;
  onBack: () => void;
}

export default function BarcodeManualInput(props: BarcodeManualInputProps) {
  const submit = () => {
    const code = props.value().trim();
    if (!code) return false;
    props.onSubmit(code);
    props.onValueChange("");
    return true;
  };

  return (
    <div class="flex flex-row items-center gap-3 px-4 mt-8 min-w-0 w-full">
      <button
        type="button"
        class="size-14 rounded-full bg-primary question-shadow flex items-center justify-center hover:cursor-pointer shrink-0 text-primary-foreground"
        onClick={props.onBack}
        aria-label="Volver"
      >
        <span class="font-ultra text-2xl leading-none rotate-180 inline-block">
          →
        </span>
      </button>
      <input
        type="text"
        inputMode="numeric"
        value={props.value()}
        onInput={(e) => props.onValueChange(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submit();
          }
        }}
        placeholder="00000000000"
        class="min-w-0 flex-1 w-full bg-surface rounded-full question-shadow px-6 py-4 font-ultra text-2xl text-muted-foreground placeholder:text-muted-foreground/40 outline-none"
        autofocus
      />
    </div>
  );
}
