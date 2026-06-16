import styled from "styled-components";
import { Button } from "./Button";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 800px;
  width: 100%;
`;

export const IconWrapper = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: var(--color-red-100);
  color: var(--color-red-600);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.2rem;
  font-size: 28px;
`;

export const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-main);
  margin-bottom: 0.5rem;
`;

export const Description = styled.p`
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
`;

export const ButtonGroup = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.8rem;
  width: 100%;

  @media (max-width: 480px) {
    gap: 0.5rem;
  }
`;

// Ми розширюємо існуючий компонент Button
export const DeleteButton = styled(Button)`
  justify-content: center;
  width: 100%;
  background-color: var(--color-red-600);
  border: 1px solid var(--color-red-600);
  color: white;

  @media (max-width: 480px) {
    font-size: 0.8rem;
    padding: 0 0.4rem;
    height: 42px;
  }

  /* && використовується для підвищення специфічності селектора, 
     щоб перебити дефолтні стилі Button */
  &&:hover:not(:disabled) {
    background-color: var(--color-red-700);
    border-color: var(--color-red-700);
    color: white;
    box-shadow: var(--shadow-md);
  }

  &&:active:not(:disabled) {
    background-color: var(--color-red-800);
  }
`;

export const DeleteAllButton = styled(Button)`
  justify-content: center;
  width: 100%;
  background-color: transparent;
  border: 1px solid var(--color-red-200);
  color: var(--color-red-700);

  @media (max-width: 480px) {
    font-size: 0.8rem;
    padding: 0 0.4rem;
    height: 42px;
  }

  &&:hover:not(:disabled) {
    background-color: var(--color-red-50);
    border-color: var(--color-red-300);
    color: var(--color-red-800);
    box-shadow: none;
  }
`;

export const CancelButton = styled(Button)`
  justify-content: center;
  width: 100%;
  background-color: var(--color-bg-page);
  color: var(--color-text-main);
  border: 1px solid transparent;

  @media (max-width: 480px) {
    font-size: 0.8rem;
    padding: 0 0.4rem;
    height: 42px;
  }

  &&:hover:not(:disabled) {
    background-color: var(--color-border);
    color: var(--color-text-main);
    box-shadow: none;
  }
`;
