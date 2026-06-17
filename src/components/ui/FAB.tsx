import React, { useState, useEffect, useRef } from "react";
import styled, { css, keyframes } from "styled-components";
import { HiPlus, HiXMark } from "react-icons/hi2";
import { createPortal } from "react-dom";

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(2px);
  z-index: 998;
  animation: ${fadeIn} 0.2s ease-out;
`;

const FABContainer = styled.div`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1rem;

  @media (max-width: 768px) {
    bottom: calc(80px + env(safe-area-inset-bottom));
    right: 1.25rem;
  }
`;

const MainButton = styled.button<{ $isOpen: boolean; $hasActions: boolean }>`
  width: 50px;
  height: 50px;
  border-radius: 14px;
  background-color: var(--color-brand-600); /* Повертаємо чистий колір без градієнта для FAB */
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); /* Нейтральніша тінь */
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  svg {
    width: 24px;
    height: 24px;
    transition: transform 0.3s ease;
    ${props => props.$isOpen && props.$hasActions && css`transform: rotate(45deg);`}
  }

  &:hover {
    background-color: var(--color-brand-700);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const ActionsList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
`;

const ActionItem = styled.div<{ $index: number }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  animation: ${slideUp} 0.2s ease-out backwards;
  animation-delay: ${props => props.$index * 0.05}s;
`;

const ActionLabel = styled.span`
  background-color: var(--color-bg-surface);
  color: var(--color-text-main);
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 700;
  box-shadow: var(--shadow-md);
  border: none; /* Видалено обводку */
  white-space: nowrap;
`;

const ActionButton = styled.button`
  width: 48px;
  height: 48px;
  border-radius: 12px; /* Заокруглений квадрат */
  background-color: var(--color-bg-surface);
  color: var(--color-text-main);
  border: none; /* Видалено обводку */
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  transition: all 0.2s;

  svg {
    width: 22px;
    height: 22px;
  }

  &:hover {
    background-color: var(--color-bg-hover);
    transform: scale(1.1);
    color: var(--color-brand-600);
  }
`;

export interface FABAction {
  icon: React.ReactNode;
  label?: string;
  onClick: () => void;
}

interface FABProps {
  actions?: FABAction[];
  onClick?: () => void;
  icon?: React.ReactNode;
  show?: boolean; // Дозволяє ховати кнопку на десктопі, якщо потрібно
}

export const FAB = ({ actions, onClick, icon, show = true }: FABProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (!show) return null;

  const hasActions = actions && actions.length > 0;

  const handleMainClick = () => {
    if (hasActions) {
      setIsOpen(!isOpen);
    } else if (onClick) {
      onClick();
    }
  };

  const fabContent = (
    <>
      {isOpen && hasActions && <Backdrop onClick={() => setIsOpen(false)} />}
      <FABContainer ref={containerRef}>
        {isOpen && hasActions && (
          <ActionsList>
            {actions.map((action, index) => (
              <ActionItem key={index} $index={actions.length - 1 - index}>
                {action.label && <ActionLabel>{action.label}</ActionLabel>}
                <ActionButton onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}>
                  {action.icon}
                </ActionButton>
              </ActionItem>
            ))}
          </ActionsList>
        )}
        <MainButton 
          $isOpen={isOpen} 
          $hasActions={hasActions}
          onClick={handleMainClick}
          aria-label="Toggle actions"
        >
          {isOpen && hasActions ? <HiXMark /> : (icon || <HiPlus />)}
        </MainButton>
      </FABContainer>
    </>
  );

  return createPortal(fabContent, document.body);
};
