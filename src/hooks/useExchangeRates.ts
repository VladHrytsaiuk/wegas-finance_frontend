import { useQuery } from "@tanstack/react-query";
import { getExchangeRatesApi, type ExchangeRate } from "../services/apiRates";

const CACHE_KEY = "wegas_rates_cache";
const TWENTY_FOUR_HOURS = 1000 * 60 * 60 * 24;

export function useExchangeRates() {
  const { data, isLoading } = useQuery({
    queryKey: ["exchangeRates"],
    queryFn: async () => {
      // 1. Перевіряємо LocalStorage перед запитом
      const cached = localStorage.getItem(CACHE_KEY);

      if (cached) {
        try {
          const { rates, timestamp } = JSON.parse(cached);
          const now = Date.now();

          // 2. Якщо дані свіжі (менше 24 годин) — повертаємо їх і НЕ робимо запит
          if (now - timestamp < TWENTY_FOUR_HOURS) {
            // console.log("💰 Using cached rates from LocalStorage");
            return rates as ExchangeRate[];
          }
        } catch (e) {
          console.error("Error parsing cached rates", e);
          localStorage.removeItem(CACHE_KEY);
        }
      }

      // 3. Якщо кешу немає або він старий — робимо реальний запит
      // console.log("🔄 Fetching new rates from API...");
      const newRates = await getExchangeRatesApi();

      // 4. Зберігаємо нові дані в LocalStorage з часом
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          rates: newRates,
          timestamp: Date.now(),
        }),
      );

      return newRates;
    },
    // Налаштування React Query, щоб він не рефетчив дані всередині сесії
    staleTime: TWENTY_FOUR_HOURS, // Вважати дані свіжими 24 години
    gcTime: TWENTY_FOUR_HOURS, // Тримати в пам'яті (garbage collection)
    refetchOnWindowFocus: false, // Не оновлювати при перемиканні вкладок
    refetchOnMount: false, // Не оновлювати при повторному монтуванні компонента
    retry: false,
  });

  const usd = data?.find((r) => r.currency_code === "USD")?.rate;
  const eur = data?.find((r) => r.currency_code === "EUR")?.rate;

  return { usd, eur, isLoading };
}
