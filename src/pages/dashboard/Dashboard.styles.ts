import styled, { css, keyframes } from "styled-components";

// Додаємо інтерфейс для isMounted
export const DashboardContainer = styled.div<{
  $isEditMode?: boolean;
  $isMounted?: boolean;
}>`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  scrollbar-gutter: stable;

  .react-grid-placeholder {
    background: var(--color-brand-100) !important;
    border-radius: 12px;
    opacity: 0.4;
  }

  .react-resizable-handle {
    background-image: none;
    z-index: 50;
    display: ${(p) => (p.$isEditMode ? "block" : "none !important")};
    &::after {
      content: "";
      position: absolute;
      right: 5px;
      bottom: 5px;
      width: 10px;
      height: 10px;
      border-right: 3px solid var(--color-text-tertiary);
      border-bottom: 3px solid var(--color-text-tertiary);
      border-radius: 1px;
      cursor: nwse-resize;
    }
  }

  /* 🔥 ГОЛОВНИЙ ФІКС ПОЛЬОТІВ (CSS SILENCER) */
  /* За замовчуванням (поки не завантажилось) вимикаємо ВСІ анімації сітки */
  .react-grid-item {
    transition: none !important;
  }

  /* Коли компонент змонтований ($isMounted=true), вмикаємо анімації назад */
  ${(p) =>
    p.$isMounted &&
    css`
      .react-grid-item.cssTransforms {
        transition-property: transform;
        transition-duration: 200ms; /* Стандартна швидкість бібліотеки */
      }
    `}
`;

// ... FilterBar, EditButton без змін ...
export const FilterBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
`;
export const EditButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${(p) =>
    p.$active ? "var(--color-brand-600)" : "var(--color-bg-surface)"};
  color: ${(p) => (p.$active ? "#ffffff" : "var(--color-text-main)")};
  border: 1px solid
    ${(p) => (p.$active ? "transparent" : "var(--color-border)")};
  padding: 8px 16px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: var(--shadow-sm);
  &:hover {
    background: ${(p) =>
      p.$active ? "var(--color-brand-700)" : "var(--color-bg-hover)"};
  }
`;
export const ButtonLabel = styled.span`
  @media (max-width: 600px) {
    display: none;
  }
`;
const shakeAnimation = keyframes`
  0% { transform: rotate(0deg); }
  25% { transform: rotate(0.3deg); }
  50% { transform: rotate(0deg); }
  75% { transform: rotate(-0.3deg); }
  100% { transform: rotate(0deg); }
`;
export const GridItemContainer = styled.div`
  width: 100%;
  height: 100%;
  z-index: 1;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  &.static-mode {
    touch-action: auto !important;
    user-select: auto !important;
  }
`;

export const WidgetInnerContainer = styled.div<{ $isEditMode: boolean }>`
  width: 100%;
  height: 100%;
  position: relative;
  /* 🔥 ФІКС 2: Прибираємо transition: all, бо він конфліктує з переміщенням батька */
  transition:
    box-shadow 0.2s,
    background-color 0.2s;
  background: transparent;
  overflow: hidden;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  container-type: size;

  ${(p) =>
    p.$isEditMode &&
    css`
      animation: ${shakeAnimation} 0.4s infinite ease-in-out;
      z-index: 10;
    `}
`;

export const DragOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 20;
  cursor: grab;
  border-radius: 12px;
  box-shadow:
    0 0 0 2px var(--color-brand-400),
    inset 0 0 20px rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  &:active {
    cursor: grabbing;
    background: rgba(255, 255, 255, 0.2);
  }
`;
