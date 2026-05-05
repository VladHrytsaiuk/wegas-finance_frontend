import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  gap: 0.8rem;
  align-items: center;
  width: 100%;
`;

export const ColorTrigger = styled.button<{ $color: string }>`
  position: relative;
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background-color: ${(props) => props.$color};
  border: 1px solid var(--color-border);
  cursor: pointer;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  padding: 0;

  &:hover {
    transform: scale(1.05);
    border-color: var(--color-text-tertiary);
  }

  &:active {
    transform: scale(0.95);
  }
`;

export const IconSelectWrapper = styled.div`
  position: relative;
  flex: 1;
`;

export const IconTrigger = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.6rem 0.8rem;
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--color-text-tertiary);
    background-color: var(--color-bg-hover);
  }
`;

export const SelectedIcon = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;

  span {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--color-text-main);
  }
`;

export const IconPreview = styled.div<{ $color: string }>`
  font-size: 1.4rem;
  color: ${(props) => props.$color};
  display: flex;
  align-items: center;
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
  width: ${(p) => (p.$width ? `${p.$width}px` : "auto")};
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  z-index: 20000; /* Максимальний пріоритет */
  padding: 0.8rem;
  animation: fadeIn 0.1s ease-out;

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

export const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.6rem;
  width: 210px;
`;

export const ColorOption = styled.button<{
  $color: string;
  $isActive: boolean;
}>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${(props) => props.$color};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s;
  padding: 0;

  /* Фікс конфлікту hover/active */
  border: 2px solid
    ${(props) => (props.$isActive ? "var(--color-text-main)" : "transparent")};
  outline: 2px solid
    ${(props) => (props.$isActive ? "var(--color-bg-surface)" : "transparent")};
  outline-offset: -4px;

  &:hover {
    transform: scale(1.15);
    border-color: ${(p) =>
      p.$isActive ? "var(--color-text-main)" : "rgba(0,0,0,0.2)"};
  }

  svg {
    color: white;
    width: 14px;
    height: 14px;
    filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.4));
  }
`;

export const IconGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(36px, 1fr));
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: 10px;
  }
`;

export const IconOption = styled.button<{ $active: boolean }>`
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0;
  transition: all 0.2s;

  background-color: ${(props) =>
    props.$active ? "var(--color-brand-100)" : "transparent"};
  color: ${(props) =>
    props.$active ? "var(--color-brand-700)" : "var(--color-text-secondary)"};
  border: 1px solid
    ${(props) =>
      props.$active ? "var(--color-brand-500)" : "var(--color-border)"};

  &:hover {
    background-color: ${(p) =>
      p.$active ? "var(--color-brand-200)" : "var(--color-bg-hover)"};
    color: var(--color-text-main);
    transform: scale(1.05);
  }
`;
