import styled from "styled-components";

export const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 1rem;

  @media (max-width: 1300px) {
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
  }
`;

export const SectionTitle = styled.h2`
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0;
`;

export const UserGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;

  @media (max-width: 1300px) {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
  }
`;

// Стилі для вмісту модалки
export const ModalContent = styled.div`
  width: 800px;
  max-width: 95vw;
`;

export const ModalTitle = styled.h3`
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  color: var(--color-text-main);
`;
