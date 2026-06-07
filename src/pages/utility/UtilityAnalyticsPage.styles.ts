import styled from "styled-components";

export const PageContainer = styled.div`
  width: 100%;
  max-width: none;
  margin: 0;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

export const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  font-size: 1rem;
  color: var(--color-grey-600);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 1.5rem;
  padding: 0;

  &:hover {
    color: var(--color-brand-600);
    transform: translateX(-4px);
  }

  svg {
    width: 1.2rem;
    height: 1.2rem;
  }
`;

export const Header = styled.div`
  margin-bottom: 2rem;

  h1 {
    font-size: 2rem;
    font-weight: 800;
    color: var(--color-grey-800);
  }

  p {
    color: var(--color-grey-500);
    margin-top: 4px;
  }
`;

export const ChartCard = styled.div`
  background: white;
  border-radius: 24px;
  padding: 2rem;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-grey-100);
  height: 600px;
  display: flex;
  flex-direction: column;
  /* Для EmptyState позиціонування */
  position: relative;
`;

export const EmptyStateWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  color: var(--color-grey-500);
  text-align: center;
`;

export const SummaryCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

export const Card = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid var(--color-grey-100);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
`;

export const CardTitle = styled.h3`
  font-size: 0.85rem;
  color: var(--color-grey-500);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

// Використовуємо transient prop ($variant), щоб він не передавався в DOM
export const CardValue = styled.div`
  font-size: 1.8rem;
  font-weight: 800;
  color: ${(props) =>
    props.$variant === "neutral"
      ? "var(--color-grey-800)"
      : "var(--color-brand-600)"};
`;
