import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0 0.5rem;

  @media (max-width: 1300px) {
    gap: 0.4rem;
    padding: 0;
  }
`;

export const Label = styled.span`
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  display: none;

  @media (min-width: 640px) {
    display: inline;
  }

  @media (max-width: 1300px) {
    font-size: 0.7rem;
    padding: 0;
  }
`;

export const Group = styled.div`
  display: inline-flex;
  background-color: var(--color-bg-page);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 2px;
  gap: 2px;
`;

export const Button = styled.button<{ $active: boolean }>`
  border: none;
  background-color: ${(props) =>
    props.$active ? "var(--color-bg-surface)" : "transparent"};
  color: ${(props) =>
    props.$active ? "var(--color-brand-600)" : "var(--color-text-secondary)"};
  font-weight: ${(props) => (props.$active ? "600" : "500")};
  box-shadow: ${(props) =>
    props.$active ? "0 1px 2px rgba(0,0,0,0.1)" : "none"};
  padding: 0.35rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease-in-out;
  white-space: nowrap;

  @media (max-width: 1300px) {
    font-size: 0.7rem;
    padding: 0.35rem 0.5rem;
  }

  &:hover {
    color: var(--color-brand-700);
  }
`;
