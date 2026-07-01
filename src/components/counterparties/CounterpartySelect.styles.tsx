import styled, { keyframes } from "styled-components";
import { HiChevronDown } from "react-icons/hi2";

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
`;

export const Wrapper = styled.div`
  width: 100%;
  position: relative;
`;

export const Trigger = styled.div<{ $isOpen: boolean; $hasError?: boolean }>`
  cursor: pointer;
  min-height: 46px;
  width: 100%;
  padding: 0.4rem 0.6rem;
  background-color: var(--color-bg-surface, #fff);
  color: var(--color-text-main, #333);

  border: 1px solid
    ${(p) =>
      p.$hasError
        ? "var(--color-red-500)"
        : p.$isOpen
          ? "var(--color-brand-500)"
          : "var(--color-border, #d1d5db)"};

  border-radius: 6px;
  font-size: 0.9rem;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  transition: all 0.2s ease;
  user-select: none;

  box-shadow: ${(p) =>
    p.$isOpen ? "0 0 0 3px var(--color-brand-100)" : "none"};

  &:hover {
    border-color: ${(p) =>
      !p.$isOpen && !p.$hasError && "var(--color-text-secondary, #6b7280)"};
  }

  &:focus-visible {
    outline: none;
    border-color: var(--color-brand-500);
    box-shadow: 0 0 0 3px var(--color-brand-100);
  }
`;

export const TriggerContent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  overflow: hidden;
`;

export const LabelText = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Placeholder = styled.span`
  color: var(--color-text-tertiary);
`;

export const IconsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const ClearButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-tertiary);
  padding: 2px;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background-color: var(--color-bg-page);
    color: var(--color-red-600);
  }
`;

export const ChevronIcon = styled(HiChevronDown)<{ $isOpen: boolean }>`
  transition: transform 0.2s;
  transform: ${(p) => (p.$isOpen ? "rotate(180deg)" : "rotate(0)")};
  color: var(--color-text-secondary);
`;

export const PortalMenu = styled.div`
  position: fixed;
  background-color: var(--color-bg-surface, #fff);
  border: 1px solid var(--color-border, #d1d5db);
  border-radius: 6px;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  z-index: 99999;
  display: flex;
  flex-direction: column;
  padding: 0;
  animation: ${fadeIn} 0.15s ease-out forwards;
  min-width: 300px;

  &:focus {
    outline: none;
  }
`;

export const SearchWrapper = styled.div`
  padding: 8px;
  border-bottom: 1px solid var(--color-border, #eee);
  flex-shrink: 0;
`;

export const SearchInputContainer = styled.div`
  position: relative;
  width: 100%;
  color: var(--color-text-secondary);
`;

export const SearchIconWrapper = styled.div`
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  display: flex;
  align-items: center;
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 6px 8px 6px 30px;
  border: 1px solid var(--color-border, #d1d5db);
  border-radius: 4px;
  font-size: 0.85rem;
  outline: none;
  background: var(--color-bg-page, #f9fafb);
  color: var(--color-text-main);

  &:focus {
    border-color: var(--color-brand-500);
    background: var(--color-bg-surface, #fff);
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

export const NotFoundMessage = styled.div`
  padding: 1rem;
  text-align: center;
  color: gray;
  font-size: 0.9rem;
`;

export const CreateActionBtn = styled.button`
  width: 100%;
  text-align: left;
  border: none;
  background: transparent;
  padding: 10px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: var(--color-brand-600);
  font-weight: 500;
  border-top: 1px dashed var(--color-border);
  margin-top: 4px;
  border-radius: 4px;
  flex-shrink: 0;

  &:hover,
  &:focus {
    background-color: var(--color-brand-50);
    outline: none;
  }
`;

export const HiddenTrigger = styled.div`
  display: none;
`;

export const ModalContent = styled.div`
  width: 500px;
  max-width: 90vw;
`;

export const IconWrapper = styled.div<{ $color?: string }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${(p) => p.$color || "var(--color-bg-page)"};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;

  /* Якщо всередині іконка react-icons */
  svg {
    display: block;
  }
`;
