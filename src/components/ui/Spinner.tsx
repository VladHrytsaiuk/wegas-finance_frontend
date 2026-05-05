import styled, { keyframes } from "styled-components";

// Анімація обертання
const rotate = keyframes`
  to {
    transform: rotate(1turn);
  }
`;

// Стилізований SVG
const StyledSpinner = styled.div<{ size?: string }>`
  width: ${(props) => props.size || "4.8rem"};
  height: ${(props) => props.size || "4.8rem"};
  border-radius: 50%;
  background: radial-gradient(farthest-side, var(--color-brand-600) 94%, #0000)
      top/10% 10% no-repeat,
    conic-gradient(#0000 30%, var(--color-brand-600));
  mask: radial-gradient(farthest-side, #0000 calc(100% - 8px), #000 0);
  -webkit-mask: radial-gradient(farthest-side, #0000 calc(100% - 8px), #000 0);
  animation: ${rotate} 1.5s infinite linear;
`;

// Можна додати ще варіант "Bouncing Dots" для різноманіття, але поки зупинимось на кільці
// Якщо хочеш менший спінер (наприклад, для кнопок), передавай size="2rem"

function Spinner({ size }: { size?: string }) {
  return <StyledSpinner size={size} />;
}

export default Spinner;
