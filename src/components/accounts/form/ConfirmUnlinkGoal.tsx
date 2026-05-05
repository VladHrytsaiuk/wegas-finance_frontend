import styled from "styled-components";
import { Button } from "../../ui/Button";
import { useTranslation } from "react-i18next";
import { HiExclamationTriangle } from "react-icons/hi2";

const StyledConfirm = styled.div`
  width: 100%;
  max-width: 30rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;

  & h3 {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--color-text-main);
    display: flex;
    align-items: center;
    gap: 12px;
  }

  & p {
    color: var(--color-text-secondary);
    line-height: 1.6;
    font-size: 0.95rem;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 0.5rem;
`;
const WarningButton = styled(Button)`
  && {
    background-color: var(--color-warning);
    color: #fff !important;
    border: 1px solid var(--color-warning);
    width: auto;
    font-weight: 600;
  }

  /* 🔥 Виправляємо ховер, щоб не було зеленого */
  &&:hover:not(:disabled) {
    background-color: var(--color-warning);
    filter: brightness(1.1); /* Робимо трохи яскравішим при наведенні */
    border-color: var(--color-warning);
    box-shadow: var(--shadow-md);
  }

  &&:active:not(:disabled) {
    filter: brightness(0.9); /* Трохи темнішим при кліку */
  }
`;

interface ConfirmUnlinkGoalProps {
  goalName: string;
  onConfirm: () => void;
  onCloseModal?: () => void;
}

function ConfirmUnlinkGoal({
  goalName,
  onConfirm,
  onCloseModal,
}: ConfirmUnlinkGoalProps) {
  const { t } = useTranslation();

  return (
    <StyledConfirm>
      <h3>
        <HiExclamationTriangle
          size={28}
          style={{ color: "var(--color-warning)" }}
        />
        {t("accounts:accountForm.unlink_warning_title", "Зміна типу рахунку")}
      </h3>
      <p>
        {t(
          "accountForm.unlink_warning_message",
          `Цей рахунок зараз прив'язаний до цілі "${goalName || t("common:common.current_goal", "поточної цілі")}". Якщо ви зміните тип на інший, він буде від'єднаний, і її прогрес зменшиться. Ви впевнені?`,
        )}
      </p>

      <ActionButtons>
        <Button variation="secondary" onClick={onCloseModal} type="button">
          {t("common:common.cancel", "Скасувати")}
        </Button>
        <WarningButton
          type="button"
          onClick={() => {
            onConfirm();
            onCloseModal?.();
          }}
        >
          {t("common:common.confirm_change", "Так, змінити тип")}
        </WarningButton>
      </ActionButtons>
    </StyledConfirm>
  );
}

export default ConfirmUnlinkGoal;
