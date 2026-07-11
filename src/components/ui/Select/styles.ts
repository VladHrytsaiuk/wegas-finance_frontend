import styled, { keyframes } from "styled-components";

// --- ANIMATIONS ---
export const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
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
  $size?: "small" | "medium";
}>`
  min-height: ${(p) => (p.$size === "small" ? "28px" : "46px")};
  padding: ${(p) => (p.$size === "small" ? "0.1rem 0.4rem" : "0.4rem 0.6rem")};
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
  font-size: ${(p) => (p.$size === "small" ? "0.8rem" : "0.9rem")};
  cursor: ${(p) => (p.$disabled ? "not-allowed" : "pointer")};
  opacity: ${(p) => (p.$disabled ? 0.6 : 1)};

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${(p) => (p.$size === "small" ? "4px" : "8px")};

  transition: all 0.2s ease;
  user-select: none;
  position: relative;

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

  font-size: ${(p) => (p.$size === "small" ? "0.7rem" : "0.85rem")};
  padding: ${(p) => (p.$size === "small" ? "0.05rem 0.2rem" : "0.3rem 0.5rem")};
  gap: ${(p) => (p.$size === "small" ? "2px" : "4px")};

  svg {
    width: ${(p) => (p.$size === "small" ? "10px" : "14px")};
    height: ${(p) => (p.$size === "small" ? "10px" : "14px")};
  }
`;

export const Dropdown = styled.div<{ $isAbove: boolean }>`
  position: absolute;
  background-color: var(--color-bg-surface, #fff);
  border: 1px solid var(--color-border, #d1d5db);
  border-radius: 6px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  z-index: 12000;
  display: flex;
  flex-direction: column;
  padding: 4px;
  max-height: 300px;
  overflow-y: hidden;
  box-sizing: border-box;
  margin: 0;

  width: max-content;
  max-width: 90vw;

  animation: ${fadeIn} 0.15s ease-out forwards;

  &:focus {
    outline: none;
  }
`;

export const SearchWrapper = styled.div`
  display: none; /* Тепер пошук у тригері */
`;

export const SearchInputContainer = styled.div`
  position: relative;
  width: 100%;
  color: var(--color-text-secondary, #6b7280);
`;

export const TriggerSearchInput = styled.input`
  flex: 1;
  height: 100%;
  padding: 0;
  border: none;
  outline: none;
  background: transparent;
  color: var(--color-text-main);
  font-size: inherit;
  font-family: inherit;
  z-index: 2;
  min-width: 50px;

  &::placeholder {
    color: var(--color-text-tertiary);
  }

  min-width: 30px;
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

  /* Авто-фокус при пошуку */
  & [data-autofocus="true"] {
    background-color: var(--color-bg-hover, #f3f4f6) !important;
    outline: 2px solid var(--color-brand-500);
    outline-offset: -2px;
  }
`;

export const ContentWrapper = styled.div<{ $isHidden?: boolean }>`
  display: ${(p) => (p.$isHidden ? "none" : "flex")};
  align-items: center;
  flex: 1;
  overflow: hidden;
  min-width: 0;
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

  gap: 2px;
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
