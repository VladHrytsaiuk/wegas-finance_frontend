import { useState, useEffect, useRef } from "react";
import axios from "../../services/Axios"; // Перевір шлях до axios instance

interface SyncStatus {
  is_running: boolean;
  message: string;
  total_imported: number;
}

export function useMonobankSync() {
  const [status, setStatus] = useState<SyncStatus>({
    is_running: false,
    message: "",
    total_imported: 0,
  });

  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const intervalRef = useRef<number | null>(null);

  const checkStatus = async () => {
    try {
      const { data } = await axios.get<SyncStatus>("/monobank/status");
      setStatus(data);

      if (data.is_running) {
        setIsVisible(true);
      } else if (isVisible && !data.is_running) {
        // Якщо тільки що закінчили - чекаємо 4 сек і ховаємо
        setTimeout(() => setIsVisible(false), 4000);
      }
    } catch (error) {
      // Тиша в консолі, щоб не спамити помилками якщо бек лежить
    }
  };

  useEffect(() => {
    checkStatus();
    intervalRef.current = window.setInterval(checkStatus, 2000); // Опитування кожні 2 сек

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []); // eslint-disable-line

  return {
    status,
    isVisible,
    isMinimized,
    toggleMinimize: () => setIsMinimized((prev) => !prev),
  };
}
