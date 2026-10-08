import boxsetSvg from "@/assets/icons/register-steps/item-types/type-boxset.svg?raw";
import cdSvg from "@/assets/icons/register-steps/item-types/type-cd.svg?raw";
import otherSvg from "@/assets/icons/register-steps/item-types/type-other.svg?raw";
import vinylSvg from "@/assets/icons/register-steps/item-types/type-vinyl.svg?raw";
import circleSvg from "@/assets/icons/register-steps/item-types/type-circle.svg?raw";

import boxsetSelectedSvg from "@/assets/icons/register-steps/item-types/selected/type-selected-boxset.svg?raw";
import cdSelectedSvg from "@/assets/icons/register-steps/item-types/selected/type-selected-cd.svg?raw";
import otherSelectedSvg from "@/assets/icons/register-steps/item-types/selected/type-selected-other.svg?raw";
import vinylSelectedSvg from "@/assets/icons/register-steps/item-types/selected/type-selected-vinyl.svg?raw";
import multiSvg from "@/assets/icons/register-steps/item-types/selected/type-selected-multi.svg?raw";

export const ITEM_TYPES = {
  vinyl: {
    icon: vinylSvg,
    selectedIcon: vinylSelectedSvg,
    text: "Vinilo",
  },
  cd: {
    icon: cdSvg,
    selectedIcon: cdSelectedSvg,
    text: "CD",
  },
  boxset: {
    icon: boxsetSvg,
    selectedIcon: boxsetSelectedSvg.trim() ? boxsetSelectedSvg : boxsetSvg,
    text: "Boxset",
  },
  other: {
    icon: otherSvg,
    selectedIcon: otherSelectedSvg,
    text: "Otro",
  },
} as const;

export type ItemTypeKey = keyof typeof ITEM_TYPES;

export { circleSvg, multiSvg };
