import styled, { css } from "styled-components";

// --- LAYOUT & CONTAINERS ---

export const Container = styled.div`
  width: 100%;
`;

export const Layout = styled.div<{ $hasImage: boolean }>`
  display: grid;
  grid-template-columns: ${(props) => (props.$hasImage ? "35% 1fr" : "1fr")};
  gap: 3rem;
  align-items: start;

  @media (max-width: 1100px) {
    grid-template-columns: ${(props) =>
      props.$hasImage ? "300px 1fr" : "1fr"};
    gap: 2rem;
  }

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

export const ImageSide = styled.div`
  position: sticky;
  top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (max-width: 900px) {
    position: static;
    order: -1;
    width: 100%;
  }
`;

export const ViewerWrapper = styled.div`
  height: 100%;
  min-height: 500px;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  background: #000;
  box-shadow: var(--shadow-sm);

  @media (max-width: 900px) {
    max-height: 500px;
  }
`;

export const ContentSide = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  min-width: 0;
`;

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

// --- HEADER ---

export const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px dashed var(--color-border);
`;

export const TypeBadge = styled.span`
  text-transform: uppercase;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  padding: 4px 8px;
  border-radius: 6px;
`;

export const AmountDisplay = styled.div<{ $type: string }>`
  font-size: 3.5rem;
  font-weight: 800;
  font-family: "JetBrains Mono", monospace;
  line-height: 1;
  letter-spacing: -1.5px;
`;

export const DateText = styled.div`
  color: var(--color-text-secondary);
  font-size: 0.9rem;
`;

// --- EXCHANGE & CURRENCY ---

export const ExchangeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: var(--color-bg-surface-secondary);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
`;

export const ExchangeRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const ExchangeBox = styled.div<{ $isCurrent: boolean }>`
  display: flex;
  flex-direction: column;
  padding: 0.5rem 0.8rem;
  border-radius: 8px;
  transition: background 0.2s;

  ${(p) =>
    p.$isCurrent &&
    css`
      background: var(--color-bg-surface);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      border: 1px solid var(--color-border);
    `}

  .label {
    font-size: 0.75rem;
    color: var(--color-text-tertiary);
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .val {
    font-size: 1.1rem;
    font-weight: 700;
    font-family: "Monaco", monospace;
  }

  &.out .val {
    color: var(--color-red-600);
  }
  &.in {
    align-items: flex-end;
  }
  &.in .val {
    color: var(--color-green-600);
  }
`;

export const ExchangeRateBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: var(--color-bg-surface);
  padding: 4px 10px;
  border-radius: 20px;
  border: 1px solid var(--color-border);
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  align-self: center;
`;

// --- DETAILS LIST ---

export const DetailsList = styled.div`
  display: flex;
  flex-direction: column;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
`;

export const DetailRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);

  &:last-child {
    border-bottom: none;
  }
`;
export const RowIcon = styled.div<{ $color: string; $hasImage?: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;

  /* Фон тільки для іконок, для лого — прозоро */
  background: ${(p) => (p.$hasImage ? "transparent" : `${p.$color}20`)};

  /* Рамка для логотипів банку */
  border: 1px solid
    ${(p) => (p.$hasImage ? "var(--color-border)" : "transparent")};

  color: ${(p) => p.$color};

  /* 👇 ДОДАЄМО СТИЛІ ДЛЯ КАРТИНКИ (КОНТРАГЕНТА) 👇 */
  img {
    width: 32px;
    height: 32px;
    object-fit: contain;
    border-radius: 6px;
    display: block;
    /* 1. Змушує Chrome/Safari рендерити чіткіше */
    image-rendering: -webkit-optimize-contrast;

    /* 2. Іноді допомагає 'crisp-edges', але може зробити краї занадто різкими */
    /* image-rendering: crisp-edges; */

    /* 3. Хак для GPU, щоб уникнути субпіксельного розмиття при трансформаціях */
    transform: translateZ(0);
    backface-visibility: hidden;
  }
`;

export const RowContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;

  .label {
    font-size: 0.75rem;
    color: var(--color-text-tertiary);
    margin-bottom: 2px;
  }
  .value {
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--color-text-main);
  }
  .sub-value {
    font-size: 0.8rem;
    color: var(--color-text-secondary);
  }
`;

// --- NOTES & USER ---

export const NoteBox = styled.div`
  margin-top: 0.5rem;
  padding: 1.2rem 1.5rem;
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  font-size: 1rem;
  font-style: italic;
  color: var(--color-text-secondary);
  line-height: 1.6;
`;

export const UserInfo = styled.div`
  margin-top: 1rem;
  padding-top: 0.8rem;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
`;

export const UserName = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--color-text-main);
  font-weight: 500;
`;

// --- ITEMS TABLE ---

export const SectionTitle = styled.h4`
  font-size: 0.85rem;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
  margin-bottom: 0.5rem;
  font-weight: 700;
  letter-spacing: 0.5px;
`;

export const ItemsTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.95rem;

  th {
    text-align: left;
    font-weight: 600;
    color: var(--color-text-secondary);
    padding: 0.8rem 1rem;
    border-bottom: 1px solid var(--color-border);
    background: var(--color-bg-surface-secondary);
  }
  th:first-child {
    border-top-left-radius: 8px;
  }
  th:last-child {
    border-top-right-radius: 8px;
  }

  td {
    padding: 0.8rem 1rem;
    border-bottom: 1px solid var(--color-border);
    vertical-align: top;
  }
  tr:last-child td {
    border-bottom: none;
  }
`;

// --- BUTTONS ---

export const DeleteOverlayButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.05);
  color: var(--color-red-600);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(4px);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;

  &:hover {
    background: #fee2e2;
    transform: scale(1.1) rotate(5deg);
    color: #ef4444;
    box-shadow: 0 6px 16px rgba(239, 68, 68, 0.2);
  }
  &:active {
    transform: scale(0.95);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
export const TagsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
`;

export const TagChip = styled.div<{ $color?: string }>`
  display: flex;
  align-items: center;
  gap: 4px;

  /* 🔥 МАГІЯ КОЛЬОРІВ: */
  /* Фон: беремо колір тегу і робимо його напівпрозорим (90% прозорості) */
  background-color: ${(props) =>
    props.$color
      ? `color-mix(in srgb, ${props.$color}, transparent 90%)`
      : "var(--color-bg-secondary)"};

  /* Текст: використовуємо оригінальний колір */
  color: ${(props) => props.$color || "var(--color-text-secondary)"};

  /* Рамка: трохи менш прозора версія кольору */
  border: 1px solid
    ${(props) =>
      props.$color
        ? `color-mix(in srgb, ${props.$color}, transparent 80%)`
        : "var(--color-border)"};

  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600; /* Трохи жирніше, щоб кольоровий текст читався краще */

  svg {
    /* Іконка теж фарбується в колір тексту */
    opacity: 0.8;
  }
`;
