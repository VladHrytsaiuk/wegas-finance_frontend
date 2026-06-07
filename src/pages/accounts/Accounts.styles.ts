import styled from "styled-components";

export const PageContainer = styled.div`
  margin: 0 auto;
  width: 100%;
  padding-bottom: 4rem;
`;

export const ControlsRow = styled.div`
  margin-bottom: 0;
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 4rem;
  color: var(--color-text-secondary);
  background: var(--color-bg-surface);
  border-radius: 12px;
  border: 1px solid var(--color-border);

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

export const EmptyStateIcon = styled.div`
  fontsize: 3rem;
`;

export const ControlsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const LoadingState = styled.div`
  padding: 3rem;
  text-align: center;
`;

export const ErrorState = styled.div`
  padding: 3rem;
  color: var(--color-red-600);
  text-align: center;
`;
