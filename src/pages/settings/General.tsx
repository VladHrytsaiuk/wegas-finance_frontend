import React from "react";
import { Button } from "../../components/ui/Button";
import { BaseSelect } from "../../components/ui/Select/BaseSelect";

import { useGeneralSettings } from "../../hooks/Settings/useGeneralSettings";
import * as S from "./General.styles";

interface OptionType {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

const getTriggerLabel = (options: OptionType[], value: string) => {
  const normalizedValue = value?.split("-")[0];
  const selected = options.find((o) => o.value === normalizedValue);
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
    isPending,
    isSeeding,
    currencyOptions,
    languageOptions,
  } = state;

  if (isLoading) {
    return <S.Container>{t("common:shared.loading")}</S.Container>;
  }

  return (
    <S.Container style={{ opacity: isPending ? 0.7 : 1, transition: "opacity 0.2s" }}>
      <S.SectionTitle>{t("settings:settingsPage.title")}</S.SectionTitle>

      {/* Тема */}
      <S.FormGroup>
        <S.SettingRow>
          <S.Label>
            <S.LabelText>{t("settings:settingsPage.theme_label")}</S.LabelText>
            <S.LabelDescription>
              {t("settings:settingsPage.theme_description")}
            </S.LabelDescription>
          </S.Label>
          <S.SwitchButton
            $isActive={theme === "dark"}
            onClick={actions.toggleTheme}
            disabled={isPending}
            aria-label="Toggle Dark Mode"
          />
        </S.SettingRow>
      </S.FormGroup>

      {/* Мова */}
      <S.FormGroup>
        <label>{t("settings:settingsPage.language_label")}</label>
        <BaseSelect
          triggerLabel={getTriggerLabel(languageOptions, localLanguage)}
          placeholder={t("common:ui.select_placeholder_default")}
          disabled={isPending}
        >
          {languageOptions.map((opt) => (
            <S.OptionItem
              key={opt.value}
              $isActive={opt.value === localLanguage}
              onClick={() => actions.setLocalLanguage(opt.value)}
              tabIndex={isPending ? -1 : 0}
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
        <label htmlFor="currency">
          {t("settings:settingsPage.currency_label")}
        </label>
        <BaseSelect
          triggerLabel={getTriggerLabel(currencyOptions, localCurrency)}
          placeholder={t("common:ui.select_placeholder_default")}
          disabled={isPending}
        >
          {currencyOptions.map((opt) => (
            <S.OptionItem
              key={opt.value}
              $isActive={opt.value === localCurrency}
              onClick={() => actions.setLocalCurrency(opt.value)}
              tabIndex={isPending ? -1 : 0}
              onKeyDown={(e) => {
                if (e.key === "Enter") actions.setLocalCurrency(opt.value);
              }}
            >
              {opt.icon}
              {opt.label}
            </S.OptionItem>
          ))}
        </BaseSelect>
        <S.HelperText>{t("settings:settingsPage.currency_helper")}</S.HelperText>
      </S.FormGroup>

      <S.DevZone>
        <S.SectionTitle style={{ fontSize: "1.1rem", marginTop: "3rem" }}>
          {t("settings:settingsPage.dev_zone_title")}
        </S.SectionTitle>
        <S.DevZoneDescription>
          {t("settings:settingsPage.dev_zone_description")}
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
            ? t("settings:settingsPage.dev_zone_seeding")
            : t("settings:settingsPage.dev_zone_button")}
        </Button>
      </S.DevZone>
    </S.Container>
  );
}

export default General;
