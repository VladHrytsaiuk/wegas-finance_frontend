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

// Червона кнопка
const DangerButton = styled(Button)`
  background-color: var(--color-red-700);
  color: white;
  border: 1px solid var(--color-red-700);
  width: auto;

  @media (max-width: 480px) {
    flex: 1;
    font-size: 0.85rem;
    padding: 0 0.5rem;
    height: 42px;
  }

  /* Використовуємо && щоб підвищити пріоритет (CSS specificity) */
  &&:hover:not(:disabled) {
    background-color: var(--color-red-800);
    border-color: var(--color-red-800);
    box-shadow: var(--shadow-md);
  }

  /* Також фіксимо активний стан, щоб не ставав зеленим при кліку */
  &&:active:not(:disabled) {
    background-color: var(--color-red-800);
  }

  &:disabled {
    background-color: var(--color-text-light);
    border-color: transparent;
    cursor: not-allowed;
  }
`;

// Сіра кнопка скасування
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

  /* Використовуємо && для перебивання стилів базової кнопки */
  &&:hover:not(:disabled) {
    background-color: var(--color-bg-page);
    border-color: var(--color-text-secondary);
    color: var(
      --color-text-main
    ); /* Щоб текст не ставав білим, якщо у Button це прописано */
  }

  &:disabled {
    color: var(--color-text-tertiary);
    border-color: var(--color-border);
    cursor: not-allowed;
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
