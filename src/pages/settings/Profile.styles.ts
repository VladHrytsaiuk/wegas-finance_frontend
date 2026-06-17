import styled, { keyframes, css } from "styled-components";
import { Button } from "../../components/ui/Button";

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

export const PageContainer = styled.div`
  max-width: 600px;
`;

export const SectionTitle = styled.h2`
  font-size: 1.15rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
  color: var(--color-text-main);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0.75rem;
`;

export const Form = styled.form`
  margin-bottom: 2rem;
  max-width: 500px;
`;

export const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 0.4rem;
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--color-text-main);
`;

export const IntegrationsSection = styled.div`
  margin-top: 2rem;
  border-top: 1px solid var(--color-border);
  padding-top: 1.5rem;
`;

export const IntegrationCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background-color: var(--color-bg-surface);
  box-shadow: var(--shadow-sm);

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

export const IntegrationLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const IconWrapper = styled.div`
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 10px;
  overflow: hidden;
  background-color: var(--color-bg-page);
`;

export const BankLogo = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
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
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text-main);
`;

export const BankDescription = styled.p`
  margin: 2px 0 0 0;
  color: var(--color-text-secondary);
  font-size: 0.8rem;
`;

export const ConnectionStatus = styled.div<{
  $connected: boolean;
  $syncing?: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  font-weight: 800;
  color: ${(props) =>
    props.$syncing
      ? "var(--color-brand-600)"
      : props.$connected
        ? "var(--color-success)"
        : "var(--color-grey-500)"};
  background-color: ${(props) =>
    props.$syncing
      ? "var(--color-brand-50)"
      : props.$connected
        ? "var(--color-success-50)"
        : "var(--color-grey-100)"};
  padding: 0.2rem 0.6rem;
  border-radius: 100px;
  white-space: nowrap;
  border: 1px solid ${(props) => 
    props.$syncing 
      ? "var(--color-brand-200)" 
      : props.$connected 
        ? "var(--color-success-200)" 
        : "var(--color-grey-200)"};

  svg {
    width: 12px;
    height: 12px;
  }

  & .spin {
    animation: ${spin} 1s linear infinite;
  }
`;

export const ActionsRight = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const SyncButton = styled(Button)<{ $isSpinning?: boolean }>`
  width: 34px;
  height: 34px;
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

export const SecuritySection = styled.div`
  margin-top: 2.5rem;
  border-top: 1px solid var(--color-border);
  padding-top: 1.5rem;
`;

export const SecurityCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background-color: var(--color-bg-surface);
  box-shadow: var(--shadow-sm);
  margin-bottom: 0.75rem;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

export const StatusBadge = styled.div<{ $active: boolean }>`
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 100px;
  background-color: ${props => props.$active ? 'var(--color-success-50)' : 'var(--color-grey-100)'};
  color: ${props => props.$active ? 'var(--color-success-700)' : 'var(--color-grey-500)'};
  border: 1px solid ${props => props.$active ? 'var(--color-success-200)' : 'var(--color-grey-200)'};
  width: fit-content;
  white-space: nowrap;
  align-self: center;
`;

export const IconButton = styled(Button)`
  width: 34px;
  height: 34px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;

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
    `}
`;
