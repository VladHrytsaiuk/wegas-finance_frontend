interface CategoryLike {
  id: string;
  name: string;
  parent_id?: string | null;
}

/**
 * Назва категорії для показу. Однакові назви підкатегорій («Інше» є в кожній
 * групі) доповнюємо батьківською: «Продукти · Інше».
 */
export function categoryLabel(categories: CategoryLike[], id: string | null | undefined) {
  const category = categories.find((c) => c.id === id);
  if (!category) return undefined;
  const parent = category.parent_id ? categories.find((c) => c.id === category.parent_id) : undefined;
  const ambiguous = categories.some((c) => c.id !== category.id && c.name === category.name);
  return parent && ambiguous ? `${parent.name} · ${category.name}` : category.name;
}
