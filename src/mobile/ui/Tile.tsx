import type { ReactNode } from "react";
import styled from "styled-components";
import { SmartIcon } from "../../utils/IconMap";
import type { Tint } from "../tokens";

// Квадратна плитка зліва в рядку: логотип банку/магазину або іконка категорії.

const Box = styled.span<{ $size: number; $bg: string; $fg: string; $logo: boolean }>`
  width: ${(p) => p.$size}px;
  height: ${(p) => p.$size}px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-sizing: border-box;
  border-radius: ${(p) => Math.round(p.$size * 0.28)}px;
  background: ${(p) => p.$bg};
  color: ${(p) => p.$fg};
  border: ${(p) => (p.$logo ? "0.5px solid rgba(0, 0, 0, 0.08)" : "none")};

  & img {
    border-radius: 0 !important;
  }
`;

interface TileProps {
  /** Ім'я логотипа з public/banks або public/brands (як у SmartIcon). */
  logo?: string | null;
  /** Ім'я іконки категорії (SmartIcon) або готовий вузол. */
  iconName?: string;
  icon?: ReactNode;
  /** Колір категорії (hex); інакше використовується tint. */
  color?: string;
  tint?: Tint;
  size?: number;
}

const isHex = (value?: string) => !!value && /^#[0-9a-f]{6}$/i.test(value);

export function Tile({ logo, iconName, icon, color, tint = "gray", size = 36 }: TileProps) {
  if (logo) {
    return (
      <Box $size={size} $bg="#ffffff" $fg="var(--m-label)" $logo aria-hidden="true">
        <SmartIcon logo={logo} iconName={iconName} fillContainer size={size} />
      </Box>
    );
  }

  // Колір категорії даємо прозорим фоном (14%) і насиченою іконкою.
  const bg = isHex(color) ? `${color}24` : `var(--m-tint-${tint}-bg)`;
  const fg = isHex(color) ? color! : `var(--m-tint-${tint}-fg)`;

  return (
    <Box $size={size} $bg={bg} $fg={fg} $logo={false} aria-hidden="true">
      {icon ?? <SmartIcon iconName={iconName} size={Math.round(size * 0.55)} />}
    </Box>
  );
}
