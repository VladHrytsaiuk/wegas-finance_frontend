import styled from "styled-components";
import { HiSun, HiMoon } from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";

const IconButton = styled.button`
  background: var(--color-bg-surface);
  color: var(--color-text-main);
  border: 1px solid var(--color-border);
  padding: 0.6rem;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: var(--shadow-sm);

  &:hover {
    background-color: var(--color-bg-subtle);
    border-color: var(--color-brand-500);
    transform: translateY(-2px);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

export const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  // Використовуємо новий уніфікований ключ із гілки fix/language
  const toggleTip = t("common:themeSwitcher.theme_toggle_tip");

  return (
    <IconButton onClick={toggleTheme} title={toggleTip} aria-label={toggleTip}>
      {theme === "light" ? <HiMoon /> : <HiSun />}
    </IconButton>
  );
};
