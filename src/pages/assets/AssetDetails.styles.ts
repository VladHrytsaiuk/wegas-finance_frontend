import styled, { css } from "styled-components";

// --- LAYOUT ---
export const PageContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding-bottom: 3rem;
`;

// --- HEADER ---
export const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1.5rem;
`;

export const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

export const HeaderActions = styled.div`
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
`;

export const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  width: fit-content;
  padding: 0;
  transition: color 0.2s;
  &:hover {
    color: var(--color-brand-600);
  }
`;

export const AssetTitleBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--color-text-main);
    margin: 0;
    line-height: 1.2;

    font-size: 1.4rem;
  
  }
`;

export const AssetTypeBadge = styled.span`
  background-color: var(--color-brand-50);
  color: var(--color-brand-700);
  padding: 0.25rem 0.75rem;
  border-radius: 99px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: capitalize;
  white-space: nowrap;
`;

// --- GRIDS ---
export const TopGrid = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 1.5rem;
  align-items: stretch;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

export const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  align-items: stretch;

  @media (max-width: 1150px) {
    grid-template-columns: 1fr;
  }
`;

// --- CARDS ---
export const StyledCard = styled.div<{
  $noPadding?: boolean;
  $isInactive?: boolean;
}>`
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: ${(p) => (p.$noPadding ? "0" : "1.5rem")};
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  box-shadow: var(--shadow-sm);
  height: 100%;
  min-width: 0;

  padding: ${(p) => (p.$noPadding ? "0" : "1.1rem")};
  gap: 1rem;
  border-radius: 12px;

  ${(p) =>
    p.$isInactive &&
    css`
      filter: grayscale(100%) opacity(0.5);
      pointer-events: none;
      justify-content: center;
      align-items: center;
      min-height: 150px;
    `}
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  color: var(--color-text-main);
  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;

    font-size: 0.95rem;
  
  }
  svg {
    color: var(--color-brand-600);
    flex-shrink: 0;

    width: 18px;
    height: 18px;
  
  }
`;

export const CardHeaderPadded = styled.div`
  padding: 1.5rem 1.5rem 0.5rem;
`;

// --- DATA BLOCKS ---
export const MainValueBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-border);

  padding-bottom: 1rem;
  gap: 0.3rem;

  .label {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--color-text-secondary);

    font-size: 0.8rem;
  
  }

  .value {
    font-size: clamp(1.5rem, 3vw, 2.2rem);
    font-weight: 800;
    color: var(--color-green-600);
    font-family: "JetBrains Mono", monospace;
    letter-spacing: -0.03em;
    line-height: 1;
    word-wrap: break-word;

    font-size: 1.8rem;
  
  }
`;

export const MetaDataGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;

  gap: 1rem;
`;

export const MetaItem = styled.div<{ $fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 0;

  gap: 0.2rem;
...
  .icon-label {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.025em;
    white-space: nowrap;

    font-size: 0.7rem;
  

    svg {
      flex-shrink: 0;
      width: 14px;
      height: 14px;
    
    }
  }

  .data {
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text-main);
    word-wrap: break-word;

    font-size: 0.9rem;
  
  }
`;

export const MonoData = styled.div`
  font-family: "JetBrains Mono", monospace;
  letter-spacing: 1px;
  word-wrap: break-word;
`;

