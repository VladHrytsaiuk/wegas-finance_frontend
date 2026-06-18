import styled from "styled-components";

export const PageWrapper = styled.div`
  width: 100%;
`;

export const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  width: 100%;
`;

export const Title = styled.h2`
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0;
`;

export const HeaderActions = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-shrink: 0;
`;

export const ControlsRow = styled.div`
  margin-bottom: 0;
`;

export const TreeContainer = styled.div`
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 0.5rem;
  min-height: 200px;
`;

// Стилі для вмісту модальних вікон
export const ModalContent = styled.div`
  width: 500px;
  max-width: 100%;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const ModalTitle = styled.h3`
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  color: var(--color-text-main);
`;
