import styled from "styled-components";

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 350px;

  @media (max-width: 500px) {
    min-width: 100%;
  }
`;

export const FormRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const Title = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  color: var(--color-text-main);
`;

export const Label = styled.label`
  font-weight: 500;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
`;

export const TypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
`;

export const TypeCard = styled.button<{ $active: boolean }>`
  border: 1.5px solid
    ${(p) => (p.$active ? "var(--color-brand-600)" : "var(--color-border)")};
  background-color: ${(p) =>
    p.$active ? "var(--color-brand-50)" : "var(--color-bg-surface)"};
  border-radius: 10px;
  padding: 0.8rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;

  /* Скидання стилів кнопки */
  font-family: inherit;
  color: inherit;

  &:hover {
    border-color: var(--color-brand-500);
    background-color: var(--color-brand-50);
  }

  svg {
    color: ${(p) =>
      p.$active ? "var(--color-brand-700)" : "var(--color-text-secondary)"};
  }

  span {
    font-size: 0.85rem;
    font-weight: 600;
    color: ${(p) =>
      p.$active ? "var(--color-brand-700)" : "var(--color-text-main)"};
  }
`;

export const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
`;
