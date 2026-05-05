// /api/index.js (або як Serverless Function)
export default async function handler(req, res) {
  // 1. Куди ми хочемо постукати (Твій HTTP сервер)
  // Важливо: без /wegasfinance/api, бо ми це додамо динамічно
  const TARGET_SERVER = "http://vsr1.nxtcloud.online:8080";

  // 2. Отримуємо шлях, який запитує фронтенд
  // Наприклад, якщо запит на /api/users, то path = /users
  const { path } = req.query;

  // Або просто беремо URL запиту і підміняємо домен
  const targetUrl = `${TARGET_SERVER}${req.url.replace("/api", "/wegasfinance/api")}`;

  try {
    // 3. Робимо запит від імені Vercel до твого сервера
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        ...req.headers,
        host: "vsr1.nxtcloud.online:8080", // Важливо підмінити хост
      },
      body:
        req.method !== "GET" && req.method !== "HEAD"
          ? JSON.stringify(req.body)
          : undefined,
    });

    // 4. Отримуємо відповідь
    const data = await response.text();

    // 5. Віддаємо відповідь браузеру
    res.status(response.status).send(data);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to connect to backend", details: error.message });
  }
}
