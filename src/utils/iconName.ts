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
  if (iconName in ICON_MAP) return iconName;
  // Старі версії зберігали lucide-іконки з зайвим префіксом (LuPawPrint →
  // HiLuPawPrint). Такі назви вже лежать у базі, тож відновлюємо їх.
  if (iconName.startsWith("HiLu") && iconName.slice(2) in ICON_MAP) return iconName.slice(2);
  if (iconName.startsWith("Hi")) return iconName;

  const pascal = iconName
    .replace(/[-_]([a-z])/g, (_, char: string) => char.toUpperCase())
    .replace(/^./, (char) => char.toUpperCase());
  return `Hi${pascal}`;
}
