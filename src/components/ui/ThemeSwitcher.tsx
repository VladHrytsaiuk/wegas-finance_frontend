import styled from "styled-components";
import { HiSun, HiMoon } from "react-icons/hi2";
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

  return (
    <IconButton onClick={toggleTheme} title="Змінити тему">
      {theme === "light" ? <HiMoon /> : <HiSun />}
    </IconButton>
  );
};
