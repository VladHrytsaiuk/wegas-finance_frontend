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

const LeaveButton = styled(Button)`
  background-color: var(--color-red-700);
  color: white;
  border: 1px solid var(--color-red-700);
  width: auto;

  @media (max-width: 480px) {
    flex: 1;
    font-size: 0.8rem;
    padding: 0 0.4rem;
    height: 42px;
  }

  &&:hover:not(:disabled) {
    background-color: var(--color-red-800);
    border-color: var(--color-red-800);
    box-shadow: var(--shadow-md);
  }

  &&:active:not(:disabled) {
    background-color: var(--color-red-800);
  }
`;

const StayButton = styled(Button)`
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-main);
  box-shadow: none;
  width: auto;

  @media (max-width: 480px) {
    flex: 1;
    font-size: 0.8rem;
    padding: 0 0.4rem;
    height: 42px;
  }

  &&:hover:not(:disabled) {
    background-color: var(--color-bg-page);
    border-color: var(--color-text-secondary);
    color: var(--color-text-main);
  }
`;

interface ConfirmCloseProps {
  onConfirm: () => void;
  onCloseModal?: () => void;
}

function ConfirmCloseModal({ onConfirm, onCloseModal }: ConfirmCloseProps) {
  const { t } = useTranslation();

  return (
    <StyledConfirm>
      <h3>{t("common:common.unsaved_changes_title", "Незбережені зміни")}</h3>
      <p>
        {t(
          "common.unsaved_changes_message",
          "Ви ввели дані у форму. Якщо ви закриєте вікно зараз, усі зміни будуть втрачені. Ви впевнені?",
        )}
      </p>

      <div>
        <StayButton onClick={onCloseModal}>
          {t("common:common.stay", "Продовжити редагування")}
        </StayButton>

        <LeaveButton onClick={onConfirm}>
          {t("common:common.leave", "Закрити та втратити дані")}
        </LeaveButton>
      </div>
    </StyledConfirm>
  );
}

export default ConfirmCloseModal;
