import styled, { keyframes } from "styled-components";
import { Button } from "../../ui/Button";

// --- ANIMATIONS ---

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- LAYOUT ---

export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeIn} 0.2s ease-out;
`;

export const ModalContainer = styled.div`
  width: 90%;
  max-width: 480px;
  background: var(--color-bg-surface);
  border-radius: 16px;
  border: 1px solid var(--color-border);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: ${slideUp} 0.3s cubic-bezier(0.16, 1, 0.3, 1);
`;

export const Header = styled.div`
  background: var(--color-bg-page);
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const WarningIconWrapper = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background-color: #fffbeb; /* Amber 50 */
  color: #d97706; /* Amber 600 */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
  border: 1px solid #fcd34d;
`;

export const Title = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0 0 4px 0;
`;

export const Subtitle = styled.div`
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  line-height: 1.4;
`;

export const Content = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

// --- COMPARISON GRID ---

export const ComparisonGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--color-bg-page);
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid var(--color-border);
`;

export const AmountBox = styled.div<{
  $isError?: boolean;
  $isSuccess?: boolean;
}>`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  & span:first-child {
    font-size: 0.75rem;
    text-transform: uppercase;
    color: var(--color-text-secondary);
    font-weight: 700;
    margin-bottom: 6px;
    letter-spacing: 0.05em;
  }

  & span:last-child {
    font-size: 1.1rem;
    font-weight: 700;
    font-family: "Roboto Mono", monospace;
    color: ${(props) =>
      props.$isError
        ? "var(--color-red-600)"
        : props.$isSuccess
        ? "var(--color-brand-600)"
        : "var(--color-text-main)"};
  }
`;

export const DividerIcon = styled.div`
  color: var(--color-text-tertiary);
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
`;

export const DiffBox = styled.div`
  background-color: #fef2f2; /* Red 50 */
  color: #b91c1c; /* Red 700 */
  padding: 1rem;
  border-radius: 12px;
  text-align: center;
  border: 1px solid #fecaca;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;

  & span {
    font-size: 0.9rem;
    font-weight: 500;
  }

  & strong {
    font-size: 1.2rem;
    font-weight: 800;
    font-family: "Roboto Mono", monospace;
  }
`;

// --- ACTIONS ---

export const Actions = styled.div`
  padding: 0 1.5rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

export const ActionButton = styled(Button)`
  width: 100%;
  justify-content: center;
  gap: 8px;
  padding: 0.8rem;
`;

export const SecondaryActions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
`;
