import React, { useState, useEffect } from "react";
import styled, { keyframes, css } from "styled-components";
import { HiBackspace } from "react-icons/hi2";

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin: 0 auto;
`;

const InputContainer = styled.div<{ $error?: boolean }>`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  justify-content: center;
  ${props => props.$error && css`
    animation: ${shake} 0.2s ease-in-out 0s 2;
  `}
`;

const PinBox = styled.div<{ $active: boolean; $filled: boolean; $error?: boolean }>`
  width: 32px;
  height: 42px;
  border-radius: 6px;
  border: 1.5px solid ${props => 
    props.$error ? 'var(--color-red-600)' : 
    (props.$active ? 'var(--color-brand-600)' : 'var(--color-grey-200)')
  };
  background-color: var(--color-bg-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text-main);
  transition: all 0.2s;
`;

const Dot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--color-text-main);
`;

const KeypadGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  width: 100%;
  max-width: 220px; /* Дуже вузько, щоб точно влізло */
`;

const Key = styled.button`
  width: 100%;
  padding: 10px 0; /* Використовуємо падінг замість aspect-ratio для контролю висоти */
  border-radius: 8px;
  border: none;
  background-color: var(--color-grey-50);
  color: var(--color-grey-800);
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  &:active {
    background-color: var(--color-grey-200);
  }

  &:disabled {
    opacity: 0.5;
  }
`;

const IconButton = styled(Key)`
  background-color: transparent;
  color: var(--color-grey-500);
  &:active {
    background-color: transparent;
    color: var(--color-brand-600);
  }
`;

interface ModernPinInputProps {
  pin: string;
  onPinChange: (pin: string) => void;
  error?: boolean;
  disabled?: boolean;
}

export const ModernPinInput = ({ pin, onPinChange, error, disabled }: ModernPinInputProps) => {
  const [lastChar, setLastChar] = useState<string | null>(null);

  useEffect(() => {
    if (pin.length > 0) {
      const char = pin[pin.length - 1];
      setLastChar(char);
      const timer = setTimeout(() => setLastChar(null), 800);
      return () => clearTimeout(timer);
    } else {
      setLastChar(null);
    }
  }, [pin]);

  const handleKeyClick = (val: string) => {
    if (pin.length < 4) {
      onPinChange(pin + val);
    }
  };

  const handleBackspace = () => {
    onPinChange(pin.slice(0, -1));
  };

  return (
    <Container>
      <InputContainer $error={error}>
        {[0, 1, 2, 3].map((i) => {
          const isFilled = pin.length > i;
          const isActive = pin.length === i;
          const isShowingChar = isFilled && i === pin.length - 1 && lastChar !== null;

          return (
            <PinBox key={i} $active={isActive} $filled={isFilled} $error={error}>
              {isShowingChar ? lastChar : (isFilled ? <Dot /> : "")}
            </PinBox>
          );
        })}
      </InputContainer>

      <KeypadGrid>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <Key key={num} onClick={() => handleKeyClick(num.toString())} disabled={disabled}>
            {num}
          </Key>
        ))}
        <div />
        <Key onClick={() => handleKeyClick("0")} disabled={disabled}>
          0
        </Key>
        <IconButton onClick={handleBackspace} disabled={disabled || pin.length === 0}>
          <HiBackspace size={28} />
        </IconButton>
      </KeypadGrid>
    </Container>
  );
};
