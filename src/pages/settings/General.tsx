import { Button } from "../../components/ui/Button";
// 👇 Імпортуємо BaseSelect напряму (шлях може відрізнятись залежно від структури)
import { BaseSelect } from "../../components/ui/Select/BaseSelect";

import { useGeneralSettings } from "../../hooks/Settings/useGeneralSettings";
import * as S from "./General.styles";

// Допоміжна функція для рендеру лейбла (щоб не дублювати код двічі)
const getTriggerLabel = (options: any[], value: string) => {
  const selected = options.find((o) => o.value === value);
  if (!selected) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      {selected.icon}
      <span>{selected.label}</span>
    </div>
  );
};

function General() {
  const { state, actions, t } = useGeneralSettings();
  const {
    localCurrency,
    localLanguage,
    theme,
    isLoading,
    isSeeding,
    currencyOptions,
    languageOptions,
  } = state;

  if (isLoading) {
    return <S.Container>{t("shared.loading")}</S.Container>;
  }

  return (
    <S.Container>
      <S.SectionTitle>{t("settingsPage.title")}</S.SectionTitle>

      {/* Тема */}
      <S.FormGroup>
        <S.SettingRow>
          <S.Label>
            <S.LabelText>{t("settingsPage.theme_label")}</S.LabelText>
            <S.LabelDescription>
              {t("settingsPage.theme_description")}
            </S.LabelDescription>
          </S.Label>
          <S.SwitchButton
            $isActive={theme === "dark"}
            onClick={actions.toggleTheme}
            aria-label="Toggle Dark Mode"
          />
        </S.SettingRow>
      </S.FormGroup>

      {/* Мова */}
      <S.FormGroup>
        <label>{t("settingsPage.language_label")}</label>
        <BaseSelect
          triggerLabel={getTriggerLabel(languageOptions, localLanguage)}
          placeholder={t("ui.select_placeholder_default")}
        >
          {languageOptions.map((opt) => (
            <S.OptionItem
              key={opt.value}
              $isActive={opt.value === localLanguage}
              onClick={() => actions.setLocalLanguage(opt.value)}
              tabIndex={0} // Потрібно для навігації клавіатурою в BaseSelect
              onKeyDown={(e) => {
                if (e.key === "Enter") actions.setLocalLanguage(opt.value);
              }}
            >
              {opt.icon}
              {opt.label}
            </S.OptionItem>
          ))}
        </BaseSelect>
      </S.FormGroup>

      {/* Валюта */}
      <S.FormGroup>
        <label htmlFor="currency">{t("settingsPage.currency_label")}</label>
        <BaseSelect
          triggerLabel={getTriggerLabel(currencyOptions, localCurrency)}
          placeholder={t("ui.select_placeholder_default")}
        >
          {currencyOptions.map((opt) => (
            <S.OptionItem
              key={opt.value}
              $isActive={opt.value === localCurrency}
              onClick={() => actions.setLocalCurrency(opt.value)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") actions.setLocalCurrency(opt.value);
              }}
            >
              {opt.icon}
              {opt.label}
            </S.OptionItem>
          ))}
        </BaseSelect>
        <S.HelperText>{t("settingsPage.currency_helper")}</S.HelperText>
      </S.FormGroup>

      <div style={{ marginTop: "2rem" }}>
        <Button variation="primary" onClick={actions.handleSave}>
          {t("settingsPage.save_button")}
        </Button>
      </div>

      <S.DevZone>
        <S.SectionTitle style={{ fontSize: "1.1rem", marginTop: "3rem" }}>
          {t("settingsPage.dev_zone_title")}
        </S.SectionTitle>
        <S.DevZoneDescription>
          {t("settingsPage.dev_zone_description")}
        </S.DevZoneDescription>
        <Button
          variation="secondary"
          onClick={actions.seedData}
          disabled={isSeeding}
          style={{
            borderColor: "var(--color-brand-600)",
            color: "var(--color-brand-600)",
          }}
        >
          {isSeeding
            ? t("settingsPage.dev_zone_seeding")
            : t("settingsPage.dev_zone_button")}
        </Button>
      </S.DevZone>
    </S.Container>
  );
}

export default General;
