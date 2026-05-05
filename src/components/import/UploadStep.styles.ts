import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const LockedHeader = styled.div`
  text-align: center;
  margin-top: 2rem;
  margin-bottom: -0.5rem;

  h3 {
    margin: 0;
    color: var(--color-text-main);
    font-size: 1.1rem;
    font-weight: 600;
  }
`;

export const SwitcherContainer = styled.div`
  display: flex;
  background: var(--color-bg-subtle);
  padding: 4px;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  margin: 2rem 2rem 0 2rem;
`;

export const SwitcherButton = styled.button<{
  $active: boolean;
  $activeColor: string;
}>`
  flex: 1;
  padding: 8px 16px;
  border: none;
  background: ${(props) =>
    props.$active ? "var(--color-bg-surface)" : "transparent"};
  color: ${(props) =>
    props.$active ? props.$activeColor : "var(--color-text-secondary)"};
  font-weight: ${(props) => (props.$active ? "600" : "500")};
  border-radius: 8px;
  cursor: pointer;
  box-shadow: ${(props) =>
    props.$active ? "0 2px 5px rgba(0,0,0,0.05)" : "none"};
  transition: all 0.2s;

  &:hover {
    color: ${(props) =>
      props.$active ? props.$activeColor : "var(--color-text-main)"};
  }
`;

export const UploadZone = styled.div<{ $isDragging: boolean }>`
  flex: 1;
  margin: 1rem 2rem;
  border: 2px dashed
    ${(props) =>
      props.$isDragging ? "var(--color-brand-500)" : "var(--color-border)"};
  background-color: ${(props) =>
    props.$isDragging ? "var(--color-brand-50)" : "var(--color-bg-subtle)"};
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  gap: 1.5rem;
  min-height: 250px;

  &:hover {
    border-color: var(--color-brand-400);
    background-color: var(--color-bg-hover);
  }
`;

export const UploadIconCircle = styled.div`
  background: var(--color-bg-surface);
  padding: 1.5rem;
  border-radius: 50%;
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const UploadText = styled.div`
  text-align: center;
`;

export const UploadTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin-bottom: 0.5rem;
  margin-top: 0;
`;

export const UploadSubtitle = styled.p`
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin: 0;
`;

export const InstructionBox = styled.div`
  margin: 0 2rem 2rem 2rem;
  padding: 1rem;
  background-color: var(--color-bg-subtle);
  border-radius: 8px;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  border: 1px solid var(--color-border);
`;

export const InstructionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;

  strong {
    color: var(--color-text-main);
    font-weight: 600;
  }
`;

export const InstructionList = styled.ul`
  margin: 0;
  padding-left: 1.2rem;

  li {
    margin-bottom: 4px;
  }
`;
