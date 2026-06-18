import styled from "styled-components";

// Константи кольорів
export const PRESET_COLORS = [
  "#6b7280",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#84cc16",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#d946ef",
  "#f43f5e",
];

// === STYLES ===
export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

export const CompactRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: row;
    align-items: flex-end;

    /* First child (Color FieldGroup) remains a square button */
    & > div:first-child {
      flex: 0 0 auto !important;
    }

    /* Second child (Name FieldGroup) takes up the rest of the row */
    & > div:last-child {
      flex: 1 1 auto !important;
      width: auto;
    }
  }
`;

export const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

export const Label = styled.label`
  display: block;
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
`;

export const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 0.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--color-border);

  @media (max-width: 768px) {
    button {
      height: 38px;
      font-size: 0.9rem;
      padding: 0 1rem;
      flex: 1;
      width: auto !important;
    }
  }
`;
