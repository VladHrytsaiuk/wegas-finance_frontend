import { useState } from "react";
import { HiOutlinePaperAirplane } from "react-icons/hi2";

import { usePageTitle } from "../../../hooks/usePageTitle";
import { ConfirmSheet } from "../../../mobile/ui/ConfirmSheet";
import { Footnote } from "../../../mobile/ui/Field";
import { Group, Meta, Row, Section } from "../../../mobile/ui/Group";
import { Tile } from "../../../mobile/ui/Tile";
import { MonobankSheet } from "./MonobankSheet";
import { SettingsScreen } from "./SettingsScreen";
import { useIntegrations } from "./useIntegrations";

// Інтеграції: Monobank (автоімпорт операцій) і Telegram Receipts (чеки через бота).

export default function MobileIntegrations() {
  usePageTitle("Інтеграції");
  const { mono, telegram } = useIntegrations();
  const [monoOpen, setMonoOpen] = useState(false);
  const [confirmMono, setConfirmMono] = useState(false);
  const [confirmTg, setConfirmTg] = useState(false);

  const monoStatus = mono.syncing ? "Синхронізація…" : mono.checking ? "" : mono.connected ? "Підключено" : "Не підключено";
  const tgStatus = telegram.waitingStart ? "Очікуємо Start…" : telegram.loading ? "" : telegram.linked ? "Підключено" : "Не підключено";
  const bot = telegram.status?.bot_username;

  return (
    <SettingsScreen title="Інтеграції">
      <Section caption="Monobank">
        <Group>
          <Row
            onClick={mono.syncing ? undefined : () => setMonoOpen(true)}
            leading={<Tile logo="icon_monobank.svg" size={36} />}
            title={mono.connected ? "Налаштувати рахунки" : "Підключити Monobank"}
            subtitle="Автоматичний імпорт транзакцій і балансів"
            wrapSubtitle
            trailing={<Meta>{monoStatus}</Meta>}
            chevron={!mono.syncing}
            inset={64}
          />
          {mono.connected && (
            <Row
              onClick={mono.syncing || mono.forceSyncing ? undefined : () => void mono.forceSync()}
              title="Синхронізувати зараз"
              trailing={mono.syncing || mono.forceSyncing ? <Meta>Триває…</Meta> : undefined}
            />
          )}
          {mono.connected && (
            <Row
              onClick={mono.syncing ? undefined : () => setConfirmMono(true)}
              title={<span style={{ color: "#ff3b30" }}>Відключити синхронізацію</span>}
            />
          )}
        </Group>
      </Section>

      <Section caption="Telegram Receipts">
        <Group>
          <Row
            leading={<Tile icon={<HiOutlinePaperAirplane size={20} />} tint="blue" size={36} />}
            title="Чеки через Telegram"
            subtitle={
              telegram.linked && telegram.status?.telegram_username
                ? `Бот ${bot ? `@${bot}` : ""} · акаунт @${telegram.status.telegram_username}`
                : bot
                  ? `Бот @${bot}`
                  : "Прив'язка Telegram-бота для XML та URL чеків"
            }
            wrapSubtitle
            trailing={<Meta>{tgStatus}</Meta>}
            inset={64}
          />
          {telegram.linked ? (
            <Row
              onClick={bot ? () => (window.location.href = `https://t.me/${bot}`) : undefined}
              title="Відкрити бота"
              chevron
            />
          ) : (
            <Row
              onClick={telegram.busy ? undefined : () => void telegram.connect()}
              title="Підключити Telegram"
              trailing={telegram.busy ? <Meta>Зачекайте…</Meta> : undefined}
              chevron={!telegram.busy}
            />
          )}
          {(telegram.linked || !telegram.webhookConfigured) && (
            <Row
              onClick={telegram.busy ? undefined : telegram.syncWebhook}
              title="Оновити webhook"
              trailing={!telegram.webhookConfigured ? <Meta>Не налаштовано</Meta> : undefined}
            />
          )}
          {telegram.linked && (
            <Row
              onClick={telegram.busy ? undefined : () => setConfirmTg(true)}
              title={<span style={{ color: "#ff3b30" }}>Відв&apos;язати Telegram</span>}
            />
          )}
        </Group>
        {!telegram.linked && !telegram.loading && (
          <Footnote>
            {telegram.webhookConfigured
              ? "Натисніть Start у боті — статус оновиться сам."
              : "Натисніть «Підключити» — бот відкриється автоматично."}
          </Footnote>
        )}
      </Section>

      {monoOpen && <MonobankSheet open={monoOpen} onOpenChange={(open) => !open && setMonoOpen(false)} />}
      <ConfirmSheet
        open={confirmMono}
        onOpenChange={setConfirmMono}
        message="Відключити Monobank? Автоматична синхронізація зупиниться, уже завантажені транзакції залишаться в історії."
        actions={[{ label: "Відключити", destructive: true, onSelect: () => mono.disconnect.mutate() }]}
      />
      <ConfirmSheet
        open={confirmTg}
        onOpenChange={setConfirmTg}
        message="Відв'язати Telegram? Чеки через бота більше не надходитимуть."
        actions={[{ label: "Відв'язати", destructive: true, onSelect: () => telegram.revoke() }]}
      />
    </SettingsScreen>
  );
}
