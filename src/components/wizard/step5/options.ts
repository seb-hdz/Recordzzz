import CheckSvg from "@/assets/icons/register-steps/check.svg?raw";
import AddImageSvg from "@/assets/icons/register-steps/add-image.svg?raw";
import TagsSvg from "@/assets/icons/register-steps/tags.svg?raw";
import BarcodeSvg from "@/assets/icons/register-steps/barcode.svg?raw";

export type Step5Panel = "images" | "tags" | "barcodes";
export type Step5OptionId = "done" | Step5Panel;

export interface Step5OptionConfig {
  id: Step5OptionId;
  icon: string;
  title: string;
  description: string;
  panel: Step5Panel | null;
  ctaLabel: string;
  maxCount?: number;
}

export const STEP5_OPTIONS: Step5OptionConfig[] = [
  {
    id: "done",
    icon: CheckSvg,
    title: "¿Guardar y finalizar?",
    description:
      "Podrás revisar, agregar y modificar la información del artículo después",
    panel: null,
    ctaLabel: "Finalizar",
  },
  {
    id: "images",
    icon: AddImageSvg,
    title: "¿Cómo se ve el artículo?",
    description: "Agrega hasta 20 imágenes del artículo",
    panel: "images",
    ctaLabel: "Continuar",
    maxCount: 20,
  },
  {
    id: "tags",
    icon: TagsSvg,
    title: "¿El artículo tiene etiquetas?",
    description: "Agrega hasta 50 etiquetas al artículo",
    panel: "tags",
    ctaLabel: "Continuar",
    maxCount: 50,
  },
  {
    id: "barcodes",
    icon: BarcodeSvg,
    title: "¿Hay códigos de barras o identificadores?",
    description: "Agrega hasta 20 identificadores del artículo",
    panel: "barcodes",
    ctaLabel: "Continuar",
    maxCount: 20,
  },
];

export function getOptionById(id: Step5OptionId): Step5OptionConfig {
  return STEP5_OPTIONS.find((o) => o.id === id)!;
}

export const MAX_IMAGES = 20;
export const MAX_TAGS = 50;
export const MAX_BARCODES = 20;
