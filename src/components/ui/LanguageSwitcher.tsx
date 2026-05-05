import styled from "styled-components";
import { useTranslation } from "react-i18next";

const LangContainer = styled.div`
  display: flex;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 4px;
  box-shadow: var(--shadow-sm);
  gap: 4px;
`;

const LangButton = styled.button<{ $isActive: boolean }>`
  background: ${(props) =>
    props.$isActive ? "var(--color-brand-100)" : "transparent"};
  color: ${(props) =>
    props.$isActive ? "var(--color-brand-700)" : "var(--color-text-secondary)"};
  border: none;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) =>
      props.$isActive ? "var(--color-brand-100)" : "var(--color-bg-subtle)"};
  }
`;

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    // Тут можна також зберегти в localStorage, якщо i18n це не робить автоматично
    localStorage.setItem("i18nextLng", lang);
  };

  return (
    <LangContainer>
      <LangButton
        type="button"
        $isActive={i18n.language === "uk" || i18n.language === "ua"}
        onClick={() => changeLanguage("uk")}
      >
        UA
      </LangButton>
      <LangButton
        type="button"
        $isActive={i18n.language === "en"}
        onClick={() => changeLanguage("en")}
      >
        EN
      </LangButton>
    </LangContainer>
  );
};
