export const waitForNextPaint = async () => {
  await new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });
};
