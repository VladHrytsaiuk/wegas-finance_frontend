import styled from "styled-components";

export const Wrapper = styled.div`
  position: relative;
  width: 100%;
`;

export const SegmentedWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 46px;
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  display: flex;
  align-items: center;
  transition: all 0.2s;
  cursor: text;
  &:focus-within {
    border-color: var(--color-brand-600);
    box-shadow: 0 0 0 3px var(--color-brand-100);
  }
`;

export const SegmentInput = styled.input`
  border: none;
  background: transparent;
  width: 28px;
  text-align: center;
  font-size: 0.95rem;
  color: var(--color-text-main);
  outline: none;
  padding: 0;
  &::placeholder {
    color: var(--color-text-tertiary);
    opacity: 0.5;
  }
`;

export const Separator = styled.span`
  color: var(--color-text-main);
  font-weight: 500;
  margin: 0 1px;
`;

export const IconButton = styled.button`
  background: none;
  border: none;
  padding: 0 10px;
  height: 100%;
  display: flex;
  align-items: center;
  color: var(--color-text-secondary);
  cursor: pointer;
  &:hover {
    color: var(--color-brand-600);
  }
`;

export const PickerContainer = styled.div`
  position: fixed;
  z-index: 9999;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

export const ColumnsContainer = styled.div`
  display: flex;
  height: 200px;
  padding: 0.5rem;
  background: var(--color-bg-surface);
`;

export const Column = styled.div`
  display: flex;
  flex-direction: column;
  width: 60px;
  align-items: center;
`;

export const ColumnLabel = styled.div`
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
  margin-bottom: 4px;
  text-transform: uppercase;
  font-weight: 600;
`;

export const ScrollArea = styled.div`
  flex: 1;
  width: 100%;
  overflow-y: auto;
  scrollbar-width: thin;
`;

export const Divider = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  padding-top: 20px;
  width: 10px;
`;

export const TimeItem = styled.button<{ $active: boolean }>`
  width: 100%;
  padding: 6px 0;
  background: ${(p) => (p.$active ? "var(--color-brand-600)" : "transparent")};
  color: ${(p) => (p.$active ? "#fff" : "var(--color-text-main)")};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-bottom: 2px;
  &:hover {
    background: ${(p) =>
      p.$active ? "var(--color-brand-700)" : "var(--color-bg-hover)"};
  }
`;

export const Footer = styled.div`
  padding: 8px;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: center;
  background: var(--color-bg-page);
`;

export const ApplyBtn = styled.button`
  width: 100%;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-main);
  font-size: 0.8rem;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  &:hover {
    background: var(--color-bg-hover);
  }
`;
