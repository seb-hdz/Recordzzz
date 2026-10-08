import aToZSvg from "@/assets/icons/filters/a-to-z.svg?raw";
import zToASvg from "@/assets/icons/filters/z-to-a.svg?raw";
import recentSvg from "@/assets/icons/filters/recent.svg?raw";
import oldestSvg from "@/assets/icons/filters/oldest.svg?raw";

export const SORT_OPTIONS = [
  { key: "a-to-z", label: "De la A a la Z", icon: aToZSvg },
  { key: "z-to-a", label: "De la Z a la A", icon: zToASvg },
  { key: "recent", label: "Más reciente", icon: recentSvg },
  { key: "oldest", label: "Más antiguo", icon: oldestSvg },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]["key"];

export function getSortOption(key: SortKey) {
  return SORT_OPTIONS.find((option) => option.key === key) ?? SORT_OPTIONS[0];
}
