import { ICON_MAP } from "./IconConstants";

/**
 * Приводить збережену назву іконки до ключа ICON_MAP.
 * Відомі назви (HiHome, LuCat, ...) повертаються як є. Старі значення у
 * форматі "shopping-cart" / "home" перетворюються на "HiShoppingCart" / "HiHome".
 * Раніше префікс "Hi" додавався до всього, що не починалося з "Hi", через що
 * іконки lucide (LuCat → HiLuCat) відображались знаком питання.
 */
export function normalizeIconName(iconName: string | undefined | null): string | undefined;
export function normalizeIconName(iconName: string | undefined | null, fallback: string): string;
export function normalizeIconName(iconName: string | undefined | null, fallback?: string) {
  if (!iconName) return fallback;
  if (iconName in ICON_MAP || iconName.startsWith("Hi")) return iconName;

  const pascal = iconName
    .replace(/[-_]([a-z])/g, (_, char: string) => char.toUpperCase())
    .replace(/^./, (char) => char.toUpperCase());
  return `Hi${pascal}`;
}
