import styled from "styled-components";

export const WidgetCard = styled.div`
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
  min-height: 0;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
`;

export const Title = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0;
  padding-top: 6px;
`;

export const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  overflow-y: auto;
  padding-right: 4px;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--color-border);
    border-radius: 4px;
  }
`;

export const ListItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.95rem;
`;

export const NameGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const Name = styled.span`
  color: var(--color-text-main);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
`;

export const Value = styled.span`
  font-weight: 600;
  color: var(--color-text-main);
  white-space: nowrap;
`;

export const ColorDot = styled.div<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  background-color: ${(p) => p.$color};
`;

export const ProgressBg = styled.div`
  width: 100%;
  height: 8px;
  background: var(--color-bg-hover);
  border-radius: 4px;
  overflow: hidden;
`;

export const ProgressBar = styled.div<{ $width: number; $color: string }>`
  height: 100%;
  border-radius: 4px;
  width: ${(p) => p.$width}%;
  background-color: ${(p) => p.$color};
  transition: width 0.6s ease;
`;

export const SpinnerWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  min-height: 150px;
`;

export const EmptyState = styled.div`
  color: var(--color-text-secondary);
  text-align: center;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
`;
