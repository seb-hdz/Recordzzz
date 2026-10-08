import { BottomSheet } from "@/components/ui/BottomSheet";

export interface ConfirmDeleteSheetProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  confirming?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmDeleteSheet(props: ConfirmDeleteSheetProps) {
  return (
    <BottomSheet open={props.open} onClose={props.onCancel} title={props.title}>
      <p class="px-6 font-cutive text-base leading-6 text-muted-foreground">
        {props.message}
      </p>
      <div class="flex flex-row items-center justify-end gap-3 px-6 pb-8 pt-6">
        <button
          type="button"
          class="rounded-full px-5 py-3 font-ultra text-lg text-muted-foreground"
          onClick={() => props.onCancel()}
          disabled={props.confirming}
        >
          Cancelar
        </button>
        <button
          type="button"
          class="rounded-full bg-destructive px-5 py-3 font-ultra text-lg text-white disabled:opacity-40"
          onClick={() => props.onConfirm()}
          disabled={props.confirming}
        >
          {props.confirmLabel ?? "Eliminar"}
        </button>
      </div>
    </BottomSheet>
  );
}
