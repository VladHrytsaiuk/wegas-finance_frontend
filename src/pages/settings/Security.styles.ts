import styled, { css } from "styled-components";
import { Button } from "../../components/ui/Button";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const SectionTitle = styled.h2`
  font-size: 1.15rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
  color: var(--color-text-main);
`;

export const SecurityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const SecurityItem = styled.div<{ $disabled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);

  ${props => props.$disabled && css`
    opacity: 0.5;
    cursor: not-allowed;
    background-color: var(--color-grey-50);
  `}

  @media (max-width: 600px) {
    padding: 0.75rem 1rem;
  }
`;

export const SecurityInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const IconBox = styled.div<{ $active: boolean }>`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background-color: ${props => props.$active ? 'var(--color-success-50)' : 'var(--color-grey-50)'};
  color: ${props => props.$active ? 'var(--color-success)' : 'var(--color-grey-400)'};
  transition: all 0.2s;
  flex-shrink: 0;

  svg {
    width: 20px;
    height: 20px;
  }
`;

export const SecurityText = styled.div`
  display: flex;
  flex-direction: column;
`;

export const SecurityLabel = styled.span`
  font-weight: 700;
  color: var(--color-text-main);
  font-size: 0.95rem;
`;

export const SecurityDesc = styled.span`
  font-size: 0.8rem;
  color: var(--color-text-secondary);
`;

export const SecurityActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const SwitchButton = styled.button<{ $isActive: boolean }>`
  min-width: 44px;
  height: 22px;
  background-color: ${({ $isActive }) =>
    $isActive ? "var(--color-success)" : "var(--color-text-light)"};
  border-radius: 12px;
  position: relative;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  flex-shrink: 0;

  &::after {
    content: "";
    position: absolute;
    top: 2px;
    left: ${({ $isActive }) => ($isActive ? "24px" : "2px")};
    width: 18px;
    height: 18px;
    background-color: white;
    border-radius: 50%;
    transition: left 0.3s;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

export const ActionButton = styled(Button)`
  min-width: auto;
  height: 32px;
  font-size: 0.8rem;
  border-radius: 8px;
  padding: 0 0.75rem;
`;

export const ModalContainer = styled.div`
  width: 100%;
  max-width: 440px;
  padding: 0.5rem;
`;

export const ModalTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-align: center;
  color: var(--color-text-main);
`;

export const PasswordForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

export const PasswordGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 400px) {
    grid-template-columns: 1fr;
  }
`;

export const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--color-text-main);
`;
