import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

import { useSync } from "../../../context/SyncContext";
import { monobankApi } from "../../../services/apiMonobank";
import { telegramReceiptsApi } from "../../../services/apiTelegramReceipts";

// Стан інтеграцій: Monobank (підключено? синхронізація, відключення) і Telegram Receipts.

export function useIntegrations() {
  const queryClient = useQueryClient();
  const { statusData, startPolling, stopPolling } = useSync();
  const syncing = statusData.is_running;
  const [forceSyncing, setForceSyncing] = useState(false);
  const [waitingStart, setWaitingStart] = useState(false);

  // --- Monobank ---
  const mono = useQuery({
    queryKey: ["monobank-connected"],
    queryFn: async () => {
      try {
        await monobankApi.getSettings();
        return true;
      } catch (error) {
        // 404 — ще не підключено; інша помилка — вважаємо підключеним (як у старій сторінці)
        return !(axios.isAxiosError(error) && error.response?.status === 404);
      }
    },
    retry: false,
  });

  // Після завершення синхронізації статус міг змінитись
  const wasSyncing = useRef(syncing);
  useEffect(() => {
    if (wasSyncing.current && !syncing) {
      const timer = setTimeout(() => queryClient.invalidateQueries({ queryKey: ["monobank-connected"] }), 1000);
      wasSyncing.current = syncing;
      return () => clearTimeout(timer);
    }
    wasSyncing.current = syncing;
  }, [syncing, queryClient]);

  const disconnect = useMutation({
    mutationFn: monobankApi.disconnect,
    onSuccess: () => {
      toast.success("Monobank відключено");
      queryClient.setQueryData(["monobank-connected"], false);
    },
    onError: () => toast.error("Не вдалося відключити"),
  });

  const forceSync = async () => {
    if (syncing || forceSyncing) return;
    setForceSyncing(true);
    try {
      startPolling();
      await monobankApi.forceSync();
      toast.success("Оновлення даних запущено");
    } catch {
      toast.error("Не вдалося запустити синхронізацію");
      stopPolling();
    } finally {
      setForceSyncing(false);
    }
  };

  // --- Telegram Receipts ---
  const telegram = useQuery({
    queryKey: ["telegram-receipts-link-status"],
    queryFn: telegramReceiptsApi.getLinkStatus,
    refetchInterval: waitingStart ? 2000 : false,
  });
  const webhook = useQuery({
    queryKey: ["telegram-receipts-webhook-status"],
    queryFn: telegramReceiptsApi.getWebhookStatus,
  });

  const linked = telegram.data?.is_linked ?? false;
  useEffect(() => {
    if (linked && waitingStart) {
      // Користувач натиснув Start у боті
      queueMicrotask(() => setWaitingStart(false));
      toast.success("Telegram підключено. Можна надсилати XML або URL чеків.");
    }
  }, [linked, waitingStart]);

  const createLink = useMutation({
    mutationFn: telegramReceiptsApi.createLinkToken,
    onSuccess: async (data) => {
      setWaitingStart(true);
      try {
        await navigator.clipboard.writeText(data.deep_link);
        toast.success("Посилання скопійовано, відкриваємо Telegram");
      } catch {
        toast.success("Відкриваємо Telegram для підключення бота");
      }
      window.location.href = data.deep_link;
    },
    onError: () => {
      setWaitingStart(false);
      toast.error("Не вдалося створити посилання для підключення Telegram");
    },
  });

  const syncWebhook = useMutation({
    mutationFn: telegramReceiptsApi.syncWebhook,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["telegram-receipts-webhook-status"] });
      toast.success("Webhook Telegram оновлено");
    },
    onError: () => toast.error("Не вдалося оновити webhook Telegram"),
  });

  const revoke = useMutation({
    mutationFn: telegramReceiptsApi.revokeLink,
    onSuccess: async () => {
      setWaitingStart(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["telegram-receipts-link-status"] }),
        queryClient.invalidateQueries({ queryKey: ["telegram-receipts-webhook-status"] }),
      ]);
      toast.success("Telegram відв'язано");
    },
    onError: () => toast.error("Не вдалося відв'язати Telegram"),
  });

  const webhookConfigured = webhook.data?.configured ?? false;
  const connectTelegram = async () => {
    if (!webhookConfigured) {
      try {
        await syncWebhook.mutateAsync();
      } catch {
        // Режим polling: лінк усе одно створюємо
      }
    }
    try {
      await createLink.mutateAsync();
      void telegram.refetch();
    } catch {
      // Повідомлення про помилку вже показано в onError
    }
  };

  return {
    mono: {
      connected: mono.data ?? false,
      checking: mono.isLoading,
      syncing,
      forceSyncing,
      forceSync,
      disconnect,
    },
    telegram: {
      loading: telegram.isLoading || webhook.isLoading,
      linked,
      status: telegram.data,
      webhookConfigured,
      waitingStart,
      busy: createLink.isPending || revoke.isPending || syncWebhook.isPending || waitingStart,
      connect: connectTelegram,
      syncWebhook: () => syncWebhook.mutate(),
      revoke: () => revoke.mutate(),
    },
  };
}
