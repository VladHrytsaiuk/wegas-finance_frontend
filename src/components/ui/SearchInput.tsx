import styled from "styled-components";
import { HiMagnifyingGlass } from "react-icons/hi2";
import { useTranslation } from "react-i18next"; // ⬅️ ІМПОРТ ДЛЯ ПЕРЕКЛАДУ

const StyledSearch = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 300px;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.6rem 1rem 0.6rem 2.4rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background-color: var(--color-bg-page);
  color: var(--color-text-main);
  font-size: 0.9rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: var(--color-brand-500);
    background-color: var(--color-bg-surface);
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }

  &::placeholder {
    color: var(--color-text-light);
  }
`;

const IconWrapper = styled.div`
  position: absolute;
  left: 0.8rem;
  color: var(--color-text-light);
  display: flex;
  align-items: center;
  pointer-events: none;

  svg {
    width: 1.1rem;
    height: 1.1rem;
  }
`;

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder,
}: SearchInputProps) {
  const { t } = useTranslation(); // ⬅️ ВИКОРИСТАННЯ ХУКА

  // ➡️ Використовуємо переклад, якщо placeholder не передано
  const finalPlaceholder = placeholder || t("ui.search_placeholder_default");

  return (
    <StyledSearch>
      <IconWrapper>
        <HiMagnifyingGlass />
      </IconWrapper>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={finalPlaceholder}
      />
    </StyledSearch>
  );
}
