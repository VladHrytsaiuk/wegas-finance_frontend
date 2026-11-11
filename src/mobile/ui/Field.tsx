import styled from "styled-components";

// Поле в рядку списку (значення справа) і перемикач як у налаштуваннях iOS.

export const RowInput = styled.input<{ $align?: "left" | "right" }>`
  flex: 1;
  width: ${(p) => (p.$align === "left" ? "100%" : "50vw")};
  max-width: ${(p) => (p.$align === "left" ? "none" : "240px")};
  min-width: 0;
  border: none;
  background: none;
  outline: none;
  font: inherit;
  font-size: 17px;
  color: var(--m-label);
  text-align: ${(p) => p.$align ?? "right"};

  &::placeholder {
    color: var(--m-label-3);
  }
`;

const Track = styled.button<{ $on: boolean }>`
  position: relative;
  flex-shrink: 0;
  width: 51px;
  height: 31px;
  padding: 0;
  border: none;
  border-radius: 16px;
  background: ${(p) => (p.$on ? "var(--m-accent)" : "var(--m-fill)")};
  transition: background 0.2s;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }

  &::after {
    content: "";
    position: absolute;
    top: 2px;
    left: ${(p) => (p.$on ? "22px" : "2px")};
    width: 27px;
    height: 27px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
    transition: left 0.2s;
  }
`;

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

export function Switch({ checked, onChange, label, disabled }: SwitchProps) {
  return (
    <Track
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      $on={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
    />
  );
}

/** Пояснення під групою рядків («footer» у налаштуваннях iOS). */
export const Footnote = styled.p`
  margin: 8px 16px 0;
  font-size: 13px;
  line-height: 1.4;
  color: var(--m-label-2);
`;

/** Невелика дія акцентним кольором біля заголовка розділу («А–Я», «Змінити»). */
export const TextAction = styled.button.attrs({ type: "button" })`
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  font-size: 13px;
  color: var(--m-accent);
  cursor: pointer;
`;
