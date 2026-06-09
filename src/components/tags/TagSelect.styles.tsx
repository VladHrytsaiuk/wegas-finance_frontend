import styled, { keyframes, css } from "styled-components";

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
`;

export const Wrapper = styled.div`
  width: 100%;
  position: relative;
`;

export const Trigger = styled.button<{ $isOpen: boolean; $disabled?: boolean }>`
  min-height: 46px;
  width: 100%;
  padding: 0.4rem 0.6rem;
  background-color: var(--color-bg-surface, #fff);
  color: var(--color-text-main, #333);
  border: 1px solid
    ${(p) =>
      p.$isOpen ? "var(--color-brand-500)" : "var(--color-border, #d1d5db)"};
  border-radius: 6px;
  font-size: 0.9rem;
  font-family: inherit;
  cursor: ${(p) => (p.$disabled ? "not-allowed" : "pointer")};
  opacity: ${(p) => (p.$disabled ? 0.6 : 1)};
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
      !p.$isOpen && !p.$disabled && "var(--color-text-secondary, #6b7280)"};
  }
  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--color-brand-100);
    border-color: var(--color-brand-500);
  }
`;

export const PortalMenu = styled.div`
  position: fixed;
  background-color: var(--color-bg-surface, #fff);
  border: 1px solid var(--color-border, #d1d5db);
  border-radius: 6px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  padding: 0;
  animation: ${fadeIn} 0.15s ease-out forwards;

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

export const List = styled.div`
  flex: 1;
  min-height: 0;
  max-height: 250px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

export const TagItem = styled.button<{ $selected: boolean }>`
  width: 100%;
  text-align: left;
  border: none;
  font-family: inherit;
  padding: 0.5rem 0.8rem;
  cursor: pointer;
  border-radius: 4px;
  font-size: 0.9rem;
  color: var(--color-text-main);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${(p) =>
    p.$selected ? "var(--color-brand-50)" : "transparent"};
  transition: background 0.2s;
  flex-shrink: 0;

  &:hover,
  &:focus {
    background-color: var(--color-bg-page);
    outline: none;
    box-shadow: inset 0 0 0 2px var(--color-brand-200);
  }
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
    box-shadow: inset 0 0 0 2px var(--color-brand-200);
  }
`;

export const TagBadge = styled.span<{ $color?: string }>`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-right: 4px;
  background-color: ${(p) =>
    p.$color ? `${p.$color}20` : "var(--color-bg-page)"};
  color: ${(p) => p.$color || "var(--color-text-secondary)"};
`;

export const ContentWrapper = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  overflow: hidden;
  gap: 4px;
`;

export const Placeholder = styled.span`
  color: var(--color-text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--color-text-secondary);
  flex-shrink: 0;
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
  &:hover {
    background-color: var(--color-bg-page);
    color: var(--color-red-600);
  }
  &:focus-visible {
    outline: 2px solid var(--color-brand-500);
  }
`;

export const FooterRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 8px;
  border-top: 1px solid var(--color-border);
  background: var(--color-bg-surface);
  border-radius: 0 0 6px 6px;
  flex-shrink: 0;
`;

export const FooterBtn = styled.button<{ $variant: "primary" | "secondary" }>`
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;

  ${(p) =>
    p.$variant === "primary"
      ? css`
          background: var(--color-brand-600);
          color: white;
          &:hover {
            background: var(--color-brand-700);
          }
          &:focus {
            outline: none;
            border-color: white;
            box-shadow: 0 0 0 2px var(--color-brand-600),
              0 0 0 4px var(--color-brand-200);
          }
        `
      : css`
          background: white;
          color: var(--color-text-main);
          border-color: var(--color-border);
          &:hover {
            background: var(--color-bg-page);
            color: var(--color-red-600);
          }
          &:focus {
            outline: none;
            border-color: var(--color-brand-600);
            box-shadow: 0 0 0 3px var(--color-brand-100);
          }
        `}
`;
