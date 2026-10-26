import type { ReactNode } from "react";
import { HiChevronLeft } from "react-icons/hi2";
import styled from "styled-components";

// Верхня панель вкладеного екрана iOS: «‹ Назад» зліва, дія справа.

const Bar = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: env(safe-area-inset-top) 8px 0;
  background: color-mix(in srgb, var(--m-bg) 88%, transparent);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
`;

const Back = styled.button`
  justify-self: start;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 10px 8px 10px 0;
  border: none;
  background: none;
  font: inherit;
  font-size: 17px;
  color: var(--m-accent);
  cursor: pointer;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  white-space: nowrap;
`;

const Trailing = styled.div`
  justify-self: end;
  padding-right: 8px;
`;

export const NavButton = styled.button`
  padding: 10px 0;
  border: none;
  background: none;
  font: inherit;
  font-size: 17px;
  color: var(--m-accent);
  cursor: pointer;

  &:disabled {
    color: var(--m-label-3);
  }
`;

interface NavBarProps {
  backLabel: string;
  onBack: () => void;
  title?: string;
  trailing?: ReactNode;
}

export function NavBar({ backLabel, onBack, title, trailing }: NavBarProps) {
  return (
    <Bar>
      <Back type="button" onClick={onBack}>
        <HiChevronLeft size={24} aria-hidden="true" />
        {backLabel}
      </Back>
      <Title>{title}</Title>
      <Trailing>{trailing}</Trailing>
    </Bar>
  );
}
