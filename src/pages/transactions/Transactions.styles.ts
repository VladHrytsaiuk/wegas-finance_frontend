import styled from "styled-components";

export const PageContainer = styled.div`
  margin: 0 auto;
  width: 100%;
  padding-bottom: 4rem;
  min-width: 0;

  position: relative;
`;

export const ControlsRow = styled.div`
  margin-bottom: 0;
`;

// --- STATES ---
export const EmptyStateContainer = styled.div`
  text-align: center;
  padding: 4rem;
  color: var(--color-text-secondary);
  background: var(--color-bg-surface);
  border-radius: 12px;
  border: 1px solid var(--color-border);
  margin-top: 1rem;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

export const EmptyStateIcon = styled.div`
  font-size: 3rem;
`;

export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 5rem;
`;

export const ClearFilterButton = styled.button`
  margin-top: 1rem;
  color: var(--color-brand-600);
  border: none;
  background: none;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`;

// --- TYPOGRAPHY (Available if needed) ---
export const Heading = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-main);
  letter-spacing: -0.5px;
`;

export const SubHeading = styled.p`
  color: var(--color-text-secondary);
  font-size: 0.95rem;
`;

export const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  height: 100%;
`;
