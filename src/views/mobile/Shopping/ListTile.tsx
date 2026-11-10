import styled from "styled-components";
import { HiOutlineShoppingCart } from "react-icons/hi2";

// Плитка списку: колір списку (пастельний, як стікер) і візок усередині.
// Білий колір із палітри лишається білим, тому має тонку рамку.

const Box = styled.span<{ $size: number; $color: string }>`
  width: ${(p) => p.$size}px;
  height: ${(p) => p.$size}px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  border-radius: ${(p) => Math.round(p.$size * 0.28)}px;
  background: ${(p) => p.$color};
  /* Іконка завжди темна: пастельні кольори однакові в обох темах. */
  color: #3a3a3c;
  border: 0.5px solid rgba(60, 60, 67, 0.2);
`;

export function ListTile({
  color,
  size = 44,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <Box $size={size} $color={color || "#fff7d6"} aria-hidden="true">
      <HiOutlineShoppingCart size={Math.round(size * 0.5)} />
    </Box>
  );
}
