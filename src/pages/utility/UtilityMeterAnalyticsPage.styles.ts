import styled from "styled-components";

export const PageContainer = styled.div`
  padding: 0 2rem 2rem 2rem;
  width: 100%;
  max-width: none;
  margin: 0;
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
    font-size: 1.8rem;
    color: var(--color-grey-800);
    display: flex;
    align-items: center;
    gap: 10px;
  }
`;

export const HeaderBadge = styled.span`
  font-size: 0.9rem;
  background: var(--color-brand-100);
  color: var(--color-brand-700);
  padding: 4px 10px;
  border-radius: 100px;
  font-weight: 600;
`;

export const ChartCard = styled.div`
  background: white;
  border-radius: 24px;
  padding: 2rem;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-grey-100);
  height: 550px;
  margin-bottom: 2rem; /* Додано відступ знизу для розділення графіків */
  display: flex;
  flex-direction: column;
`;

// Спеціальна обгортка для центрування тексту, коли немає даних
export const EmptyStateWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  color: var(--color-grey-500);
  font-size: 1rem;
`;
