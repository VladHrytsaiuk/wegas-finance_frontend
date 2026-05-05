import styled from "styled-components";

export const Container = styled.div`
  /* Обгортка для triggerRef */
`;

export const RangeContainer = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const RangeTitle = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-secondary);
`;

export const RangeInputs = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const SmallInput = styled.input`
  width: 100%;
  padding: 6px 8px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 0.9rem;
  color: var(--color-text-main);
  background: var(--color-bg-subtle);

  &:focus {
    outline: 2px solid var(--color-brand-500);
    outline-offset: -1px;
    background: var(--color-bg-surface);
  }
`;

export const Separator = styled.div`
  width: 8px;
  height: 2px;
  background: var(--color-border);
  flex-shrink: 0;
`;

export const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding-top: 0.8rem;
  border-top: 1px solid var(--color-border);
`;

export const ResetButton = styled.button`
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  background: none;
  border: none;
  cursor: pointer;
  margin-right: auto;
  padding: 4px 8px;
  border-radius: 4px;
  transition: color 0.2s;

  &:hover {
    color: var(--color-red-600);
    background: var(--color-red-50);
  }
`;

export const ApplyButton = styled.button`
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
  background-color: var(--color-brand-600);
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background-color: var(--color-brand-700);
  }
`;