// --- TCO (Total Cost of Ownership) ---
export const TCOWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  height: 100%;

  @media (max-width: 1150px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  @media (max-width: 991px) {
    flex-direction: column;
    align-items: stretch;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const TCOBreakdown = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  flex: 1;
`;

export const TCORow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.6rem;
  border-bottom: 1px dashed var(--color-border);
  gap: 1rem;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .label-group {
    display: flex;
    align-items: center;
    font-size: 0.9rem;
    color: var(--color-text-secondary);
    font-weight: 500;

    font-size: 0.8rem;
  
  }

  .value {
    font-family: "JetBrains Mono", monospace;
    font-weight: 600;
    font-size: 1.05rem;
    color: var(--color-text-main);
    text-align: right;
    white-space: nowrap;

    font-size: 0.9rem;
  
  }

  .expense {
    color: var(--color-red-600);
  }
`;

export const TCOTotal = styled.div`
  background-color: var(--color-brand-50);
  border-radius: 10px;
  padding: 1.2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  border: 1px solid var(--color-brand-100);
  margin-top: auto;
  flex: 1;

  padding: 0.75rem 1rem;

  /* 🔥 Переводимо контент плашки в колонку, коли місця стає мало */
  @media (max-width: 1150px) {
    flex-direction: column;
    align-items: flex-start; /* Вирівнюємо по лівому краю */
    justify-content: center;
    gap: 0.5rem;
  }

  @media (max-width: 991px) {
    flex-direction: row;
    justify-content: space-between;
    gap: 0.5rem;
  }

  /* Для мобілок (коли ТСО стає на всю ширину), можна центрувати або залишити зліва. Залишимо зліва для акуратності */
  @media (max-width: 768px) {
    align-items: flex-start;
  }

  .label {
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--color-brand-700);
    text-transform: uppercase;
    letter-spacing: 0.05em;

    font-size: 0.75rem;
  
  }

  .value {
    font-family: "JetBrains Mono", monospace;
    font-size: clamp(1.2rem, 1.8vw, 1.4rem);
    font-weight: 800;
    color: var(--color-brand-700);
    white-space: nowrap; /* 🔥 Гарантує, що пробіли в сумі не розірвуться */

    font-size: 1.2rem;
  
  }
`;

// --- PHOTOS ---
export const PhotoContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 200px; /* Трохи зменшили */
  border-radius: inherit;
  overflow: hidden;
  background-color: var(--color-bg-page);
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: absolute;
    top: 0;
    left: 0;
  }
`;

export const PhotoPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: var(--color-text-tertiary);
  font-weight: 500;
  z-index: 1;

  /* Стилізація як на сторінці цілей */
  .icon-box {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    background-color: var(--color-bg-surface-secondary);
    border: 1px solid var(--color-border);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-tertiary);
    font-size: 2rem;
    box-shadow: var(--shadow-sm);

    width: 48px;
    height: 48px;
    border-radius: 12px;
    font-size: 1.5rem;
  
  }

  span {
    font-size: 0.9rem;
    opacity: 0.8;

    font-size: 0.8rem;
  
  }
`;

export const PhotoOverlayBtn = styled.div`
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  z-index: 2;
  display: flex;
  gap: 0.5rem;

  button {
    backdrop-filter: blur(4px);
    opacity: 0.9;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

export const PhotoCountBadge = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 99px;
  font-size: 0.85rem;
  font-weight: 600;
  backdrop-filter: blur(4px);
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

// --- WARRANTY ---
export const WarrantyContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
`;

export const WarrantyInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  align-items: flex-start;
`;

export const WarrantyMainDate = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;

  .label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .value {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-text-main);

    font-size: 1.1rem;
  
  }
`;

export const WarrantyStatusBadge = styled.div<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0;
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;

  ${(p) =>
    p.$color === "red" &&
    css`
      color: var(--color-red-600);
    `}
  ${(p) =>
    p.$color === "green" &&
    css`
      color: var(--color-green-600);
    `} 
  ${(p) =>
    p.$color === "orange" &&
    css`
      color: var(--color-yellow-600);
    `}
`;

export const WarrantyProgressBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-top: auto; /* Притискає прогрес бар вниз */
`;

export const ProgressBar = styled.div`
  width: 100%;
  height: 10px; /* Трохи товщий */
  background-color: var(--color-bg-page);
  border-radius: 99px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
  position: relative;
`;

export const ProgressFill = styled.div<{ $percent: number; $color: string }>`
  height: 100%;
  width: ${(p) => Math.max(0, Math.min(100, p.$percent || 0))}% !important;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 4px; /* Гарантуємо видимість якщо > 0 */
  
  /* Fallback color */
  background-color: var(--color-brand-600);

  ${(p) =>
    p.$color === "red" &&
    css`
      background-color: var(--color-error);
    `}
  ${(p) =>
    p.$color === "green" &&
    css`
      background-color: var(--color-green-600);
    `} 
  ${(p) =>
    p.$color === "orange" &&
    css`
      background-color: var(--color-warning);
    `}
`;

export const ProgressLabels = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
  font-weight: 500;
`;

// --- 🔥 DOCUMENTS (Окремий блок на всю ширину) ---
export const DocumentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
`;
export const DocumentItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.85rem;
  background-color: var(--color-bg-page);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  transition: border-color 0.2s;

  &:hover {
    border-color: var(--color-brand-300);
  }

  .doc-info {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--color-text-main);
...

    overflow: hidden; /* Щоб довгі імена обрізались */

    svg {
      color: var(--color-red-500);
      flex-shrink: 0;
    }
  }

  .doc-actions {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
  }
`;

export const DocName = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const InactiveMessage = styled.span`
  color: var(--color-text-tertiary);
  font-weight: 500;
  text-align: center;
  margin: auto; /* Щоб центрувалось по вертикалі */
`;

// --- HISTORY ---
export const EmptyHistoryState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: var(--color-text-tertiary);
  font-weight: 500;
  gap: 1rem;
  text-align: center;

  svg {
    color: var(--color-border);
  }
`;

export const ViewerWrapper = styled.div`
  width: 90vw;
  max-width: 1200px;
  height: 85vh;
  margin: -2.4rem;
  border-radius: 8px;
  overflow: hidden;
  background-color: #1e1e1e;
  position: relative;
`;

export const NotFoundState = styled(PageContainer)`
  align-items: center;
  padding-top: 15vh;
  text-align: center;

  h2 {
    color: var(--color-text-secondary);
    margin-bottom: 1rem;
  }
`;
