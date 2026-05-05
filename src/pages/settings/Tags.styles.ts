import styled from "styled-components";

export const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

export const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: var(--color-text-main);
  margin: 0;
`;

export const ControlsRow = styled.div`
  margin-bottom: 1.5rem;
`;

export const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
`;

export const EmptyState = styled.p`
  color: var(--color-text-light);
  width: 100%;
  text-align: center;
  margin-top: 2rem;
`;

export const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 3rem;
`;

export const ModalContent = styled.div`
  width: 400px;
`;

export const ModalTitle = styled.h3`
  margin-bottom: 1.5rem;
`;
