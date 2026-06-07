import styled, { css } from "styled-components";

// --- ЛЕЙАУТ ---
export const PageContainer = styled.div`
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 0 0 3rem 0;
`;

export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
  width: 100%;
`;

export const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
  color: var(--color-text-secondary);
  text-align: center;
`;

export const NotFoundIcon = styled.div`
  margin-bottom: 1rem;
  opacity: 0.3;

  svg {
    width: 64px;
    height: 64px;
  }
`;

// --- ХЕДЕР ---
export const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1.25rem;
  margin-bottom: 0.5rem;
`;

export const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

export const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s;
  padding: 0;

  &:hover {
    color: var(--color-brand-600);
  }
`;

export const GoalTitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  .title-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  h1 {
    font-size: 1.8rem;
    font-weight: 800;
    color: var(--color-text-main);
    margin: 0;
    line-height: 1.1;

    @media (max-width: 1300px) {
      font-size: 1.4rem;
    }
  }
`;

export const StatusBadge = styled.div<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-md);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transform: translateY(2px);

  ${(p) =>
    p.$status === "active" &&
    css`
      background-color: var(--color-brand-50);
      color: var(--color-brand-700);
      border: 1px solid var(--color-brand-100);
    `}

  ${(p) =>
    p.$status === "paused" &&
    css`
      background-color: var(--color-yellow-50);
      color: var(--color-yellow-600);
      border: 1px solid var(--color-yellow-100);
    `}

  ${(p) =>
    p.$status === "reached" &&
    css`
      background-color: var(--color-brand-50);
      color: var(--color-brand-600);
      border: 1px solid var(--color-brand-100);
    `}

  ${(p) =>
    p.$status === "failed" &&
    css`
      background-color: var(--color-red-50);
      color: var(--color-red-600);
      border: 1px solid var(--color-red-100);
    `}
`;

