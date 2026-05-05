import styled from "styled-components";

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

export const ModalContainer = styled.div`
  background: var(--color-bg-surface);
  width: 550px;
  max-width: 95vw;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow-y: auto;
`;

export const Header = styled.div`
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Title = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-main);
`;

export const CloseBtn = styled.button`
  background: transparent;
  border: none;
  padding: 4px;
  border-radius: 50%;
  cursor: pointer;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: var(--color-bg-hover);
    color: var(--color-text-main);
  }
`;

export const Content = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const SectionLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
  margin-bottom: 0.5rem;
  letter-spacing: 0.05em;
`;

export const ControlRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 4px 0;
  @media (max-width: 500px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const Divider = styled.div`
  width: 1px;
  height: 40px;
  background: var(--color-border);
  @media (max-width: 500px) {
    display: none;
  }
`;

export const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
`;

export const OptionCard = styled.label<{ $checked: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0.8rem 1rem;
  border: 2px solid
    ${(p) => (p.$checked ? "var(--color-brand-600)" : "var(--color-border)")};
  background: ${(p) =>
    p.$checked ? "var(--color-brand-50)" : "var(--color-bg-main)"};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  input {
    display: none;
  }
  div.icon {
    color: ${(p) =>
      p.$checked ? "var(--color-brand-600)" : "var(--color-text-secondary)"};
    font-size: 1.2rem;
    display: flex;
  }
  span {
    font-weight: 500;
    color: var(--color-text-main);
    font-size: 0.9rem;
  }
`;

export const FormatInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0.75rem 1rem;
  background: var(--color-bg-hover);
  border-radius: 8px;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  border: 1px dashed var(--color-border);
`;

export const Footer = styled.div`
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--color-border);
  background: var(--color-bg-surface);
  border-radius: 0 0 16px 16px;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;
