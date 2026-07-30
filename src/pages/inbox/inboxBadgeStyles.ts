import { css } from "styled-components";

export const inboxBadgeStyles = css<{
  $tone?: "default" | "warning" | "success" | "attention";
  $emphasis?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  gap: 0.32rem;
  padding: ${({ $emphasis }) => ($emphasis ? "0.38rem 0.72rem" : "0.32rem 0.65rem")};
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: ${({ $emphasis }) => ($emphasis ? 800 : 700)};
  white-space: nowrap;
  color: ${({ $tone }) =>
    $tone === "attention"
      ? "var(--color-yellow-900)"
      : $tone === "warning"
        ? "var(--color-yellow-900)"
        : $tone === "success"
          ? "var(--color-green-800)"
          : "var(--color-text-secondary)"};
  background: ${({ $tone }) =>
    $tone === "attention"
      ? "color-mix(in srgb, var(--color-yellow-500) 52%, var(--color-bg-surface))"
      : $tone === "warning"
        ? "color-mix(in srgb, var(--color-yellow-500) 20%, var(--color-bg-surface))"
        : $tone === "success"
          ? "color-mix(in srgb, var(--color-green-500) 12%, var(--color-bg-surface))"
          : "var(--color-bg-page)"};
  border: 1px solid
    ${({ $tone }) =>
      $tone === "attention"
      ? "color-mix(in srgb, var(--color-yellow-500) 30%, var(--color-border))"
      : $tone === "warning"
        ? "color-mix(in srgb, var(--color-yellow-500) 48%, var(--color-border))"
          : $tone === "success"
            ? "color-mix(in srgb, var(--color-green-500) 24%, transparent)"
            : "var(--color-border)"};
  box-shadow: ${({ $emphasis, $tone }) =>
    $emphasis && ($tone === "attention" || $tone === "warning")
      ? "0 0 0 1px color-mix(in srgb, var(--color-yellow-700) 36%, transparent) inset"
      : "none"};

  &::before {
    content: "";
    display: ${({ $emphasis }) => ($emphasis ? "inline-block" : "none")};
    width: 0.46rem;
    height: 0.46rem;
    border-radius: 999px;
    background: ${({ $tone }) =>
      $tone === "attention"
        ? "var(--color-yellow-700)"
        : $tone === "warning"
          ? "var(--color-yellow-600)"
          : $tone === "success"
            ? "var(--color-green-600)"
            : "var(--color-text-secondary)"};
    box-shadow: 0 0 0 2px color-mix(in srgb, currentColor 12%, transparent);
  }
`;
