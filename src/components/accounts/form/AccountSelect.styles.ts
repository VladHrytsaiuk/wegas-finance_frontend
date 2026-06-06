import styled, { css } from "styled-components";

export const TreeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-bottom: 0.5rem;
`;

export const TriggerContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  line-height: 1.2;
  width: 100%;
  overflow: hidden;
`;

export const AccountName = styled.span`
  font-weight: 600;
  color: var(--color-text-main);
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
`;

export const AccountBalance = styled.span`
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  font-weight: 500;
  margin-top: 2px;
`;

export const IconWrapper = styled.div<{ $color: string; $hasImage?: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  position: relative;
  transition: transform 0.2s ease;

  background: ${(p) => (p.$hasImage ? "transparent" : `${p.$color}15`)};
  border: 1px solid
    ${(p) => (p.$hasImage ? "var(--color-border)" : "transparent")};
`;

// Схоже на TreeItem в CategoryTree
export const OptionItem = styled.div<{ $isActive: boolean; $isSynced?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.5rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
  min-height: 44px;
  margin: 0 4px;

  background-color: ${(p) =>
    p.$isActive ? "var(--color-brand-50)" : "transparent"};
  box-shadow: ${(p) =>
    p.$isActive ? "inset 0 0 0 1px var(--color-brand-200)" : "none"};

  &:hover {
    background-color: ${(p) =>
      p.$isActive ? "var(--color-brand-100)" : "var(--color-bg-hover)"};
  }

  &:focus {
    outline: none;
    background-color: var(--color-brand-50);
    box-shadow: 0 0 0 2px var(--color-brand-200);
  }

  ${(p) =>
    p.$isSynced &&
    css`
      opacity: 0.6;
      cursor: not-allowed;
      &:hover {
        background-color: transparent;
      }
    `}
`;

export const OwnerRow = styled.div<{ $isExpanded: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0.6rem 0.8rem;
  cursor: pointer;
  user-select: none;
  background-color: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border-light);
  margin-bottom: 2px;
  transition: all 0.2s;

  &:hover {
    background-color: var(--color-bg-hover);
  }

  &:focus {
    outline: none;
    background-color: var(--color-brand-50);
  }
`;

export const OwnerName = styled.span`
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
  letter-spacing: 0.05em;
`;

export const TypeRow = styled.div<{ $isExpanded: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0.5rem 0.8rem 0.5rem 1.5rem;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s;
  border-radius: 4px;
  margin: 1px 4px;

  &:hover {
    background-color: var(--color-bg-hover);
  }

  &:focus {
    outline: none;
    background-color: var(--color-brand-50);
    box-shadow: inset 0 0 0 1px var(--color-brand-200);
  }
`;

export const TypeName = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-secondary);
`;

export const ExpandIcon = styled.div<{ $isExpanded: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  transition: transform 0.2s ease-in-out;
  transform: ${(p) => (p.$isExpanded ? "rotate(0deg)" : "rotate(-90deg)")};
  color: var(--color-text-tertiary);
`;

export const EmptyState = styled.div`
  padding: 1.5rem;
  text-align: center;
  color: var(--color-text-tertiary);
  font-size: 0.9rem;
`;
