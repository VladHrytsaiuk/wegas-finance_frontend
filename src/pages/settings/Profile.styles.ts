import styled, { keyframes, css } from "styled-components";
import { Button } from "../../components/ui/Button";

// --- Animations ---
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// --- Layout ---
export const PageContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

export const SectionTitle = styled.h2`
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: var(--color-text-main);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 1rem;

  @media (max-width: 1300px) {
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
  }
`;

// --- Profile Form ---
export const Form = styled.form`
  margin-bottom: 3rem;
  max-width: 500px;
  background-color: var(--color-bg-page);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--color-border);
`;

export const FormGroup = styled.div`
  margin-bottom: 1.2rem;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.9rem;
  color: var(--color-text-main);
`;

export const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 5rem;
`;

export const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
`;

// Кнопка для зміни паролю (сіра)
export const SecondaryButton = styled(Button)`
  width: auto;
  background-color: var(--color-text-secondary);
  gap: 0.5rem;
`;

// --- Change Password Modal ---
export const ModalTitle = styled.h3`
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  color: var(--color-text-main);
`;

export const PasswordFormContainer = styled.div`
  width: 450px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const PasswordForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const PasswordGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

export const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

export const CancelButton = styled(Button)`
  width: auto;
  background-color: transparent;
  color: var(--color-text-main);
  border: 1px solid var(--color-border);

  &:hover {
    background-color: var(--color-bg-hover);
  }
`;

// --- Integrations Section ---

export const IntegrationsSection = styled.div`
  margin-top: 3rem;
  border-top: 1px solid var(--color-border);
  padding-top: 2rem;
`;

export const IntegrationCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-bg-surface);

  @media (max-width: 1300px) {
    padding: 1rem;
  }
`;

export const IntegrationLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 1300px) {
    gap: 0.75rem;
  }
`;

export const IconWrapper = styled.div`
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--color-border-light);

  @media (max-width: 1300px) {
    width: 32px;
    height: 32px;
  }
`;

export const BankLogo = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

export const TextInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

export const BankTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const BankTitle = styled.h4`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-main);

  @media (max-width: 1300px) {
    font-size: 0.9rem;
  }
`;

export const BankDescription = styled.p`
  margin: 4px 0 0 0;
  color: var(--color-text-secondary);
  font-size: 0.85rem;
`;

export const ConnectionStatus = styled.div<{
  $connected: boolean;
  $syncing?: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: ${(props) =>
    props.$syncing
      ? "var(--color-brand-600)"
      : props.$connected
        ? "var(--color-success)"
        : "var(--color-text-secondary)"};
  background-color: ${(props) =>
    props.$syncing
      ? "var(--color-brand-50)"
      : props.$connected
        ? "var(--color-success-50)"
        : "var(--color-bg-secondary)"};
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  white-space: nowrap;

  & .spin {
    animation: ${spin} 1s linear infinite;
  }
`;

export const ActionsRight = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const SyncButton = styled(Button)<{ $isSpinning?: boolean }>`
  width: 38px;
  height: 38px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;

  svg {
    ${(props) =>
      props.$isSpinning &&
      css`
        animation: ${spin} 1s linear infinite;
      `}
  }
`;

export const IconButton = styled(Button)`
  width: 38px;
  height: 38px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;

  /* 🔥 Додаємо стилізацію для danger */
  ${(props) =>
    props.$variation === "danger" &&
    css`
      background-color: var(--color-red-50);
      color: var(--color-red-600);
      border: 1px solid var(--color-red-200);

      &:hover {
        background-color: var(--color-red-600) !important;
        color: white;
        border-color: var(--color-red-600);
      }

      /* Або якщо кнопка disabled */
      &:disabled {
        background-color: var(--color-red-50) !important;
        color: var(--color-red-200);
        border-color: var(--color-red-100);
        cursor: not-allowed;
      }
    `}
`;
