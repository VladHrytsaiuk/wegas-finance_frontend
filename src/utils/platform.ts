export const isMac = () => {
  if (typeof window === "undefined") return false;
  // @ts-ignore
  const platform = navigator.userAgentData?.platform || navigator.platform || "";
  return /Mac|iPhone|iPod|iPad/i.test(platform) || /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent);
};

export const isModifierPressed = (e: any) => {
  return isMac() ? e.metaKey : e.altKey;
};

export const getModifierLabel = () => (isMac() ? "⌘" : "Alt");

export const getShortcutLabel = (key: string) =>
  isMac() ? `${getModifierLabel()}${key}` : `${getModifierLabel()}+${key}`;
