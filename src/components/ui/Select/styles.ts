import styled, { keyframes } from "styled-components";

// --- ANIMATIONS ---
export const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
`;

// --- STYLED COMPONENTS ---
export const Wrapper = styled.div`
  width: 100%;
  position: relative;
`;

export const Trigger = styled.div<{
  $isOpen: boolean;
  $hasError?: boolean;
  $disabled?: boolean;
}>`
  min-height: 38px;
  padding: 0.3rem 0.6rem;
  background-color: var(--color-bg-surface, #fff);
  color: var(--color-text-main, #333);

  border: 1px solid
    ${(p) =>
      p.$hasError
        ? "var(--color-red-600)"
        : p.$isOpen
        ? "var(--color-brand-500)"
        : "var(--color-border, #d1d5db)"};

  border-radius: 6px;
  font-size: 0.85rem;
  cursor: ${(p) => (p.$disabled ? "not-allowed" : "pointer")};
  opacity: ${(p) => (p.$disabled ? 0.6 : 1)};

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  transition: all 0.2s ease;
  user-select: none;

  box-shadow: ${(p) =>
    p.$isOpen
      ? p.$hasError
        ? "0 0 0 3px var(--color-red-100)"
        : "0 0 0 3px var(--color-brand-100)"
      : "none"};

  &:hover {
    border-color: ${(p) =>
      !p.$isOpen &&
      !p.$hasError &&
      !p.$disabled &&
      "var(--color-text-secondary, #6b7280)"};
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--color-brand-100);
    border-color: var(--color-brand-500);
  }
`;

export const Dropdown = styled.div<{ $isAbove: boolean }>`
  position: fixed;
  background-color: var(--color-bg-surface, #fff);
  border: 1px solid var(--color-border, #d1d5db);
  border-radius: 6px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  padding: 4px;
  max-height: 300px;
  overflow-y: hidden;

  animation: ${fadeIn} 0.15s ease-out forwards;
  transform-origin: ${(p) => (p.$isAbove ? "bottom center" : "top center")};

  &:focus {
    outline: none;
  }
`;

export const SearchWrapper = styled.div`
  padding: 4px 4px 8px 4px;
  position: sticky;
  top: 0;
  background: var(--color-bg-surface, #fff);
  z-index: 10;
  border-bottom: 1px solid var(--color-border, #eee);
  margin-bottom: 4px;
`;

export const SearchInputContainer = styled.div`
  position: relative;
  width: 100%;
  color: var(--color-text-secondary, #6b7280);
`;

export const StyledSearchInput = styled.input`
  width: 100%;
  padding: 6px 8px 6px 30px;
  border: 1px solid var(--color-border, #d1d5db);
  border-radius: 4px;
  font-size: 0.85rem;
  outline: none;
  background: var(--color-bg-page, #f9fafb);
  color: var(--color-text-main, #333);

  &:focus {
    border-color: var(--color-brand-500);
    background: var(--color-bg-surface, #fff);
  }
`;

export const OptionsList = styled.div`
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
  overscroll-behavior: contain;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--color-border, #d1d5db);
    border-radius: 10px;
  }
`;

export const ContentWrapper = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  overflow: hidden;
`;

export const TextTruncate = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
`;

export const Placeholder = styled(TextTruncate)`
  color: var(--color-text-tertiary, #9ca3af);
`;

export const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--color-text-secondary, #6b7280);
  flex-shrink: 0;
`;

export const ClearButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-tertiary, #9ca3af);
  padding: 2px;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background-color: var(--color-bg-page, #f3f4f6);
    color: var(--color-red-600);
  }

  &:focus-visible {
    outline: 2px solid var(--color-brand-500);
  }
`;
