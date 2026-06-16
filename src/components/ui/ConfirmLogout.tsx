import styled from "styled-components";
import { Button } from "./Button";
import { useTranslation } from "react-i18next";

const StyledConfirm = styled.div`
  width: 100%;
  max-width: 32rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;

  & h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-text-main);
    line-height: 1.2;

    @media (max-width: 480px) {
      font-size: 1.25rem;
    }
  }

  & p {
    color: var(--color-text-secondary);
    font-size: 1rem;
    line-height: 1.5;

    @media (max-width: 480px) {
      font-size: 0.95rem;
    }
  }

  & div {
    display: flex;
    justify-content: flex-end;
    gap: 0.8rem;
    margin-top: 0.5rem;

    @media (max-width: 480px) {
      gap: 0.5rem;
    }
  }
`;

const ConfirmButton = styled(Button)`
  background-color: var(--color-brand-600);
  width: auto;

  @media (max-width: 480px) {
    flex: 1;
    font-size: 0.85rem;
    padding: 0 0.5rem;
    height: 42px;
  }

  &:hover {
    background-color: var(--color-brand-700);
  }
`;

const CancelButton = styled(Button)`
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-main);
  box-shadow: none;
  width: auto;

  @media (max-width: 480px) {
    flex: 1;
    font-size: 0.85rem;
    padding: 0 0.5rem;
    height: 42px;
  }

  &:hover {
    background-color: var(--color-bg-page);
    border-color: var(--color-text-light);
  }
`;

interface ConfirmLogoutProps {
  onConfirm: () => void;
  onCloseModal?: () => void; // Приходить автоматично з Modal.Window
}

function ConfirmLogout({ onConfirm, onCloseModal }: ConfirmLogoutProps) {
  const { t } = useTranslation();

  return (
    <StyledConfirm>
      <h3>{t("auth:auth.logout_confirm_title")}</h3>
      <p>{t("auth:auth.logout_confirm_message")}</p>

      <div>
        <CancelButton onClick={onCloseModal}>
          {t("auth:auth.logout_button_cancel")}
        </CancelButton>
        <ConfirmButton onClick={onConfirm}>
          {t("auth:auth.logout_button_confirm")}
        </ConfirmButton>
      </div>
    </StyledConfirm>
  );
}

export default ConfirmLogout;
