import styled from "styled-components";

export const DropdownContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  background: var(--color-bg-surface);
  /* Висота розтягується по контенту */
`;

export const SearchBox = styled.div`
  padding: 0.5rem;
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  background: var(--color-bg-surface);
  z-index: 10;
`;

export const SearchInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const SearchIconPosition = styled.div`
  position: absolute;
  left: 10px;
  color: var(--color-text-secondary);
  pointer-events: none;
  display: flex;
  align-items: center;
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem 0.5rem 0.5rem 2.2rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 0.9rem;
  background: var(--color-bg-page);
  color: var(--color-text-main);
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: var(--color-brand-500);
    background: var(--color-bg-surface);
  }
`;

export const ScrollArea = styled.div`
  overflow-y: auto;
  max-height: 250px;
  flex: 1;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--color-border);
    border-radius: 10px;
  }
`;

export const TriggerContent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  overflow: hidden;
`;

export const IconWrapper = styled.span<{ $color?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => props.$color || "inherit"};
  font-size: 1.1rem;
  flex-shrink: 0;
`;

export const LabelText = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const EmptyState = styled.div`
  padding: 1.5rem;
  text-align: center;
  color: var(--color-text-tertiary);
  font-size: 0.9rem;
`;
