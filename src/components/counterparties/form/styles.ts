import styled from "styled-components";

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  min-width: 400px;

  @media (max-width: 500px) {
    min-width: 100%;
  }
`;

export const FormRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  position: relative;
`;

export const Label = styled.label`
  font-weight: 500;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
`;

export const ErrorMessage = styled.span`
  font-size: 0.75rem;
  color: var(--color-red-700);
  margin-top: 0.1rem;
`;

export const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
  margin-top: 0.5rem;
  padding-top: 0.8rem;
  border-top: 1px solid var(--color-border);
`;

export const Title = styled.h3`
  font-size: 1.25rem;
  color: var(--color-text-main);
  margin: 0;
`;

/* --- New Styles replacing Inline Objects --- */

export const PersonStaticBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.8rem;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background-color: var(--color-bg-surface);
  color: var(--color-text-secondary);
  font-size: 0.9rem;
`;

export const IconContainer = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background-color: var(--color-brand-100);
  color: var(--color-brand-600);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
`;

export const LogoPreviewContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.8rem;
  border: 1px dashed var(--color-brand-500);
  border-radius: 10px;
  background-color: var(--color-brand-50);
`;

export const LogoBox = styled.div`
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  overflow: hidden;
  flex-shrink: 0;

  img {
    max-width: 80%;
    max-height: 80%;
    object-fit: contain;
  }
`;

export const LogoInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

export const LogoTextMain = styled.span`
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-main);
`;

export const LogoTextSub = styled.span`
  font-size: 0.75rem;
  color: var(--color-text-secondary);
`;

export const PickerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const DividerContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const DividerLine = styled.div`
  height: 1px;
  flex: 1;
  background-color: var(--color-border);
`;

export const DividerText = styled.span`
  font-size: 0.75rem;
  color: var(--color-text-light);
  font-weight: 500;
`;

// src/components/counterparties/form/styles.ts

// ... твої існуючі стилі (Form, Label тощо) ...

// 👇 ДОДАЙ ЦЕЙ БЛОК, ЯКЩО ЙОГО НЕМАЄ 👇

export const TypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
`;

export const TypeCard = styled.button<{ $active: boolean }>`
  border: 1px solid
    ${(p) => (p.$active ? "var(--color-brand-600)" : "var(--color-border)")};
  background-color: ${(p) =>
    p.$active ? "var(--color-brand-50)" : "var(--color-bg-surface)"};
  border-radius: 8px;
  padding: 0.6rem;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;

  /* Скидання стилів кнопки, якщо використовуєш styled.button */
  font-family: inherit;
  font-size: inherit;

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
