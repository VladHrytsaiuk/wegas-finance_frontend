import styled from "styled-components";

// Сегментований перемикач iOS: сіра доріжка, обраний сегмент — біла плашка.

const Track = styled.div<{ $count: number }>`
  display: grid;
  grid-template-columns: repeat(${(p) => p.$count}, minmax(0, 1fr));
  gap: 2px;
  padding: 2px;
  border-radius: 9px;
  background: var(--m-fill);
`;

const Segment = styled.button<{ $active: boolean }>`
  height: 32px;
  padding: 0 4px;
  border: none;
  border-radius: 7px;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  color: var(--m-label);
  background: ${(p) => (p.$active ? "var(--m-segment-active)" : "transparent")};
  box-shadow: ${(p) => (p.$active ? "0 1px 3px rgba(0, 0, 0, 0.12)" : "none")};
  -webkit-tap-highlight-color: transparent;
`;

interface SegmentedProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}

export function Segmented<T extends string>({ options, value, onChange, label }: SegmentedProps<T>) {
  return (
    <Track $count={options.length} role="group" aria-label={label}>
      {options.map((option) => (
        <Segment
          key={option.value}
          type="button"
          $active={option.value === value}
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Segment>
      ))}
    </Track>
  );
}
