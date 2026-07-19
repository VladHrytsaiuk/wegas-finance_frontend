import axios from "./Axios";

export interface TelegramLinkStatus {
  is_linked: boolean;
  bot_username?: string;
  telegram_user_id?: number;
  telegram_chat_id?: number;
  telegram_username?: string;
  telegram_first_name?: string;
  linked_at?: number;
}

export interface TelegramLinkTokenResponse {
  token: string;
  deep_link: string;
  expires_at: number;
  bot_username: string;
}

export interface TelegramWebhookStatus {
  configured: boolean;
  webhook_url?: string;
  expected_webhook_url?: string;
  pending_update_count: number;
  last_error_date?: number;
  last_error_message?: string;
  ip_address?: string;
}

export const telegramReceiptsApi = {
  getLinkStatus: async () => {
    const { data } = await axios.get<TelegramLinkStatus>("/integrations/telegram");
    return data;
  },

  createLinkToken: async () => {
    const { data } = await axios.post<TelegramLinkTokenResponse>(
      "/integrations/telegram/link-token",
    );
    return data;
  },

  revokeLink: async () => {
    const { data } = await axios.delete("/integrations/telegram/link");
    return data;
  },

  getWebhookStatus: async () => {
    const { data } = await axios.get<TelegramWebhookStatus>(
      "/integrations/telegram/webhook",
    );
    return data;
  },

  syncWebhook: async () => {
    const { data } = await axios.post<TelegramWebhookStatus>(
      "/integrations/telegram/webhook/sync",
    );
    return data;
  },
};
