import { useEffect, useRef } from "react";
import styled from "styled-components";
import { Button } from "./Button";
import { useTranslation } from "react-i18next";
import { useEscapeKey } from "../../hooks/useEscapeKey";

const StyledConfirmDelete = styled.div`
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
    font-size: 0.95rem;
    line-height: 1.5;
  }

  & div {
    display: flex;
    justify-content: flex-end;
    gap: 0.8rem;

    @media (max-width: 480px) {
      gap: 0.5rem;
    }
  }
`;

// Червона кнопка
const DangerButton = styled(Button).attrs({ variation: "danger" })`
  width: auto;

  @media (max-width: 480px) {
    flex: 1;
    height: 42px;
    font-size: 0.85rem;
    padding: 0 0.5rem;
  }
`;

// Сіра кнопка скасування
const CancelButton = styled(Button).attrs({ variation: "secondary" })`
  width: auto;

  @media (max-width: 480px) {
    flex: 1;
    height: 42px;
    font-size: 0.85rem;
    padding: 0 0.5rem;
  }
`;

interface ConfirmDeleteProps {
  resourceName: string;
  onConfirm: () => void;
  disabled?: boolean;
  onCloseModal?: () => void;
}

function ConfirmDelete({
  resourceName,
  onConfirm,
  disabled,
  onCloseModal,
}: ConfirmDeleteProps) {
  const { t } = useTranslation();
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  useEscapeKey(() => onCloseModal?.());

  useEffect(() => {
    // Фокусуємо кнопку скасування при відкритті для безпеки
    cancelBtnRef.current?.focus();
  }, []);

  const handleDelete = () => {
    onConfirm();
    onCloseModal?.();
  };

  return (
    <StyledConfirmDelete role="alertdialog" aria-modal="true">
      <h3>
        {t("common:confirmDelete.title_prefix")} {resourceName}
      </h3>
      <p>
        {t("common:confirmDelete.message_part1")} {resourceName}
        {t("common:confirmDelete.message_part2")}
      </p>

      <div>
        <CancelButton
          disabled={disabled}
          onClick={onCloseModal}
          ref={cancelBtnRef}
        >
          {t("common:confirmDelete.button_cancel")}
        </CancelButton>

        <DangerButton disabled={disabled} onClick={handleDelete}>
          {disabled
            ? t("common:confirmDelete.button_deleting")
            : t("common:confirmDelete.button_delete")}
        </DangerButton>
      </div>
    </StyledConfirmDelete>
  );
}

export default ConfirmDelete;
