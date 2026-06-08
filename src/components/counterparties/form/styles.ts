import styled from "styled-components";

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 550px;
  padding: 0.5rem;

  @media (max-width: 600px) {
    width: 100%;
    padding: 0.5rem;
  }
`;

export const FormRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
`;

export const CompactRow = styled.div`
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

export const Label = styled.label`
  font-weight: 600;
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
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
`;

export const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin-bottom: 0.5rem;
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
  height: 44px; /* Matches picker height */
`;

export const IconContainer = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background-color: var(--color-brand-100);
  color: var(--color-brand-600);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
`;

export const LogoPreviewContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border: 1.5px dashed var(--color-brand-500);
  border-radius: 10px;
  background-color: var(--color-brand-50);
  height: 44px; /* Same height */
`;

export const LogoBox = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  overflow: hidden;
  flex-shrink: 0;

  img {
    max-width: 90%;
    max-height: 90%;
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
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-brand-700);
`;

export const PickerContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  min-height: 44px;
`;

export const DividerText = styled.span`
  font-size: 0.7rem;
  color: var(--color-text-tertiary);
  font-weight: 700;
  text-transform: uppercase;
  user-select: none;
  flex-shrink: 0;
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
  padding: 0.6rem;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;

  font-family: inherit;
  font-size: inherit;
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
