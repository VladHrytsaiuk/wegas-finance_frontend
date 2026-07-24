import imageCompression from "browser-image-compression";

export const compressImage = async (file: File) => {
  const options = {
    maxSizeMB: 0.2, // Підняли ліміт до 200 КБ (фото більше не буде "задихатися")
    maxWidthOrHeight: 1600, // Збільшили роздільну здатність для чіткості
    // Web Worker occasionally never resolves in iOS/PWA contexts.
    useWebWorker: false,
    initialQuality: 0.8, // 80% якості
  };

  try {
    const compression = imageCompression(file, options);
    const timeout = new Promise<File>((resolve) => {
      window.setTimeout(() => resolve(file), 15_000);
    });

    return await Promise.race([compression, timeout]);
  } catch (error) {
    console.error("Помилка стиснення:", error);
    return file;
  }
};
