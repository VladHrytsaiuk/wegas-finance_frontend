import React, { useEffect } from "react";
import styled from "styled-components";

const Container = styled.div<{ $isFullPage?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 1.5rem;
  width: 100%;
  /* Використовуємо flex-grow, щоб зайняти весь вільний простір без жорстких calc */
  flex: ${(p) => (p.$isFullPage ? "1" : "none")};
  min-height: ${(p) => (p.$isFullPage ? "300px" : "auto")};
  background: transparent;
  box-sizing: border-box;
`;

const ContentCard = styled.div`
  background: var(--color-bg-surface);
  border: 1px dashed var(--color-border);
  border-radius: 16px;
  padding: 2.5rem 2rem;
  max-width: 420px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  box-shadow: var(--shadow-sm);

  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
  }
`;

const IconWrapper = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: var(--color-brand-50);
  color: var(--color-brand-500);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;

  svg {
    width: 28px;
    height: 28px;
  }

  span.emoji {
    font-size: 2rem;
  }
`;

const Title = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0;
`;

const Description = styled.p`
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0;
`;

const Actions = styled.div`
  margin-top: 0.5rem;
  width: 100%;
  display: flex;
  justify-content: center;
`;

interface EmptyStateProps {
  icon?: React.ReactNode;
  emoji?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  isFullPage?: boolean; // Якщо true, займе весь вільний простір батька
}

export function EmptyState({
  icon,
  emoji,
  title,
  description,
  action,
  isFullPage = true,
}: EmptyStateProps) {
  // 🔥 Lock scroll on parent if fullPage
  useEffect(() => {
    if (!isFullPage) return;

    const mainElement = document.querySelector("main");
    if (mainElement) {
      const originalOverflow = mainElement.style.overflowY;
      mainElement.style.overflowY = "hidden";
      return () => {
        mainElement.style.overflowY = originalOverflow;
      };
    }
  }, [isFullPage]);

  return (
    <Container $isFullPage={isFullPage}>
      <ContentCard>
        {(icon || emoji) && (
          <IconWrapper>
            {icon}
            {emoji && <span className="emoji">{emoji}</span>}
          </IconWrapper>
        )}
        <Title>{title}</Title>
        {description && <Description>{description}</Description>}
        {action && <Actions>{action}</Actions>}
      </ContentCard>
    </Container>
  );
}

export default EmptyState;
