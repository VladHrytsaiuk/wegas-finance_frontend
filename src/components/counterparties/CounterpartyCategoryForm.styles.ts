import styled from "styled-components";

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 500px;
  padding: 1.5rem 2rem; /* Balanced padding */

  @media (max-width: 768px) {
    width: 100%;
    padding: 0; /* Remove double padding inside bottom sheets */
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

  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 1rem 0.75rem;
    align-items: stretch;

    /* First child (Name FieldGroup) takes full width */
    & > div:first-child {
      flex: 0 0 100% !important;
    }

    /* Second & third children (Icon & Color FieldGroups) take 50% each */
    & > div:nth-child(2),
    & > div:nth-child(3) {
      flex: 1 1 calc(50% - 0.375rem) !important;
      
      button {
        width: 100% !important;
      }
    }
  }
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

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
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

  @media (max-width: 768px) {
    flex-direction: row;
    padding: 0.75rem 1rem;
    justify-content: flex-start;
  }

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

    @media (max-width: 768px) {
      font-size: 0.85rem !important;
    }
  }
`;

export const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--color-border);

  button {
    height: 38px;
    font-size: 0.95rem;
    padding: 0 1rem;
    min-width: 100px;
    
    @media (min-width: 768px) {
      min-width: 120px;
    }
  }
`;
