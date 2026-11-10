import type { ReactNode } from "react";
import styled, { keyframes } from "styled-components";

// Індикатор активності iOS (12 променів) і стан екрана «завантаження / повідомлення».

const fade = keyframes`
  from { opacity: 1; }
  to { opacity: 0.15; }
`;

const Box = styled.span<{ $size: number; $color: string }>`
  position: relative;
  display: inline-block;
  flex-shrink: 0;
  width: ${(p) => p.$size}px;
  height: ${(p) => p.$size}px;
  color: ${(p) => p.$color};
`;

const Spoke = styled.i<{ $size: number; $index: number }>`
  position: absolute;
  left: ${(p) => p.$size / 2 - 1}px;
  top: 0;
  width: 2px;
  height: ${(p) => Math.round(p.$size * 0.27)}px;
  border-radius: 1px;
  background: currentColor;
  transform-origin: 1px ${(p) => p.$size / 2}px;
  transform: rotate(${(p) => p.$index * 30}deg);
  opacity: 0.15;
  animation: ${fade} 1.2s linear infinite;
  animation-delay: ${(p) => -1.2 + p.$index * 0.1}s;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 0.5;
  }
`;

export function ActivityIndicator({
  size = 20,
  label = "Завантаження",
  color = "var(--m-label-2)",
}: {
  size?: number;
  label?: string;
  /** На кольоровій кнопці — var(--m-on-accent). */
  color?: string;
}) {
  return (
    <Box $size={size} $color={color} role="status" aria-label={label}>
      {Array.from({ length: 12 }, (_, index) => (
        <Spoke key={index} $size={size} $index={index} />
      ))}
    </Box>
  );
}

const Center = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 0 32px;
  margin-top: 36vh;
  text-align: center;
  color: var(--m-label-2);
  font-size: 15px;
  line-height: 1.4;
`;

/** Порожній екран із індикатором або повідомленням («Не знайдено»). */
export function ScreenState({
  loading,
  children,
}: {
  loading?: boolean;
  children?: ReactNode;
}) {
  return (
    <Center>
      {loading ? <ActivityIndicator size={24} /> : null}
      {children}
    </Center>
  );
}
