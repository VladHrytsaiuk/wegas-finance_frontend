import styled, { keyframes, css } from "styled-components";

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
`;

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
  width: 100%;
`;

export const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text-secondary);
`;
export const Trigger = styled.div<{ $isOpen: boolean; $disabled?: boolean }>`
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

  /* 🔥 Додаємо cursor: pointer явно, бо div за замовчуванням його не має */
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

  /* 🔥 div не фокусується сам по собі, тому додаємо стилі для focus-visible */
  &:focus-visible,
  &:focus {
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
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  z-index: 99999;
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
  padding: 4px 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

export const SelectItem = styled.button<{
  $isActive?: boolean;
  $isDraft?: boolean;
}>`
  width: 100%;
  text-align: left;
  border: none;
  background: transparent;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.9rem;
  color: var(--color-text-main);
  border-radius: 4px;
  transition: background 0.2s;
  margin-bottom: 1px;
  flex-shrink: 0;

  ${(p) =>
    p.$isActive &&
    "background-color: var(--color-brand-50); color: var(--color-brand-600); font-weight: 500;"}
  ${(p) =>
    p.$isDraft &&
    "background-color: var(--color-yellow-50); color: var(--color-yellow-700); font-weight: 500; border-bottom: 1px solid var(--color-border);"}

  &:hover, &:focus {
    background-color: ${(p) =>
      p.$isDraft ? "var(--color-yellow-100)" : "var(--color-bg-page)"};
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
  border-top: 1px solid var(--color-border);
  margin-top: 4px;
  border-radius: 0 0 4px 4px;
  flex-shrink: 0;

  &:hover,
  &:focus {
    background-color: var(--color-brand-50);
    outline: none;
    box-shadow: inset 0 0 0 2px var(--color-brand-200);
  }
`;

export const EmptyState = styled.div`
  padding: 12px;
  text-align: center;
  color: var(--color-text-tertiary);
  font-size: 0.85rem;
`;

export const ContentWrapper = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  overflow: hidden;
  gap: 8px;
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

// --- FORM SPECIFIC STYLES ---
export const CreateContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-brand-600);
  border-radius: 6px;
  padding: 10px;
  box-shadow: 0 0 0 3px var(--color-brand-100);
  gap: 10px;
  width: 100%;
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  border-bottom: 1px dashed var(--color-border);
  padding-bottom: 8px;
  margin-bottom: 2px;
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
    margin-bottom: 0;
  }
`;

export const IconBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  flex-shrink: 0;
`;

export const InlineInput = styled.input`
  border: 1px solid transparent;
  background: transparent;
  flex: 1;
  font-size: 0.95rem;
  color: var(--color-text-main);
  min-width: 0;
  padding: 4px;
  border-radius: 4px;
  &:focus {
    outline: none;
    border-color: var(--color-brand-200);
    background: var(--color-bg-page);
  }
  &::placeholder {
    color: var(--color-text-tertiary);
  }
`;

export const DateInput = styled.input`
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  background: var(--color-bg-page);
  &::-webkit-calendar-picker-indicator {
    cursor: pointer;
    opacity: 0.6;
  }
  &:focus {
    outline: none;
    border-color: var(--color-brand-500);
  }
`;

export const UploadButton = styled.button<{ $hasFiles: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  position: relative;
  background-color: ${(p) =>
    p.$hasFiles ? "var(--color-brand-100)" : "var(--color-bg-page)"};
  color: ${(p) =>
    p.$hasFiles ? "var(--color-brand-600)" : "var(--color-text-tertiary)"};
  border: 1px
    ${(p) =>
      p.$hasFiles
        ? "solid var(--color-brand-300)"
        : "dashed var(--color-border)"};

  &:hover {
    background-color: var(--color-brand-50);
    color: var(--color-brand-600);
    border-color: var(--color-brand-300);
  }
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--color-brand-200);
    border-color: var(--color-brand-500);
  }
`;

export const FileCountBadge = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: var(--color-brand-600);
  color: white;
  font-size: 0.65rem;
  font-weight: bold;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--color-bg-surface);
`;

export const ButtonsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
  padding-top: 8px;
  border-top: 1px solid var(--color-border);
`;

export const ActionButton = styled.button<{
  $variant: "primary" | "secondary";
}>`
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
          background-color: var(--color-brand-600);
          color: white;
          &:hover {
            background-color: var(--color-brand-700);
          }
          &:focus {
            outline: none;
            border-color: white;
            box-shadow:
              0 0 0 2px var(--color-brand-600),
              0 0 0 4px var(--color-brand-200);
          }
        `
      : css`
          background-color: white;
          color: var(--color-text-secondary);
          border-color: var(--color-border);
          &:hover {
            background-color: var(--color-bg-page);
            color: var(--color-text-main);
          }
          &:focus {
            outline: none;
            border-color: var(--color-brand-600);
            box-shadow: 0 0 0 3px var(--color-brand-100);
          }
        `}
`;

// --- ALIASES FOR LEGACY / FLY COMPONENTS ---
export const FlyFormWrapper = CreateContainer;
export const FlyFormRow = Row;
export const FlyLabel = Label;
export const FlyActions = ButtonsRow;

export const FlyFormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const FlyButton = styled(ActionButton)<{ $primary?: boolean }>`
  ${(p) =>
    p.$primary &&
    css`
      background-color: var(--color-brand-600);
      color: white;
      &:hover {
        background-color: var(--color-brand-700);
      }
    `}
`;

export const FilesRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-top: 8px;
`;

export const AddFileBtn = styled(UploadButton)``;

export const FileBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: var(--color-bg-page);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 0.8rem;

  span {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  button {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font-size: 1.1rem;
    line-height: 1;
    color: var(--color-text-tertiary);
    &:hover {
      color: var(--color-red-600);
    }
  }
`;
