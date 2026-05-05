import styled, { css } from "styled-components";

export const TreeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-bottom: 0.5rem;
`;

export const TreeItemWrapper = styled.div<{ $level: number }>`
  padding-left: ${(p) => p.$level * 24}px;

  ${(p) =>
    p.$level > 0 &&
    css`
      position: relative;
      &::before {
        content: "";
        position: absolute;
        left: ${p.$level * 24 - 12}px;
        top: 0;
        bottom: 0;
        width: 1px;
        background-color: var(--color-border);
        opacity: 0.4;
      }
    `}
`;

export const TreeItem = styled.div<{
  $selected: boolean;
  $hasChildren: boolean;
  $isSelectable: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.5rem 0.5rem 0.2rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
  min-height: 36px;

  background-color: ${(p) =>
    p.$selected ? "var(--color-brand-50)" : "transparent"};
  box-shadow: ${(p) =>
    p.$selected ? "inset 0 0 0 1px var(--color-brand-200)" : "none"};

  &:hover {
    background-color: ${(p) =>
      p.$selected ? "var(--color-brand-100)" : "var(--color-bg-hover)"};
  }

  ${(p) =>
    !p.$isSelectable &&
    !p.$hasChildren &&
    css`
      cursor: default;
      &:hover {
        background-color: transparent;
      }
    `}
`;

export const LeftSide = styled.div`
  display: flex;
  align-items: center;
  gap: 0.2rem;
  flex: 1;
  min-width: 0;
`;

export const ExpandButton = styled.button<{ $expanded?: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: var(--color-text-tertiary);
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: var(--color-text-main);
  }

  svg {
    width: 14px;
    height: 14px;
    transition: transform 0.2s ease-in-out;
    transform: ${(p) => (p.$expanded ? "rotate(0deg)" : "rotate(-90deg)")};
  }
`;

export const IndentPlaceholder = styled.div`
  width: 24px;
  flex-shrink: 0;
`;

export const Info = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex: 1;
  overflow: hidden;
  margin-left: 2px;
`;

export const IconWrapper = styled.div<{ $color?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background-color: ${(p) =>
    p.$color ? `${p.$color}15` : "var(--color-bg-surface-secondary)"};
  color: ${(p) => p.$color || "var(--color-text-secondary)"};
  border: 1px solid ${(p) => `${p.$color}20`};
  flex-shrink: 0;

  svg {
    width: 16px;
    height: 16px;
  }
`;

export const Label = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text-main);
  line-height: 1.2;
`;

export const Badge = styled.span<{ $bg?: string; $color?: string }>`
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  margin-left: auto;
  margin-right: 4px;
  background-color: ${(p) => p.$bg || "var(--color-bg-surface-secondary)"};
  color: ${(p) => p.$color || "var(--color-text-secondary)"};
  flex-shrink: 0;
`;

export const Actions = styled.div`
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.2s;

  ${TreeItem}:hover & {
    opacity: 1;
  }
`;

export const ActionBtn = styled.button`
  background: none;
  border: none;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: var(--color-bg-active);
    color: var(--color-brand-600);
  }

  &.delete:hover {
    color: var(--color-red-600);
    background: var(--color-red-50);
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

export const Checkbox = styled.div<{ $checked: boolean }>`
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 1px solid
    ${(p) => (p.$checked ? "var(--color-brand-600)" : "var(--color-border)")};
  background-color: ${(p) =>
    p.$checked ? "var(--color-brand-600)" : "transparent"};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 8px;
  transition: all 0.2s;
  flex-shrink: 0;

  svg {
    width: 14px;
    height: 14px;
    stroke-width: 3;
  }
`;

export const PartialDash = styled.div`
  width: 8px;
  height: 2px;
  background: white;
  border-radius: 1px;
`;
