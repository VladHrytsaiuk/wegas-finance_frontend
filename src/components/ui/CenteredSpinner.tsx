import styled, { keyframes, css } from "styled-components";
import Spinner from "./Spinner";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div<{ $fullHeight?: boolean; $isContainer?: boolean }>`
  width: 100%;
  height: ${(p) =>
    p.$fullHeight ? "100vh" : p.$isContainer ? "100%" : "60vh"};
  flex: ${(p) => (p.$isContainer ? "1" : "none")};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: ${(p) =>
    p.$fullHeight ? "var(--color-bg-page)" : "transparent"};
  position: relative;
  z-index: 50;
`;

const SpinnerWrapper = styled.div<{ $fixed?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  pointer-events: none;
  z-index: 100;

  ${(props) =>
    props.$fixed &&
    css`
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    `}
`;

const Message = styled.p`
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  font-weight: 500;
  text-align: center;
  max-width: 300px;
  line-height: 1.5;
  animation: ${fadeIn} 0.3s ease-out forwards;
`;

interface CenteredSpinnerProps {
  size?: string;
  fullHeight?: boolean;
  isContainer?: boolean;
  message?: string;
}

export function CenteredSpinner({
  size,
  fullHeight,
  isContainer,
  message,
}: CenteredSpinnerProps) {
  return (
    <Container $fullHeight={fullHeight} $isContainer={isContainer}>
      <SpinnerWrapper $fixed={fullHeight}>
        <Spinner size={size} />
        {message && <Message key={message}>{message}</Message>}
      </SpinnerWrapper>
    </Container>
  );
}

export default CenteredSpinner;
