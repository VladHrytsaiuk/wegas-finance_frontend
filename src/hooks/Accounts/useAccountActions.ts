import { useState, useMemo } from "react";

// Додав ключові слова, які зустрічаються в bank_name
const SUPPORTED_BANKS = ["privat", "monobank"];

interface Account {
  id: string;
  type: string;
  name: string;
  icon?: string;
  // Додаємо bank_name в інтерфейс, бо він є в JSON
  bank_name?: string;
}

export const useAccountActions = (account: Account) => {
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txType, setTxType] = useState<string>("expense");

  const handleOpenTransaction = (type: string) => {
    setTxType(type);
    setIsTxModalOpen(true);
  };

  const handleCloseTransaction = () => {
    setIsTxModalOpen(false);
  };

  const isImportSupported = useMemo(() => {
    // 1. Перевіряємо тип
    if (account?.type !== "card") return false;

    // 2. Збираємо дані для перевірки
    const name = account?.name?.toLowerCase() || "";
    const icon = account?.icon?.toLowerCase() || "";
    // 🔥 ГОЛОВНЕ ВИПРАВЛЕННЯ: читаємо bank_name з твого JSON
    const bankName = account?.bank_name?.toLowerCase() || "";

    // 3. Шукаємо збіг хоча б в одному полі
    return SUPPORTED_BANKS.some(
      (bank) =>
        name.includes(bank) || icon.includes(bank) || bankName.includes(bank),
    );
  }, [account]);

  return {
    state: {
      isTxModalOpen,
      txType,
      isImportSupported,
    },
    actions: {
      handleOpenTransaction,
      handleCloseTransaction,
    },
  };
};
