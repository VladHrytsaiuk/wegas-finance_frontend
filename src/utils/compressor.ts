import imageCompression from "browser-image-compression";

export const compressImage = async (file: File) => {
  const options = {
    maxSizeMB: 0.2, // Підняли ліміт до 200 КБ (фото більше не буде "задихатися")
    maxWidthOrHeight: 1600, // Збільшили роздільну здатність для чіткості
    useWebWorker: true,
    initialQuality: 0.8, // 80% якості
  };

  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.error("Помилка стиснення:", error);
    return file;
  }
};
