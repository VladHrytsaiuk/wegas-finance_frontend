import styled from "styled-components";

export const PageContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 1rem;
`;

export const Header = styled.div`
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

export const HeaderTitle = styled.div`
  h1 {
    font-size: 1.8rem;
    color: var(--color-text-main);
    font-weight: 800;
    margin: 0;
  }
  p {
    color: var(--color-text-secondary);
    font-size: 0.95rem;
    margin-top: 6px;
  }
`;

export const TabsContainer = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-border);
`;

export const TabButton = styled.button<{ $active: boolean }>`
  background: none;
  border: none;
  padding: 0.8rem 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: ${(p) =>
    p.$active ? "var(--color-brand-600)" : "var(--color-text-secondary)"};
  border-bottom: 2px solid
    ${(p) => (p.$active ? "var(--color-brand-600)" : "transparent")};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  &:hover {
    color: var(--color-brand-600);
  }
`;

export const ControlPanel = styled.div`
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const ControlRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

export const Divider = styled.div`
  width: 1px;
  height: 40px;
  background: var(--color-border);
  margin: 0 0.5rem;
  @media (max-width: 768px) {
    display: none;
  }
`;

export const Label = styled.div`
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
  margin-bottom: 0.5rem;
  letter-spacing: 0.05em;
`;

export const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
`;

export const OptionCard = styled.label<{ $checked: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 1rem;
  border: 2px solid
    ${(p) => (p.$checked ? "var(--color-brand-600)" : "var(--color-border)")};
  background: ${(p) => (p.$checked ? "var(--color-brand-50)" : "transparent")};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: var(--color-bg-hover);
    border-color: ${(p) =>
      p.$checked ? "var(--color-brand-600)" : "var(--color-text-tertiary)"};
  }
  input {
    display: none;
  }
  div.icon {
    color: ${(p) =>
      p.$checked ? "var(--color-brand-600)" : "var(--color-text-secondary)"};
    font-size: 1.2rem;
    display: flex;
  }
  span {
    font-weight: ${(p) => (p.$checked ? "600" : "500")};
    color: var(--color-text-main);
    font-size: 0.95rem;
  }
`;

export const FormatButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0.6rem 1rem;
  border: 1px solid
    ${(p) => (p.$active ? "var(--color-brand-600)" : "var(--color-border)")};
  background: ${(p) => (p.$active ? "var(--color-brand-50)" : "white")};
  color: ${(p) =>
    p.$active ? "var(--color-brand-700)" : "var(--color-text-main)"};
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: var(--color-bg-hover);
  }
`;

export const StatsInfo = styled.div`
  margin-top: 0.5rem;
  padding: 1rem;
  background: var(--color-bg-main);
  border-radius: 8px;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
`;

export const DateRangeWrapper = styled.div`
  width: 260px;
`;
export const FormatSection = styled.div`
  border-top: 1px solid var(--color-border);
  padding-top: 1.5rem;
`;
