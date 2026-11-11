import styled from "styled-components";

import type { DonutSlice } from "./statistics";

// Кільце часток: найбільші частини окремо, у центрі — загальна сума.

const Wrap = styled.div`
  position: relative;
  width: 176px;
  height: 176px;
  margin: 0 auto;
`;

const Center = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  text-align: center;

  strong {
    font-size: 20px;
    letter-spacing: -0.01em;
    font-variant-numeric: tabular-nums;
  }
  span {
    font-size: 13px;
    color: var(--m-label-2);
  }
`;

const R = 70;
const C = 2 * Math.PI * R;

interface Props {
  slices: DonutSlice[];
  total: string;
  caption: string;
}

export function Donut({ slices, total, caption }: Props) {
  const starts = slices.map((_, i) => slices.slice(0, i).reduce((sum, s) => sum + s.percent, 0));
  const gap = slices.length > 1 ? 1.5 : 0; // просвіт між секторами
  return (
    <Wrap role="img" aria-label={`${caption}: ${total}`}>
      <svg viewBox="0 0 176 176" width="176" height="176">
        <g transform="rotate(-90 88 88)">
          {slices.map((s, i) => {
            const len = Math.max(0, (s.percent / 100) * C - gap);
            return (
              <circle
                key={i}
                cx="88"
                cy="88"
                r={R}
                fill="none"
                stroke={s.color}
                strokeWidth="22"
                strokeDasharray={`${len} ${C - len}`}
                strokeDashoffset={-(starts[i] / 100) * C}
              />
            );
          })}
        </g>
      </svg>
      <Center>
        <strong>{total}</strong>
        <span>{caption}</span>
      </Center>
    </Wrap>
  );
}