export const IconBox = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: var(--color-bg-page);
  border: 1px solid var(--color-border);
  color: ${(p) => p.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  flex-shrink: 0;

  @media (max-width: 1300px) {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    font-size: 1.4rem;
  }
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

export const ResumeButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  border: 1px solid var(--color-green-600);
  background-color: var(--color-green-100);
  color: var(--color-green-700);
  transition: all 0.2s;

  &:hover {
    background-color: var(--color-green-200);
    transform: translateY(-1px);
  }
  &:active {
    transform: translateY(0);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// --- СІТКИ ---
export const TopGrid = styled.div`
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 1.5rem;
  width: 100%;
  margin-bottom: 1.5rem;

  /* 🔥 ФІКСОВАНА ВИСОТА БЛОКУ (щоб обидва були однакові) */
  height: 420px;

  @media (max-width: 1300px) {
    height: 360px;
    gap: 1.25rem;
  }

  @media (max-width: 1000px) {
    grid-template-columns: 1fr;
    height: auto;
  }
`;

export const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  width: 100%;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const StyledCard = styled.div<{ $noPadding?: boolean }>`
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: ${(p) => (p.$noPadding ? "0" : "1.25rem")};
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;

  /* Розтягуємося на всю висоту батька (TopGrid) */
  height: 100%;
  overflow: hidden;
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border);

  h3 {
    font-size: 1rem;
    font-weight: 700;
    color: var(--color-text-main);
    margin: 0;
  }

  svg {
    color: var(--color-brand-600);
    width: 18px;
    height: 18px;
  }
`;

export const AccountHeaderWrapper = styled.div`
  padding: 1.5rem 2rem 0.5rem;

  ${CardHeader} {
    margin-bottom: 0;
    border-bottom: none;
    padding-bottom: 0;
  }
`;

export const MainValueBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1.25rem;

  .label {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--color-text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .value {
    font-size: 2.2rem;
    font-weight: 800;
    color: var(--color-brand-600);
    font-family: "JetBrains Mono", monospace;
    letter-spacing: -0.03em;
    line-height: 1;

    @media (max-width: 1300px) {
      font-size: 1.8rem;
    }
  }
`;

export const ProgressWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 1.25rem;

  .meta {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;

    span:first-child {
      font-family: "JetBrains Mono", monospace;
      font-weight: 800;
      font-size: 1.2rem;
      color: var(--color-text-main);
    }
    span:last-child {
      font-weight: 500;
      color: var(--color-text-tertiary);
      font-size: 0.8rem;
    }
  }
`;

export const ProgressBar = styled.div`
  width: 100%;
  height: 14px;
  background-color: var(--color-border);
  border-radius: 99px;
  overflow: hidden;
  position: relative;
`;

export const ProgressFill = styled.div<{ $percent: number; $color: string }>`
  height: 100%;
  width: ${(p) => Math.min(p.$percent, 100)}%;
  background-color: ${(p) => p.$color};
  border-radius: 99px;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
`;

export const MetaDataGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
  margin-top: auto;
`;

export const MetaItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  .icon-label {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--color-text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.05em;

    svg {
      width: 14px;
      height: 14px;
    }
  }

  .data {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--color-text-main);
  }

  a {
    font-weight: 600;
    color: var(--color-brand-600);
    transition: opacity 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    &:hover {
      opacity: 0.8;
    }
  }
`;

export const MetaSpacer = styled(MetaItem)`
  margin-top: 1rem;
`;

export const DeadlineValue = styled.span<{
  $status: "normal" | "warning" | "error";
}>`
  color: ${(p) => {
    switch (p.$status) {
      case "error":
        return "var(--color-red-600)";
      case "warning":
        return "var(--color-warning-dark)";
      default:
        return "inherit";
    }
  }};
`;

export const DeadlineDate = styled.span`
  font-size: 0.8rem;
  color: var(--color-text-tertiary);
`;

export const EmptyValue = styled.span`
  color: var(--color-text-tertiary);
  font-style: italic;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    width: 1rem;
    height: 1rem;
    opacity: 0.5;
  }
`;

// --- ФОТО ---
export const PhotoContainer = styled.div`
  width: 100%;

  /* 🔥 ЗАПОВНЮЄМО ВИСОТУ (яка задана батьком TopGrid) */
  flex: 1;
  height: 100%;

  background-color: var(--color-bg-page);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  /* Стилі для зуму */
  .react-transform-wrapper,
  .react-transform-component {
    width: 100% !important;
    height: 100% !important;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: contain; /* Фото вписується, не обрізаючись */
  }
`;

export const PhotoPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: var(--color-text-tertiary);
  height: 100%;
  width: 100%;

  svg {
    opacity: 0.3;
  }
  span {
    font-weight: 500;
  }
`;

// --- КОНТРОЛИ ДЛЯ ЗУМУ ---
export const ImageControls = styled.div`
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
  z-index: 10;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 0.4rem;
  border-radius: 99px;
  backdrop-filter: blur(4px);
`;

export const ControlButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.4);
    transform: scale(1.1);
  }
  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

// --- СПИСОК РАХУНКІВ ---
export const ScrollableList = styled.div`
  flex: 1;
  overflow-y: auto;
  min-height: 100px;
`;

export const AccountRowItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 2rem;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: background-color 0.2s;

  @media (max-width: 1300px) {
    padding: 0.8rem 1.25rem;
  }

  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background-color: var(--color-bg-page);
  }

  .acc-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    span {
      font-weight: 600;
      color: var(--color-text-main);
    }
  }

  .balance {
    font-family: "JetBrains Mono", monospace;
    font-weight: 700;
    font-size: 1.05rem;
    color: var(--color-text-main);

    @media (max-width: 1300px) {
      font-size: 0.95rem;
    }
  }
`;

export const ColorDot = styled.div<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  background-color: ${(p) => p.$color};
`;

export const EmptyStateSmall = styled.div`
  padding: 3rem;
  text-align: center;
  color: var(--color-text-tertiary);
  font-size: 0.95rem;
`;

export const CardFooter = styled.div`
  margin-top: auto;
  padding: 1.2rem 2rem;
  background-color: var(--color-bg-page);
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 1300px) {
    padding: 0.8rem 1.25rem;
  }

  span.label {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--color-text-secondary);
  }

  span.total {
    font-family: "JetBrains Mono", monospace;
    font-weight: 800;
    font-size: 1.1rem;
    color: var(--color-text-main);

    @media (max-width: 1300px) {
      font-size: 1rem;
    }
  }
`;
