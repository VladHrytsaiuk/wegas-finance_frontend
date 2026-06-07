import React, { useEffect } from "react";
import styled from "styled-components";

const Container = styled.div<{ $isFullPage?: boolean; $compact?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: ${(p) => (p.$compact ? "1rem" : "1.5rem")};
  width: 100%;
  /* Використовуємо flex-grow, щоб зайняти весь вільний простір без жорстких calc */
  flex: ${(p) => (p.$isFullPage ? "1" : "none")};
  min-height: ${(p) => (p.$isFullPage ? "300px" : "auto")};
  background: transparent;
  box-sizing: border-box;
`;

const ContentCard = styled.div<{ $compact?: boolean }>`
  background: ${(p) => (p.$compact ? "transparent" : "var(--color-bg-surface)")};
  border: ${(p) =>
    p.$compact ? "none" : "1px dashed var(--color-border)"};
  border-radius: 16px;
  padding: ${(p) => (p.$compact ? "0.5rem" : "2.5rem 2rem")};
  max-width: ${(p) => (p.$compact ? "100%" : "420px")};
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${(p) => (p.$compact ? "0.5rem" : "1rem")};
  box-shadow: ${(p) => (p.$compact ? "none" : "var(--shadow-sm)")};

  @media (max-width: 768px) {
    padding: ${(p) => (p.$compact ? "0.5rem" : "1.5rem 1rem")};
  }
`;

const IconWrapper = styled.div<{ $compact?: boolean }>`
  width: ${(p) => (p.$compact ? "40px" : "56px")};
  height: ${(p) => (p.$compact ? "40px" : "56px")};
  border-radius: 50%;
  background-color: var(--color-brand-50);
  color: var(--color-brand-500);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${(p) => (p.$compact ? "0.25rem" : "0.5rem")};

  svg {
    width: ${(p) => (p.$compact ? "20px" : "28px")};
    height: ${(p) => (p.$compact ? "20px" : "28px")};
  }

  span.emoji {
    font-size: ${(p) => (p.$compact ? "1.5rem" : "2rem")};
  }
`;

const Title = styled.h3<{ $compact?: boolean }>`
  font-size: ${(p) => (p.$compact ? "0.9rem" : "1.1rem")};
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0;
`;

const Description = styled.p<{ $compact?: boolean }>`
  font-size: ${(p) => (p.$compact ? "0.75rem" : "0.85rem")};
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
  compact?: boolean; // Компактний режим для віджетів
}

export function EmptyState({
  icon,
  emoji,
  title,
  description,
  action,
  isFullPage = true,
  compact = false,
}: EmptyStateProps) {
  // 🔥 Lock scroll on parent if fullPage and NOT compact
  useEffect(() => {
    if (!isFullPage || compact) return;

    const mainElement = document.querySelector("main");
    if (mainElement) {
      const originalOverflow = mainElement.style.overflowY;
      mainElement.style.overflowY = "hidden";
      return () => {
        mainElement.style.overflowY = originalOverflow;
      };
    }
  }, [isFullPage, compact]);

  return (
    <Container $isFullPage={isFullPage} $compact={compact}>
      <ContentCard $compact={compact}>
        {(icon || emoji) && (
          <IconWrapper $compact={compact}>
            {icon}
            {emoji && <span className="emoji">{emoji}</span>}
          </IconWrapper>
        )}
        <Title $compact={compact}>{title}</Title>
        {description && (
          <Description $compact={compact}>{description}</Description>
        )}
        {action && <Actions>{action}</Actions>}
      </ContentCard>
    </Container>
  );
}

export default EmptyState;
