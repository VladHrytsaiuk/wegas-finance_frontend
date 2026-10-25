import type { ReactNode } from "react";
import styled from "styled-components";

// Сторінка вкладки: відступ під статус-бар, великий заголовок і блоки з проміжком.
export const Screen = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: calc(env(safe-area-inset-top) + 20px) 16px 32px;
  min-height: 100%;
  box-sizing: border-box;
  background: var(--m-bg);
  color: var(--m-label);
  font-family: var(--m-font);
  -webkit-font-smoothing: antialiased;
`;

const TitleRow = styled.header`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
`;

const TitleText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const Eyebrow = styled.p`
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--m-label-2);
`;

const Title = styled.h1`
  margin: 0;
  font-size: 34px;
  line-height: 41px;
  font-weight: 700;
  letter-spacing: -0.02em;
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 15px;
  color: var(--m-label-2);
  font-variant-numeric: tabular-nums;
`;

interface LargeTitleProps {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  trailing?: ReactNode;
}

export function LargeTitle({ title, eyebrow, subtitle, trailing }: LargeTitleProps) {
  return (
    <TitleRow>
      <TitleText>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <Title>{title}</Title>
        {subtitle && <Subtitle>{subtitle}</Subtitle>}
      </TitleText>
      {trailing}
    </TitleRow>
  );
}
