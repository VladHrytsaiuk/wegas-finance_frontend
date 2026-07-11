import styled from "styled-components";

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  height: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem 2rem;

  @media (max-width: 768px) {
    gap: 1rem;
    padding: 0 1rem 2rem;
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.25rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

export const HeaderMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
`;

export const HeaderTitle = styled.h1`
  font-size: 1.6rem;
  line-height: 1.1;
  color: var(--color-text-main);
`;

export const HeaderMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

export const HeaderMetaChip = styled.div`
  padding: 0.45rem 0.7rem;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-surface);
  color: var(--color-text-secondary);
  font-size: 0.78rem;
  font-weight: 600;
  box-shadow: var(--shadow-sm);
`;

export const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-secondary);
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.5rem 0;
  transition: color 0.2s;

  &:hover {
    color: var(--color-brand-600);
  }
`;

export const Card = styled.div`
  background-color: var(--color-bg-surface);
  border-radius: 20px;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-md);
  width: 100%;
  padding: 1.5rem;

  @media (max-width: 768px) {
    padding: 1rem;
    border-radius: 16px;
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

export const MobileHeaderSpacer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.75rem;
  padding: 0 1rem;
`;

export const MobileMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

export const MobileActionButton = styled.button`
  width: 42px;
  height: 42px;
  padding: 0;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-surface);
  color: var(--color-red-600);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    color: var(--color-text-secondary);
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

export const NotFoundContainer = styled.div`
  text-align: center;
  margin-top: 4rem;
  color: var(--color-text-secondary);

  h3 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
    color: var(--color-text-main);
  }
`;

export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20%;
`;
