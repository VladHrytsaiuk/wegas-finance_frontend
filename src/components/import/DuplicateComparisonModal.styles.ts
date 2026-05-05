import styled from "styled-components";

export const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Card = styled.div`
  background: var(--color-bg-surface);
  width: 800px;
  max-width: 95vw;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

export const HeaderTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  color: var(--color-text-main);
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
  padding: 4px;
  border-radius: 4px;

  &:hover {
    color: var(--color-text-main);
    background-color: var(--color-bg-subtle);
  }
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 40px 1fr;
  gap: 1.5rem;
  align-items: stretch;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

export const Column = styled.div<{ $bg: string }>`
  background: ${(props) => props.$bg};
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

export const Title = styled.h4`
  text-transform: uppercase;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding-bottom: 0.8rem;
`;

export const Row = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const Label = styled.span`
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
  font-weight: 500;
`;

export const Value = styled.strong`
  font-size: 0.95rem;
  color: var(--color-text-main);
  word-break: break-word;
  min-height: 1.4em;
`;

export const Badge = styled.span<{ $type: string }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;

  /* Dynamic colors based on transaction type */
  ${(props) => {
    switch (props.$type) {
      case "expense":
        return `
          background: var(--color-red-100);
          color: var(--color-red-700);
        `;
      case "income":
        return `
          background: var(--color-brand-100);
          color: var(--color-brand-700);
        `;
      default: // transfer or others
        return `
          background: var(--color-blue-100);
          color: var(--color-blue-700);
        `;
    }
  }}
`;

export const ArrowContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);

  @media (max-width: 768px) {
    transform: rotate(90deg);
  }
`;

export const Footer = styled.div`
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
`;
