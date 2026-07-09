import { useState } from "react";
import api from "../services/Axios";
import { toast } from "react-hot-toast";

// === ТИПИ ===
interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
}

interface Counterparty {
  id: string;
  name: string;
  type: "shop" | "person" | "other";
}

interface Account {
  id: string;
  currency: string;
}

interface SeedTransactionItem {
  name: string;
  quantity: number;
  price_per_unit: number;
  total_amount: number;
}

interface SeedTransactionPayload {
  amount: number;
  date: number;
  note: string;
  type: "income" | "expense";
  account_id: string;
  category_id: string;
  counterparty_id: string | null;
  items: SeedTransactionItem[];
}

// === ОНОВЛЕНІ ПРОДУКТИ (Ціни в копійках, 100 = 1 грн) ===
const GROCERY_ITEMS = [
  { name: "Молоко 2.5%", priceMin: 3900, priceMax: 4600 },
  { name: "Хліб крафтовий", priceMin: 3500, priceMax: 6000 },
  { name: "Яйця (10 шт)", priceMin: 6000, priceMax: 8000 },
  { name: "Масло вершкове", priceMin: 7500, priceMax: 11000 },
  { name: "Вода 6л", priceMin: 4500, priceMax: 6000 },
  { name: "Банани (кг)", priceMin: 5500, priceMax: 7000 },
  { name: "Філе куряче (кг)", priceMin: 16000, priceMax: 22000 },
  { name: "Стейк яловичий", priceMin: 35000, priceMax: 60000 }, // Дорогий товар
  { name: "Сир твердий (кг)", priceMin: 25000, priceMax: 40000 },
  { name: "Кава зернова (1кг)", priceMin: 50000, priceMax: 90000 }, // Дорогий товар
  { name: "Віскі 0.7", priceMin: 60000, priceMax: 120000 }, // Алкоголь піднімає чек
  { name: "Порошок пральний", priceMin: 25000, priceMax: 45000 }, // Побутова хімія
  { name: "Авокадо (шт)", priceMin: 4000, priceMax: 8000 },
];

const FUEL_ITEMS = [
  { name: "Бензин A-95 (літр)", priceMin: 5600, priceMax: 6100 },
  { name: "Дизель (літр)", priceMin: 5200, priceMax: 5700 },
  { name: "Хот-дог подвійний", priceMin: 11000, priceMax: 14000 },
  { name: "Кава Лате", priceMin: 6000, priceMax: 9000 },
  { name: "Омивач скла", priceMin: 15000, priceMax: 25000 },
];

const PHARMACY_ITEMS = [
  { name: "Нурофен Форте", priceMin: 18000, priceMax: 25000 },
  { name: "Вітамінний комплекс", priceMin: 35000, priceMax: 60000 },
  { name: "Спрей для носа", priceMin: 12000, priceMax: 18000 },
  { name: "Антибіотик", priceMin: 25000, priceMax: 45000 },
];

