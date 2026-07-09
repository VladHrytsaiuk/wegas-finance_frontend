type KeyboardLikeEvent = Pick<KeyboardEvent, "metaKey" | "altKey">;

type NavigatorWithUAData = Navigator & {
  userAgentData?: {
    platform?: string;
  };
};

export const isMac = () => {
  if (typeof window === "undefined") return false;
  const nav = navigator as NavigatorWithUAData;
  const platform = nav.userAgentData?.platform || nav.platform || "";
  return /Mac|iPhone|iPod|iPad/i.test(platform) || /Mac|iPhone|iPod|iPad/i.test(nav.userAgent);
};

export const isModifierPressed = (e: KeyboardLikeEvent) => {
  return isMac() ? e.metaKey : e.altKey;
};

export const getModifierLabel = () => (isMac() ? "⌘" : "Alt");

export const getShortcutLabel = (key: string) =>
  isMac() ? `${getModifierLabel()}${key}` : `${getModifierLabel()}+${key}`;
