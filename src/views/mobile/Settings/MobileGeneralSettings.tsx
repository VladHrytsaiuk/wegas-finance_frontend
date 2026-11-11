import { HiOutlineSparkles } from "react-icons/hi2";

import { useGeneralSettings } from "../../../hooks/Settings/useGeneralSettings";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { Footnote, Switch } from "../../../mobile/ui/Field";
import { Group, Row, Section } from "../../../mobile/ui/Group";
import { Segmented } from "../../../mobile/ui/Segmented";
import { Tile } from "../../../mobile/ui/Tile";
import { SettingsScreen } from "./SettingsScreen";

// Загальні: тема, мова, валюта (зберігаються одразу) і перевірка чеків.

const LANGUAGES = [
  { value: "uk", label: "Українська" },
  { value: "en", label: "English" },
];
const CURRENCIES = [
  { value: "UAH", label: "₴ Гривня" },
  { value: "USD", label: "$ Долар" },
  { value: "EUR", label: "€ Євро" },
];

export default function MobileGeneralSettings() {
  usePageTitle("Загальні");
  const { state, actions } = useGeneralSettings();
  const busy = state.isLoading || state.isPending;
  // Мова може приходити як «uk-UA».
  const language = (state.localLanguage ?? "uk").split("-")[0];

  return (
    <SettingsScreen title="Загальні">
      <Section caption="Вигляд">
        <Group>
          <Row
            title="Темна тема"
            trailing={
              <Switch
                label="Темна тема"
                checked={state.theme === "dark"}
                onChange={() => actions.toggleTheme()}
                disabled={busy}
              />
            }
          />
        </Group>
      </Section>

      <Section caption="Мова інтерфейсу">
        <Segmented
          label="Мова інтерфейсу"
          options={LANGUAGES}
          value={language}
          onChange={actions.setLocalLanguage}
        />
      </Section>

      <Section caption="Основна валюта">
        <Segmented
          label="Основна валюта"
          options={CURRENCIES}
          value={state.localCurrency}
          onChange={actions.setLocalCurrency}
        />
        <Footnote>Цією валютою показуються загальний баланс і підсумки.</Footnote>
      </Section>

      <Section caption="Чеки">
        <Group>
          <Row
            title="Перевіряти чеки вручну"
            trailing={
              <Switch
                label="Перевіряти чеки вручну"
                checked={state.requireReceiptReview}
                onChange={() => actions.toggleReceiptReview()}
                disabled={busy}
              />
            }
          />
        </Group>
        <Footnote>
          Якщо вимкнути, однозначні чеки з Inbox самі прив&apos;язуватимуться до операцій
          Monobank.
        </Footnote>
      </Section>

      <Section caption="Для розробки">
        <Group>
          <Row
            onClick={() => void actions.seedData()}
            leading={<Tile icon={<HiOutlineSparkles size={18} />} tint="gray" size={30} />}
            title={state.isSeeding ? "Заповнення…" : "Створити тестові дані"}
            inset={58}
          />
        </Group>
        <Footnote>
          Додає рахунки й операції за 3 місяці — для порожньої бази. У робочій базі не потрібно.
        </Footnote>
      </Section>
    </SettingsScreen>
  );
}
