import styled from "styled-components";

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 500px;
  padding: 1.5rem 2rem; /* Balanced padding */

  @media (max-width: 550px) {
    width: 100%;
    padding: 1.5rem;
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
  font-weight: 700;
`;

export const Label = styled.label`
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
`;

export const CompactInputRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  width: 100%;
`;

export const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

export const TypeGrid = styled.div`
  display: flex;
  gap: 0.75rem;
  width: 100%;
`;

export const TypeCard = styled.button<{ $active: boolean }>`
  flex: 1;
  border: 1.5px solid
    ${(p) => (p.$active ? "var(--color-brand-600)" : "var(--color-border)")};
  background-color: ${(p) =>
    p.$active ? "var(--color-brand-50)" : "var(--color-bg-surface)"};
  border-radius: 8px;
  padding: 0.6rem 1rem;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  transition: all 0.2s;

  font-family: inherit;
  outline: none;

  &:hover {
    border-color: var(--color-brand-500);
    background-color: var(--color-brand-50);
  }

  svg {
    width: 20px;
    height: 20px;
    color: ${(p) =>
      p.$active ? "var(--color-brand-700)" : "var(--color-text-secondary)"};
  }

  span {
    font-size: 0.85rem;
    font-weight: 600;
    line-height: 1;
    color: ${(p) =>
      p.$active ? "var(--color-brand-700)" : "var(--color-text-main)"};
  }
`;

export const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 0.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--color-border);
`;
