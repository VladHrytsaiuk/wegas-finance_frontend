import styled, { css } from "styled-components";

export const BaseCard = styled.div`
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 0.6rem 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: var(--shadow-sm);

  /* Картка завжди ідеально заповнює свій слот у сітці */
  height: 100%;
  width: 100%;
  overflow: hidden;
`;

export const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
`;

export const CardIcon = styled.div<{ $color?: string }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--color-bg-page);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: ${(p) => p.$color || "var(--color-text-main)"};
  flex-shrink: 0;

  @media (max-width: 1300px) {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    font-size: 1rem;
  }
`;

export const MainCard = styled(BaseCard)<{ $variant?: string }>`
  background: ${(p) =>
    p.$variant === "primary"
      ? "linear-gradient(135deg, var(--color-brand-600) 0%, var(--color-brand-700) 100%)"
      : "var(--color-bg-surface)"};
  border: none;

  ${CardIcon} {
    background: ${(p) =>
      p.$variant === "primary"
        ? "rgba(255, 255, 255, 0.2)"
        : "var(--color-bg-page)"};

    * {
      color: ${(p) =>
        p.$variant === "primary" ? "white !important" : "inherit"};
    }
  }

  ${(props) =>
    props.$variant === "primary" &&
    `span, h3, div { color: white !important; }`}
`;

export const StatCard = styled(BaseCard)``;

export const CardLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  white-space: nowrap;
`;

export const CardValue = styled.span<{ $color?: string }>`
  font-size: 1.2rem;
  font-weight: 800;
  color: ${(p) => p.$color || "var(--color-text-main)"};
  letter-spacing: -0.5px;
  white-space: nowrap;

  @media (max-width: 1300px) {
    font-size: 1.1rem;
  }
`;
