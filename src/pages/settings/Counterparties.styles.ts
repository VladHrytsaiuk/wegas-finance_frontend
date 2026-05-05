import styled from "styled-components";

export const PageWrapper = styled.div`
  width: 100%;
`;

export const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  width: 100%;
`;

export const Title = styled.h2`
  font-size: 1.5rem;
  color: var(--color-text-main);
  margin: 0;
`;

export const HeaderActions = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-shrink: 0;
`;

export const ControlsRow = styled.div`
  margin-bottom: 1.5rem;
`;

export const TreeContainer = styled.div`
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 0.5rem;
  min-height: 200px;
`;

export const EmptyState = styled.div`
  padding: 3rem;
  text-align: center;
  color: var(--color-text-light);
  font-size: 0.95rem;
`;

export const HiddenTriggers = styled.div`
  display: none;
`;
