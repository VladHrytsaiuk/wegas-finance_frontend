import { Link } from "react-router-dom";
import styled from "styled-components";

export const PageContainer = styled.div`
  width: 100%;
  padding: 0 1.5rem 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const TopNav = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem; /* Зменшили gap, щоб круглі кнопки стояли гарно */
  padding: 0.5rem 0;
  flex-wrap: wrap;
`;

export const BackButton = styled.button`
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    background: var(--color-bg-hover);
    color: var(--color-text-main);
  }
`;

export const ActionButton = styled.button<{ $variant?: "danger" }>`
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: ${(p) =>
    p.$variant === "danger"
      ? "var(--color-red-600)"
      : "var(--color-text-secondary)"};
  white-space: nowrap;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  transition: all 0.2s;

  /* Легкий фон при наведенні на десктопі */
  &:hover {
    background: ${(p) =>
      p.$variant === "danger"
        ? "var(--color-red-50)"
        : "var(--color-bg-hover)"};
  }

  /* 🔥 На мобільному перетворюємо їх на круглі кнопки, як BackButton */
  @media (max-width: 991px) {
    width: 40px;
    height: 40px;
    padding: 0;
    border-radius: 50%;
    background: var(--color-bg-surface);
    /* Червона рамка для видалення, звичайна для інших */
    border: 1px solid
      ${(p) =>
        p.$variant === "danger"
          ? "var(--color-red-200)"
          : "var(--color-border)"};
    box-shadow: var(--shadow-sm);

    span {
      display: none;
    }
  }
`;

/* 🔥 НЕЗЛАМНА СІТКА ЧЕРЕЗ GRID AREAS */
export const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 340px minmax(0, 1fr);
  grid-template-areas:
    "left right-stats"
    "left right-content";
  gap: 1.5rem 2rem;
  align-items: start;
  width: 100%;

  /* 1. Статистика перестрибує наверх, даючи сумам 100% ширини екрана */
  @media (max-width: 1400px) {
    grid-template-columns: 340px minmax(0, 1fr);
    grid-template-areas:
      "top-stats top-stats"
      "left right-content";
  }

  /* 2. Історія транзакцій більше не стискається — все стає в 1 колонку */
  @media (max-width: 1200px) {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      "top-stats"
      "left"
      "right-content";
  }
`;

export const StatsArea = styled.div`
  grid-area: right-stats;
  width: 100%;
  min-width: 0;

  @media (max-width: 1400px) {
    grid-area: top-stats;
  }
`;

export const LeftColumn = styled.div`
  grid-area: left;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: sticky;
  top: 1rem;
  min-width: 0;

  @media (max-width: 1200px) {
    position: static;
  }
`;

export const RightColumn = styled.div`
  grid-area: right-content;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  min-width: 0;
  width: 100%;
`;

export const SectionBox = styled.div`
  background: var(--color-bg-surface);
  border-radius: 16px;
  border: 1px solid var(--color-border);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  /* gap: 1.5rem; */
  min-width: 0;
  width: 100%;
`;

export const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;

  h2 {
    font-size: 1.1rem;
    margin: 0;
    color: var(--color-text-main);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const TextButton = styled.button`
  background: none;
  border: none;
  color: var(--color-text-light);
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  transition: color 0.2s;
  white-space: nowrap;

  &:hover {
    color: var(--color-brand-600);
  }
`;

export const InfoCard = styled.div`
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1rem 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const InfoLabel = styled.span`
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-secondary);
  font-weight: 600;
`;

export const InfoValue = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  svg {
    color: var(--color-brand-600);
    flex-shrink: 0;
  }
`;

export const GoalWidgetLink = styled(Link)`
  text-decoration: none;
  display: block;
`;

export const GoalWidget = styled.div<{ $color: string }>`
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-left: 4px solid ${(props) => props.$color};
  border-radius: 12px;
  padding: 1rem;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
`;

export const GoalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
  gap: 1rem;
`;

export const GoalTitle = styled.div`
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--color-text-main);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  svg {
    flex-shrink: 0;
  }
`;

export const GoalAmount = styled.div`
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  white-space: nowrap;
  flex-shrink: 0;

  span {
    color: var(--color-text-main);
    font-weight: 600;
  }
`;

export const ProgressBarBg = styled.div`
  width: 100%;
  height: 6px;
  background-color: var(--color-bg-page);
  border-radius: 3px;
  overflow: hidden;
`;

export const ProgressBarFill = styled.div<{ $width: number; $color: string }>`
  height: 100%;
  width: ${(props) => props.$width}%;
  background-color: ${(props) => props.$color};
  border-radius: 3px;
  transition: width 0.5s ease-out;
`;

export const GoalFooter = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
`;

export const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: var(--color-bg-surface);
  border-radius: 24px;
  border: 1px solid var(--color-border);
  margin-top: 2rem;
  text-align: center;
  box-shadow: var(--shadow-sm);
`;

export const ErrorIconBox = styled.div`
  width: 80px;
  height: 80px;
  background-color: var(--color-red-50);
  color: var(--color-red-600);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  svg {
    width: 40px;
    height: 40px;
  }
`;

export const ErrorTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin-bottom: 0.5rem;
`;

export const ErrorDescription = styled.p`
  color: var(--color-text-secondary);
  font-size: 1rem;
  max-width: 300px;
  line-height: 1.5;
  margin-bottom: 2rem;
`;

export const ErrorActions = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
`;

export const LoadingContainer = styled.div`
  width: 100%;
  height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 1.5rem;
`;
