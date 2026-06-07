export const isMac = () =>
  typeof window !== "undefined" &&
  /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);

export const isModifierPressed = (e: any) => {
  return isMac() ? e.metaKey : e.altKey;
};

export const getModifierLabel = () => (isMac() ? "⌘" : "Alt");

export const getShortcutLabel = (key: string) =>
  isMac() ? `${getModifierLabel()}${key}` : `${getModifierLabel()}+${key}`;