export const useSeedData = () => {
  const [isSeeding, setIsSeeding] = useState(false);

  // Helper: Random Int
  const rand = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  // Helper: Random Array Element
  const randArr = <T>(arr: T[]): T =>
    arr[Math.floor(Math.random() * arr.length)];

  // Helper: Get random date within specific month offset (0 = current, 1 = last month)
  const getDateInMonth = (monthOffset: number) => {
    const date = new Date();
    date.setMonth(date.getMonth() - monthOffset);
    // Випадковий день від 1 до 28
    date.setDate(rand(1, 28));
    return date.getTime();
  };

  const seed = async () => {
    if (
      !window.confirm(
        "Це створить реалістичні тестові дані за 3 місяці. Продовжити?"
      )
    )
      return;

    setIsSeeding(true);
    const loadingToast = toast.loading("Генеруємо фінанси...");

    try {
      // 1. ОТРИМАННЯ ДОВІДНИКІВ
      const [catsRes, cpsRes] = await Promise.all([
        api.get("/categories"),
        api.get("/counterparties"),
      ]);

      const categories: Category[] = catsRes.data;
      const counterparties: Counterparty[] = cpsRes.data;

      const expenseCats = categories.filter((c) => c.type === "expense");
      const incomeCats = categories.filter((c) => c.type === "income");

      if (expenseCats.length === 0) throw new Error("Немає категорій витрат!");

      // 2. СТВОРЕННЯ/ОТРИМАННЯ РАХУНКІВ
      // (Тут можна спростити: якщо рахунки є - використовуємо їх, ні - створюємо)
      let accounts: Account[] = [];
      try {
        const accRes = await api.get("/accounts");
        if (accRes.data.length > 0) {
          accounts = accRes.data.map((a: Account) => ({
            id: a.id,
            currency: a.currency,
          }));
        }
      } catch {
        console.log("No accounts found, creating...");
      }

      if (accounts.length === 0) {
        const accountsToCreate = [
          {
            name: "Monobank Black",
            type: "card",
            currency: "UAH",
            initial_balance: 1500000, // 15 000 грн старту
            balance: 1500000,
            color: "#000000",
            icon: "HiCreditCard",
          },
          {
            name: "Готівка",
            type: "cash",
            currency: "UAH",
            initial_balance: 200000, // 2 000 грн
            balance: 200000,
            color: "#10b981",
            icon: "HiBanknotes",
          },
        ];
        for (const accData of accountsToCreate) {
          const res = await api.post("/accounts", accData);
          accounts.push({ id: res.data.id, currency: res.data.currency });
        }
      }

      // 3. ГЕНЕРАЦІЯ ТРАНЗАКЦІЙ
      // Стратегія: Проходимо по 3 місяцях (0, 1, 2 місяці тому)
      const txDataPayloads: SeedTransactionPayload[] = [];
      const salaryCat =
        incomeCats.find((c) => c.name.toLowerCase().includes("зарплата")) ||
        incomeCats[0];
      const rentCat = expenseCats.find((c) =>
        ["оренда", "квартира", "комунал"].some((k) =>
          c.name.toLowerCase().includes(k)
        )
      );

      for (let month = 0; month < 3; month++) {
        // --- А. ЗАРПЛАТА (1 раз на місяць) ---
        if (salaryCat) {
          // Зарплата 35к - 55к грн
          const salaryAmount = rand(3500000, 5500000);
          txDataPayloads.push({
            amount: salaryAmount,
            date: getDateInMonth(month), // Якесь число місяця
            note: "Заробітна плата",
            type: "income",
            account_id: accounts[0].id, // Зазвичай на картку
            category_id: salaryCat.id,
            counterparty_id: null,
            items: [],
          });
        }

        // --- Б. ОРЕНДА/КОМУНАЛКА (1 раз на місяць) ---
        if (rentCat) {
          // Оренда 10к - 15к грн
          const rentAmount = rand(1000000, 1500000);
          txDataPayloads.push({
            amount: rentAmount,
            date: getDateInMonth(month),
            note: "Оренда квартири + комунальні",
            type: "expense",
            account_id: accounts[0].id,
            category_id: rentCat.id,
            counterparty_id: null,
            items: [],
          });
        }

        // --- В. ЩОДЕННІ ВИТРАТИ (20-30 транзакцій на місяць) ---
        const dailyTxCount = rand(20, 30);
        for (let i = 0; i < dailyTxCount; i++) {
          const account = randArr(accounts);
          // Вибираємо категорію (окрім оренди, бо вона вже була)
          const category = randArr(
            expenseCats.filter((c) => c.id !== rentCat?.id)
          );

          const items: SeedTransactionItem[] = [];
          let totalAmount = 0;
          let selectedCounterpartyId: string | null = null;
          let possibleCPs: Counterparty[] = [];
          let possibleItems: Array<{
            name: string;
            priceMin: number;
            priceMax: number;
          }> = [];

          const catNameLower = category.name.toLowerCase();

          // 1. Продукти
          if (
            catNameLower.includes("харчування") ||
            catNameLower.includes("супермаркет")
          ) {
            possibleItems = GROCERY_ITEMS;
            possibleCPs = counterparties.filter((c) =>
              ["сільпо", "атб", "novus", "ашан"].some((n) =>
                c.name.toLowerCase().includes(n)
              )
            );
            // Робимо "велику закупку"
            const itemsCount = rand(5, 12); // Більше товарів
            for (let j = 0; j < itemsCount; j++) {
              const prod = randArr(possibleItems);
              const qty = rand(1, 4);
              const price =
                prod.priceMin + rand(0, prod.priceMax - prod.priceMin);
              const rowTotal = price * qty;
              items.push({
                name: prod.name,
                quantity: qty,
                price_per_unit: price,
                total_amount: rowTotal,
              });
              totalAmount += rowTotal;
            }
          }
          // 2. Авто
          else if (
            catNameLower.includes("авто") ||
            catNameLower.includes("транспорт")
          ) {
            possibleItems = FUEL_ITEMS;
            possibleCPs = counterparties.filter((c) =>
              ["okko", "wog", "upg"].some((n) =>
                c.name.toLowerCase().includes(n)
              )
            );
            // Зазвичай заправляють повний бак (30-50л) або просто кава
            if (Math.random() > 0.3) {
              // Заправка
              const fuel =
                possibleItems.find(
                  (x) => x.name.includes("Бензин") || x.name.includes("Дизель")
                ) || possibleItems[0];
              const liters = rand(20, 50);
              const price = fuel.priceMin + rand(0, 100);
              const rowTotal = price * liters;
              items.push({
                name: fuel.name,
                quantity: liters,
                price_per_unit: price,
                total_amount: rowTotal,
              });
              totalAmount += rowTotal;
            } else {
              // Кава на заправці
              const coffee =
                possibleItems.find((x) => x.name.includes("Кава")) ||
                possibleItems[3];
              totalAmount = coffee.priceMin + rand(0, 1000);
            }
          }
          // 3. Інше (без чека, просто сума)
          else {
            // Кафе, розваги, аптека (дрібні)
            // Ціна від 200 до 1500 грн
            totalAmount = rand(20000, 150000);
            // Якщо є категорія аптека - можемо взяти товари
            if (
              catNameLower.includes("здоров") ||
              catNameLower.includes("аптека")
            ) {
              // Логіка як для продуктів, але менше товарів
              possibleItems = PHARMACY_ITEMS;
              possibleCPs = counterparties.filter(
                (c) =>
                  c.name.toLowerCase().includes("аптека") ||
                  c.name.toLowerCase().includes("анц")
              );
              const itemsCount = rand(1, 3);
              for (let j = 0; j < itemsCount; j++) {
                const prod = randArr(possibleItems);
                const qty = rand(1, 2);
                const price =
                  prod.priceMin + rand(0, prod.priceMax - prod.priceMin);
                const rowTotal = price * qty;
                items.push({
                  name: prod.name,
                  quantity: qty,
                  price_per_unit: price,
                  total_amount: rowTotal,
                });
                totalAmount += rowTotal;
              }
            }
          }

          // Вибір контрагента
          if (possibleCPs.length > 0) {
            selectedCounterpartyId = randArr(possibleCPs).id;
          } else {
            const shops = counterparties.filter((c) => c.type === "shop");
            if (shops.length > 0) selectedCounterpartyId = randArr(shops).id;
          }

          txDataPayloads.push({
            amount: totalAmount,
            date: getDateInMonth(month),
            note: items.length > 0 ? "Покупка товарів" : "Витрата",
            type: "expense",
            account_id: account.id,
            category_id: category.id,
            counterparty_id: selectedCounterpartyId,
            items,
          });
        }
      }

      // Відправка транзакцій (бажано пачками або Promise.all, але обережно з навантаженням)
      // Розбиваємо на чанки по 10, щоб не вбити бекенд
      const chunkSize = 10;
      for (let i = 0; i < txDataPayloads.length; i += chunkSize) {
        const chunk = txDataPayloads.slice(i, i + chunkSize);
        await Promise.all(chunk.map((data) => api.post("/transactions", data)));
      }

      toast.dismiss(loadingToast);
      toast.success(
        `Згенеровано ${txDataPayloads.length} реалістичних транзакцій!`
      );

      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error(error);
      toast.dismiss(loadingToast);
      toast.error("Помилка при генерації");
    } finally {
      setIsSeeding(false);
    }
  };

  return { seed, isSeeding };
};
