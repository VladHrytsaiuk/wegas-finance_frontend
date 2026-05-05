import styled from "styled-components";

export const FormContainer = styled.form`
  display: grid;
  gap: 1.5rem;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
`;

export const InputRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

export const TypeGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 0.5rem;
`;

export const TypeCard = styled.button<{ $active: boolean; $color: string }>`
  border: 1.5px solid ${(p) => (p.$active ? p.$color : "var(--color-border)")};
  background-color: ${(p) =>
    p.$active ? `${p.$color}10` : "var(--color-bg-surface)"};
  border-radius: 10px;
  padding: 1rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  outline: none;

  &:hover {
    border-color: ${(p) => p.$color};
    background-color: ${(p) => `${p.$color}05`};
  }

  svg {
    width: 28px;
    height: 28px;
    color: ${(p) => (p.$active ? p.$color : "var(--color-text-secondary)")};
    transition: color 0.2s;
  }

  span {
    font-size: 0.95rem;
    font-weight: 600;
    color: ${(p) => (p.$active ? p.$color : "var(--color-text-main)")};
  }
`;

export const SearchWrapper = styled.div`
  padding: 0.5rem;
  border-bottom: 1px solid var(--color-border);
`;

export const ScrollableList = styled.div`
  max-height: 200px;
  overflow-y: auto;
  padding: 4px;
`;

export const ListItem = styled.div`
  padding: 0.6rem 0.8rem;
  cursor: pointer;
  border-radius: 6px;
  font-size: 0.9rem;
  color: var(--color-text-main);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;

  &:hover {
    background-color: var(--color-bg-page);
  }

  svg {
    flex-shrink: 0;
  }
`;

export const EmptyState = styled.div`
  padding: 1rem;
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
`;

export const TriggerLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
`;

export const TriggerIcon = styled.span<{ $color?: string }>`
  display: flex;
  color: ${(p) => p.$color || "inherit"};
  flex-shrink: 0;
`;

export const TriggerText = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
`;
