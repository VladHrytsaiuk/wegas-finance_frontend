import styled from "styled-components";

export const BaseCard = styled.div`
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 0.8rem 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
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
  gap: 4px;
`;

export const CardIcon = styled.div<{ $color?: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--color-bg-page);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  color: ${(p) => p.$color || "var(--color-text-main)"};
  flex-shrink: 0;
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
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  white-space: nowrap;
`;

export const CardValue = styled.span<{ $color?: string }>`
  font-size: clamp(
    1.1rem,
    2vw,
    1.4rem
  ); /* Легкий ресайз шрифту на малих екранах */
  font-weight: 800;
  color: ${(p) => p.$color || "var(--color-text-main)"};
  letter-spacing: -0.5px;
  white-space: nowrap;
`;
