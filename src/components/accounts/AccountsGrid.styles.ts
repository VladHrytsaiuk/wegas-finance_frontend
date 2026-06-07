import styled from "styled-components";

export const GridContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const GroupSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const GroupTitle = styled.h3`
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  font-weight: 700;
  margin-left: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  @media (max-width: 1300px) {
    font-size: 0.6rem;
  }
`;

export const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
`;

export const CardWrapper = styled.div`
  position: relative;
  transition: transform 0.2s;

  &:hover .card-actions {
    opacity: 1;
  }
`;

export const OverlayActions = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 10;
`;

export const ActionButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: all 0.2s;

  &:hover {
    transform: scale(1.1);
  }

  &.delete:hover {
    background: var(--color-red-600);
    color: white;
  }

  &.edit:hover {
    background: var(--color-brand-600);
    color: white;
  }
`;
