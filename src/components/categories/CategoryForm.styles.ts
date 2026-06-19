import styled from "styled-components";

export const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
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

export const TypeGrid = styled.div`
  display: flex;
  gap: 0.75rem;
  width: 100%;
`;

export const TypeCard = styled.button<{ $active: boolean; $color: string }>`
  flex: 1;
  border: 1.5px solid ${(p) => (p.$active ? p.$color : "var(--color-border)")};
  background-color: ${(p) =>
    p.$active ? `${p.$color}10` : "var(--color-bg-surface)"};
  border-radius: 8px;
  padding: 0.6rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  transition: all 0.2s;
  outline: none;

  &:hover {
    border-color: ${(p) => p.$color};
    background-color: ${(p) => `${p.$color}05`};
  }

  svg {
    width: 20px;
    height: 20px;
    color: ${(p) => (p.$active ? p.$color : "var(--color-text-tertiary)")};
  }

  span {
    font-size: 0.9rem;
    font-weight: 600;
    color: ${(p) => (p.$active ? p.$color : "var(--color-text-main)")};
  }
`;

export const CompactInputRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  width: 100%;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 1rem 0.75rem;

    /* First child (Name FormGroup) takes full width */
    & > div:first-child {
      flex: 0 0 100% !important;
    }

    /* Second & third children (Icon & Color FormGroups) take 50% each */
    & > div:nth-child(2),
    & > div:nth-child(3) {
      flex: 1 1 calc(50% - 0.375rem) !important;
      
      button {
        width: 100% !important;
      }
    }
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
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--color-border);

  button {
    height: 38px;
    font-size: 0.95rem;
    padding: 0 1rem;
    min-width: 100px;
    
    @media (min-width: 768px) {
      min-width: 120px;
    }
  }
`;
