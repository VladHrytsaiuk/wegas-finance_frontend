import styled from "styled-components";

export const PageContainer = styled.div`
  margin: 0 auto;
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  flex: 1;

  position: relative;
`;

export const ControlsRow = styled.div`
  margin-bottom: 0;
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
