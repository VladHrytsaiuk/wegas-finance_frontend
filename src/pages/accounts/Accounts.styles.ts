import styled from "styled-components";

export const PageContainer = styled.div`
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

export const ControlsRow = styled.div`
  margin-bottom: 0;
`;

export const ControlsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const ErrorState = styled.div`
  padding: 3rem;
  color: var(--color-red-600);
  text-align: center;
`;
