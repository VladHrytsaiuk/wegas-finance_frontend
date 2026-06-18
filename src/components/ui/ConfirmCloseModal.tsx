import styled from "styled-components";
import { Button } from "./Button";
import { useTranslation } from "react-i18next";

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
    margin-bottom: 1.5rem;
    font-size: 0.95rem;
    line-height: 1.5;
  }

  & div {
    display: flex;
    justify-content: flex-end;
    gap: 0.8rem;

    @media (max-width: 768px) {
      gap: 0.5rem;
    }
  }
`;

const LeaveButton = styled(Button).attrs({ variation: "danger" })`
  width: auto;

  @media (max-width: 768px) {
    flex: 1;
    height: 42px;
    font-size: 0.85rem;
    padding: 0 0.5rem;
  }
`;

const StayButton = styled(Button).attrs({ variation: "secondary" })`
  width: auto;

  @media (max-width: 768px) {
    flex: 1;
    height: 42px;
    font-size: 0.85rem;
    padding: 0 0.5rem;
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
