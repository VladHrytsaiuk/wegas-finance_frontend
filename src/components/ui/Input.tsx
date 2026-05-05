import styled from "styled-components";

export const Input = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  padding: 0.75rem 1rem;

  background-color: var(--color-bg-surface);
  color: var(--color-text-main);

  /* 🔥 Динамічна зміна кольору бордера, якщо є помилка */
  border: 1px solid
    ${(props) =>
      props.$hasError ? "var(--color-red-600)" : "var(--color-border)"};

  border-radius: 6px;
  font-size: 0.95rem;
  transition: all 0.2s;

  &::placeholder {
    color: var(--color-text-tertiary);
  }

  &:focus {
    outline: none;
    /* 🔥 Фокус також має підсвічуватися червоним, якщо є помилка */
    border-color: ${(props) =>
      props.$hasError ? "var(--color-red-600)" : "var(--color-brand-500)"};

    box-shadow: 0 0 0 3px
      ${
        (props) =>
          props.$hasError
            ? "rgba(220, 38, 38, 0.1)" // Легке червоне світіння
            : "rgba(16, 185, 129, 0.1)" // Твоє зелене світіння
      };
  }

  &:disabled {
    background-color: #f9fafb;
    color: var(--color-text-light);
    cursor: not-allowed;
  }
`;
