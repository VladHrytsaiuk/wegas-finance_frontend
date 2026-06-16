import styled from "styled-components";
import { HiBackspace } from "react-icons/hi2";

const PadContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
  max-width: 280px;
  margin: 0 auto;

  @media (max-height: 700px) {
    gap: 1rem;
  }
`;

const PinDots = styled.div`
  display: flex;
  gap: 1.2rem;
  margin-bottom: 0.5rem;
`;

const Dot = styled.div<{ $active: boolean; $error?: boolean }>`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid ${props => props.$error ? 'var(--color-red-600)' : 'var(--color-brand-600)'};
  background-color: ${props => props.$active 
    ? (props.$error ? 'var(--color-red-600)' : 'var(--color-brand-600)') 
    : 'transparent'};
  transition: all 0.2s ease-in-out;
  transform: ${props => props.$active ? 'scale(1.1)' : 'scale(1)'};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.2rem;
  width: 100%;

  @media (max-width: 360px) {
    gap: 0.8rem;
  }
`;

const Key = styled.button`
  aspect-ratio: 1;
  border-radius: 50%;
  border: none;
  background-color: var(--color-grey-50);
  color: var(--color-grey-700);
  font-size: 1.6rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    background-color: var(--color-grey-100);
  }

  &:active {
    background-color: var(--color-grey-200);
    transform: scale(0.92);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 360px) {
    font-size: 1.4rem;
  }
`;

const ActionKey = styled(Key)`
  background-color: transparent;
  &:hover {
    background-color: transparent;
    color: var(--color-brand-600);
  }
`;

interface PinPadProps {
  pin: string;
  onPinChange: (pin: string) => void;
  disabled?: boolean;
  error?: boolean;
}

export const PinPad = ({ pin, onPinChange, disabled, error }: PinPadProps) => {
  const handleNumberClick = (num: number) => {
    if (pin.length < 4) {
      onPinChange(pin + num.toString());
    }
  };

  const handleBackspace = () => {
    onPinChange(pin.slice(0, -1));
  };

  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <PadContainer>
      <PinDots>
        {[0, 1, 2, 3].map((i) => (
          <Dot key={i} $active={pin.length > i} $error={error} />
        ))}
      </PinDots>

      <Grid>
        {numbers.map((num) => (
          <Key
            key={num}
            type="button"
            onClick={() => handleNumberClick(num)}
            disabled={disabled}
          >
            {num}
          </Key>
        ))}
        <div /> {/* Empty space */}
        <Key
          type="button"
          onClick={() => handleNumberClick(0)}
          disabled={disabled}
        >
          0
        </Key>
        <ActionKey
          type="button"
          onClick={handleBackspace}
          disabled={disabled || pin.length === 0}
        >
          <HiBackspace size={28} />
        </ActionKey>
      </Grid>
    </PadContainer>
  );
};
