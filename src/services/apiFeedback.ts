import api from "./Axios";

export const sendFeedback = async (data) => {
  // data тепер приходить як об'єкт FormData
  return api.post("/feedback", data, {
    headers: {
      // Явно вказуємо multipart/form-data.
      // Сучасний Axios зрозуміє це і дозволить браузеру додати необхідний "boundary" параметр.
      "Content-Type": "multipart/form-data",
    },
  });
};
