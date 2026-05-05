import styled from "styled-components";

// === STYLES ===
export const StyledTag = styled.div<{ $color: string }>`
  background-color: ${(props) => props.$color}15; /* 15 = прозорість */
  border: 1px solid ${(props) => props.$color}40;
  color: ${(props) => props.$color};

  border-radius: 6px;
  padding: 0.4rem 0.8rem;

  font-size: 0.9rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  transition: all 0.2s;

  &:hover {
    background-color: ${(props) => props.$color}25;
  }
`;

export const DeleteButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  opacity: 0.6;
  padding: 2px;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    opacity: 1;
    background-color: rgba(0, 0, 0, 0.1);
  }

  svg {
    width: 1.1rem;
    height: 1.1rem;
  }
`;
