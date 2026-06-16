import styled from "styled-components";
import { Button } from "./Button";
import { useTranslation } from "react-i18next"; // ⬅️ ІМПОРТ ДЛЯ ПЕРЕКЛАДУ

const StyledConfirm = styled.div`
  width: 100%;
  max-width: 32rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  & h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-text-main);
  }

  & p {
    color: var(--color-text-secondary);
    margin-bottom: 1.2rem;
    font-size: 0.95rem;
    line-height: 1.5;
  }

  & div {
    display: flex;
    justify-content: flex-end;
    gap: 0.8rem;
  }
`;

const ConfirmButton = styled(Button)`
  background-color: var(--color-brand-600);
  width: auto;

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
  const { t } = useTranslation(); // ⬅️ ВИКОРИСТАННЯ ХУКА

  return (
    <StyledConfirm>
      {/* ➡️ ПЕРЕКЛАД ЗАГОЛОВКА */}
      <h3>{t("auth:auth.logout_confirm_title")}</h3>
      {/* ➡️ ПЕРЕКЛАД ПОВІДОМЛЕННЯ */}
      <p>{t("auth:auth.logout_confirm_message")}</p>

      <div>
        <CancelButton onClick={onCloseModal}>
          {/* ➡️ ПЕРЕКЛАД КНОПКИ */}
          {t("auth:auth.logout_button_cancel")}
        </CancelButton>
        <ConfirmButton onClick={onConfirm}>
          {/* ➡️ ПЕРЕКЛАД КНОПКИ */}
          {t("auth:auth.logout_button_confirm")}
        </ConfirmButton>
      </div>
    </StyledConfirm>
  );
}

export default ConfirmLogout;
