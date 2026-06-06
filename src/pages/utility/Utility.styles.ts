import styled from "styled-components";

export const PageContainer = styled.div`
  padding: 0 2rem 2rem 2rem;
  width: 100%;
  margin: 0;
`;

// Контейнер для груп (наприклад: "Квартира Львів")
export const GroupSection = styled.div`
  margin-bottom: 2.5rem;
`;

export const GroupHeader = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-main);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: var(--color-border);
    margin-left: 1rem;
  }
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.5rem;
`;

// --- ОНОВЛЕНА КАРТКА ---
export const MeterCard = styled.div`
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 1.25rem;
  transition: all 0.2s ease-in-out;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  cursor: pointer;

  &:hover {
    border-color: var(--color-brand-500);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
  }
`;

export const CardTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

export const IconBadge = styled.div<{ $color?: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${(props) =>
    props.$color
      ? `${props.$color}15`
      : "var(--color-bg-secondary)"}; /* 15 = 10% opacity hex */
  color: ${(props) => props.$color || "var(--color-brand-600)"};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

export const Actions = styled.div`
  display: flex;
  gap: 0.25rem;
`;

export const ActionButton = styled.button`
  background: transparent;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: var(--color-bg-hover);
    color: var(--color-text-main);
  }

  &.danger:hover:not(:disabled) {
    background: #fee2e2;
    color: #ef4444;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
    filter: grayscale(1);
  }
`;

export const CardContent = styled.div`
  flex: 1;
`;

export const MeterTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text-main);
  margin-bottom: 0.25rem;
`;

export const MeterSubtitle = styled.p`
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const MainStat = styled.div`
  margin-top: 1rem;
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
`;

export const StatValue = styled.span`
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text-main);
  font-variant-numeric: tabular-nums;
`;

export const StatUnit = styled.span`
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-text-secondary);
`;

// --- НОВИЙ ЕЛЕМЕНТ: БОРГ ---
export const DebtBadge = styled.div`
  margin-top: 0.75rem;
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background-color: var(--color-red-50);
  color: var(--color-red-600);
  border: 1px solid var(--color-red-200);
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
`;

export const Divider = styled.div`
  height: 1px;
  background: var(--color-border);
  margin: 1rem 0;
`;

// --- ОНОВЛЕНИЙ ФУТЕР ---
export const Footer = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;

  /* Стилі для блоку тарифу */
  .label {
    font-size: 0.8rem;
    color: var(--color-text-secondary);
  }
  .val {
    font-weight: 600;
    color: var(--color-text-main);
  }
`;

export const FooterActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const EmptyState = styled.div`
  padding: 3rem 1.5rem;
  text-align: center;
  background: var(--color-bg-surface);
  border-radius: 16px;
  border: 1px dashed var(--color-border);

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.2rem;
  min-width: 500px;
  max-width: 600px;
  margin: 2rem auto;

  h3 {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--color-text-main);
    margin: 0;
  }

  p {
    font-size: 0.9rem;
    color: var(--color-text-secondary);
    line-height: 1.5;
    max-width: 320px;
    margin: 0;
  }
`;

export const EmptyIconWrapper = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: var(--color-brand-50);
  color: var(--color-brand-500);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;

  svg {
    width: 32px;
    height: 32px;
  }
`;
