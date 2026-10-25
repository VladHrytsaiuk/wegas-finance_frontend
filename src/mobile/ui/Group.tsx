import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import styled, { css } from "styled-components";
import { HiChevronRight } from "react-icons/hi2";

// Згрупований список як у налаштуваннях iOS: біла плашка, рядки з тонкими роздільниками.

const SectionWrap = styled.section`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SectionHead = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 0 4px;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.01em;
`;

const CaptionRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 0 16px;
  font-variant-numeric: tabular-nums;
`;

const Caption = styled.span`
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: var(--m-label-2);
`;

interface SectionProps {
  title?: string;
  caption?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function Section({ title, caption, action, children }: SectionProps) {
  return (
    <SectionWrap>
      {title && (
        <SectionHead>
          <SectionTitle>{title}</SectionTitle>
          {action}
        </SectionHead>
      )}
      {caption && (
        <CaptionRow>
          <Caption>{caption}</Caption>
          {!title && action}
        </CaptionRow>
      )}
      {children}
    </SectionWrap>
  );
}

export const SectionAction = styled(Link)`
  font-size: 15px;
  color: var(--m-accent);
  text-decoration: none;
  padding: 8px 0;
`;

export const Group = styled.div`
  background: var(--m-surface);
  border-radius: var(--m-radius-group);
  overflow: hidden;
`;

const rowBase = css<{ $inset: number; $compact: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  /* 44 — стандартна висота рядка iOS. */
  min-height: ${(p) => (p.$compact ? 44 : 60)}px;
  padding: 8px 16px;
  box-sizing: border-box;
  border: none;
  background: none;
  font: inherit;
  color: inherit;
  text-align: left;
  text-decoration: none;

  /* Роздільник між будь-якими рядками групи: посилання, кнопками чи текстом. */
  [data-row] + &::before {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    left: ${(p) => p.$inset}px;
    height: 0.5px;
    background: var(--m-separator);
  }
`;

const RowDiv = styled.div<{ $inset: number; $compact: boolean }>`
  ${rowBase}
`;

const RowButton = styled.button<{ $inset: number; $compact: boolean }>`
  ${rowBase}
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  &:active {
    background: var(--m-fill);
  }
`;

const RowLink = styled(Link)<{ $inset: number; $compact: boolean }>`
  ${rowBase}
  -webkit-tap-highlight-color: transparent;

  &:active {
    background: var(--m-fill);
  }
`;

const RowText = styled.span`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

const RowTitle = styled.span`
  font-size: 16px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RowSubtitle = styled.span`
  font-size: 13px;
  color: var(--m-label-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RowTrailing = styled.span`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
`;

const Chevron = styled(HiChevronRight)`
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  color: var(--m-label-3);
`;

interface RowProps {
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  chevron?: boolean;
  to?: string;
  onClick?: () => void;
  /** Відступ роздільника зліва: під текстом, а не під іконкою. */
  inset?: number;
}

export function Row({ leading, title, subtitle, trailing, chevron, to, onClick, inset }: RowProps) {
  const separatorInset = inset ?? (leading ? 64 : 16);
  const compact = !subtitle;
  const content = (
    <>
      {leading}
      <RowText>
        <RowTitle>{title}</RowTitle>
        {subtitle && <RowSubtitle>{subtitle}</RowSubtitle>}
      </RowText>
      {trailing && <RowTrailing>{trailing}</RowTrailing>}
      {chevron && <Chevron aria-hidden="true" />}
    </>
  );

  if (to) {
    return (
      <RowLink data-row="" to={to} $inset={separatorInset} $compact={compact}>
        {content}
      </RowLink>
    );
  }
  if (onClick) {
    return (
      <RowButton data-row="" type="button" onClick={onClick} $inset={separatorInset} $compact={compact}>
        {content}
      </RowButton>
    );
  }
  return (
    <RowDiv data-row="" $inset={separatorInset} $compact={compact}>
      {content}
    </RowDiv>
  );
}

export const Amount = styled.span<{ $tone?: "income" | "default" | "muted" }>`
  font-size: 16px;
  font-weight: 500;
  white-space: nowrap;
  color: ${(p) =>
    p.$tone === "income"
      ? "var(--m-accent)"
      : p.$tone === "muted"
        ? "var(--m-label-2)"
        : "var(--m-label)"};
`;

export const Meta = styled.span`
  font-size: 13px;
  color: var(--m-label-2);
`;
