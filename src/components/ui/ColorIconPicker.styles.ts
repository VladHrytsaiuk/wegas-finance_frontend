import styled from "styled-components";

export const Container = styled.div<{ $square?: boolean }>`
  display: flex;
  width: ${(props) => (props.$square ? "auto" : "100%")};

  @media (max-width: 768px) {
    width: ${(props) => (props.$square ? "auto" : "100%")} !important;
  }
`;

export const PickerTrigger = styled.button<{ $square?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${(props) => (props.$square ? "center" : "space-between")};
  gap: ${(props) => (props.$square ? "0" : "0.75rem")};
  padding: ${(props) => (props.$square ? "0" : "0 0.85rem")};
  height: 46px;
  width: ${(props) => (props.$square ? "46px" : "100%")};
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: ${(props) => (props.$square ? "46px" : "100%")} !important;
    justify-content: ${(props) => (props.$square ? "center" : "center")};
    padding: ${(props) => (props.$square ? "0" : "0 0.85rem")};
  }

  &:hover {
    border-color: var(--color-brand-400);
    background-color: var(--color-bg-hover);
  }
`;

export const ColorSwatch = styled.div<{ $color: string }>`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background-color: ${(props) => props.$color};
  border: 1px solid rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
`;

export const IconPreview = styled.div<{ $color: string }>`
  font-size: 1.25rem;
  color: ${(props) => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
`;

// --- PORTAL DROPDOWNS ---
export const DropdownPortalContainer = styled.div<{
  $top: number;
  $left: number;
  $width?: number;
}>`
  position: absolute;
  top: ${(p) => p.$top}px;
  left: ${(p) => p.$left}px;
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: var(--shadow-xl);
  z-index: 20000;
  padding: 0.5rem; /* p-2 equivalent */
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.1s ease-out;
  margin-top: 4px; /* mt-1 equivalent */
  overflow: hidden;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const Section = styled.div`
  display: flex;
  flex-direction: column;
`;

export const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.35rem;
`;

export const CustomColorRow = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.65rem;
  padding-top: 0.6rem;
  border-top: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
`;

export const NativeColorInput = styled.input`
  width: 30px;
  height: 26px;
  padding: 2px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg-page);
  cursor: pointer;
`;

export const IconSearch = styled.label`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0.1rem 0.15rem 0.45rem;
  padding: 0.4rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 7px;
  color: var(--color-text-tertiary);

  &:focus-within {
    border-color: var(--color-brand-500);
    box-shadow: 0 0 0 2px var(--color-brand-100);
  }

  svg {
    width: 14px;
    height: 14px;
    flex: 0 0 14px;
  }

  input {
    width: 132px;
    min-width: 0;
    border: 0;
    outline: 0;
    background: transparent;
    color: var(--color-text-main);
    font: inherit;
    font-size: 0.78rem;
  }
`;

export const ColorOption = styled.button<{
  $color: string;
  $isActive: boolean;
}>`
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background-color: ${(props) => props.$color};
  cursor: pointer;
  border: 2px solid ${(props) => (props.$isActive ? "var(--color-brand-500)" : "transparent")};
  padding: 0;
  transition: all 0.15s;

  &:hover {
    transform: scale(1.1);
    z-index: 1;
  }

  svg {
    color: white;
    width: 12px;
    height: 12px;
    filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.4));
  }
`;

export const IconGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  padding: 0.25rem;
  max-height: 200px;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;

  /* Custom thin scrollbar */
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: var(--color-text-tertiary);
  }
`;

export const IconOption = styled.button<{ $active: boolean; $color: string }>`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0;
  border: 1px solid ${(props) => (props.$active ? "var(--color-brand-500)" : "var(--color-border)")};
  background-color: ${(props) => (props.$active ? "var(--color-brand-50)" : "transparent")};
  color: ${(props) => (props.$active ? props.$color : "var(--color-text-secondary)")};
  transition: all 0.15s;

  &:hover {
    background-color: var(--color-bg-hover);
    color: ${(props) => props.$color};
    transform: scale(1.1);
    z-index: 1;
  }
`;
