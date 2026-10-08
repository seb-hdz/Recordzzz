import packageSvg from "@/assets/icons/package.svg";

interface ItemsEmptyStateProps {
  onRegister: () => void;
}

export default function ItemsEmptyState(props: ItemsEmptyStateProps) {
  return (
    <button
      type="button"
      onClick={() => props.onRegister()}
      class="flex w-full items-center gap-4 px-5 py-8 text-left hover:cursor-pointer"
    >
      <img src={packageSvg} alt="" class="size-16 shrink-0" />
      <span class="min-w-0">
        <span class="block font-ultra text-lg leading-tight tracking-[-2%] text-muted-foreground">
          No se han encontrado artículos
        </span>
        <span class="mt-1 block font-cutive text-base text-muted-foreground">
          ¡Registra uno nuevo!
        </span>
      </span>
    </button>
  );
}
