import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(4px);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeIn} 0.2s ease-out;
`;

export const Card = styled.div`
  background: var(--color-bg-surface);
  width: 450px;
  max-width: 95vw;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Title = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
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
  padding: 4px;
  border-radius: 4px;

  &:hover {
    color: var(--color-text-main);
    background-color: var(--color-bg-subtle);
  }
`;

export const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const SwitcherContainer = styled.div`
  display: flex;
  background: var(--color-bg-subtle);
  padding: 4px;
  border-radius: 10px;
  border: 1px solid var(--color-border);
`;

export const SwitcherButton = styled.button<{
  $active: boolean;
  $activeColor: string;
}>`
  flex: 1;
  padding: 8px;
  border: none;
  background: ${(props) =>
    props.$active ? "var(--color-bg-surface)" : "transparent"};
  color: ${(props) =>
    props.$active ? props.$activeColor : "var(--color-text-secondary)"};
  font-weight: ${(props) => (props.$active ? "600" : "500")};
  border-radius: 8px;
  cursor: pointer;
  box-shadow: ${(props) =>
    props.$active ? "0 2px 5px rgba(0,0,0,0.05)" : "none"};
  transition: all 0.2s;

  &:hover {
    color: ${(props) =>
      props.$active ? props.$activeColor : "var(--color-text-main)"};
  }
`;

export const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const Label = styled.label`
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-secondary);
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.7rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-surface);
  color: var(--color-text-main);
  &:focus {
    outline: 2px solid var(--color-brand-500);
    outline-offset: -1px;
  }
`;

export const Textarea = styled.textarea`
  width: 100%;
  padding: 0.7rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-surface);
  color: var(--color-text-main);
  min-height: 80px;
  resize: vertical;
  font-family: inherit;
  &:focus {
    outline: 2px solid var(--color-brand-500);
    outline-offset: -1px;
  }
`;

export const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 0.5rem;
`;
