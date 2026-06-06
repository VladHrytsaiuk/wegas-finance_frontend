export const isMac =
  typeof window !== "undefined" &&
  /Mac|iPod|iPhone|iPad/.test(window.navigator.platform);

export const getModKey = () => (isMac ? "Cmd" : "Ctrl");
export const getModKeySymbol = () => (isMac ? "⌘" : "Ctrl");

/**
 * Checks if the Command key (on Mac) or Control key (on Windows/Linux) is pressed.
 */
export const isModKeyPressed = (e: KeyboardEvent | React.KeyboardEvent) => {
  return isMac ? e.metaKey : e.ctrlKey;
};
