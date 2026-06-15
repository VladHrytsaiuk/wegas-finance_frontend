import styled from "styled-components";

export const WidgetCard = styled.div`
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1rem 1.25rem 0 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  height: 100%;
  min-height: 0;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
`;

export const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding-top: 6px;
`;

export const Title = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0;
`;

export const TypeToggle = styled.div`
  display: flex;
  background: var(--color-bg-page);
  padding: 3px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
`;

export const ToggleBtn = styled.button<{ $active: boolean; $color: string }>`
  border: none;
  background: ${(p) => (p.$active ? "var(--color-bg-surface)" : "transparent")};
  color: ${(p) => (p.$active ? p.$color : "var(--color-text-secondary)")};
  padding: 4px 12px;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${(p) => (p.$active ? "0 2px 4px rgba(0,0,0,0.05)" : "none")};

  &:hover {
    color: ${(p) => (p.$active ? p.$color : "var(--color-text-main)")};
  }
`;

export const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow-y: auto;
  padding-right: 4px;
  flex: 1;

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
  gap: 8px;
  min-width: 0;
  flex: 1;
`;

export const Logo = styled.div<{ $color?: string; $hasImage?: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 6px;
  flex-shrink: 0;
  overflow: hidden;

  background: ${(p) =>
    p.$hasImage
      ? "transparent"
      : `color-mix(in srgb, ${p.$color || "#6b7280"}, transparent 90%)`};

  border: 1px solid
    ${(p) =>
      p.$hasImage
        ? "rgba(0, 0, 0, 0.08)"
        : `color-mix(in srgb, ${p.$color || "#6b7280"}, transparent 80%)`};

  color: ${(p) => p.$color || "#6b7280"};
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    padding: 0;
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

export const Name = styled.span`
  color: var(--color-text-main);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
