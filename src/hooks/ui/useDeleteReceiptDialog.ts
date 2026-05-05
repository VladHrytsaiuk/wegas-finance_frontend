import { useTranslation } from "react-i18next";

interface UseDeleteReceiptDialogProps {
  onCloseModal?: () => void;
  onDeleteCurrent: () => void;
  onDeleteAll: () => void;
}

export const useDeleteReceiptDialog = ({
  onCloseModal,
  onDeleteCurrent,
  onDeleteAll,
}: UseDeleteReceiptDialogProps) => {
  const { t } = useTranslation();

  const handleDeleteCurrent = () => {
    onDeleteCurrent();
    // Тут ми не закриваємо модалку автоматично, бо можливо
    // батьківський компонент просто перемикає на наступне фото
    // або закриває сам після успішного видалення.
  };

  const handleDeleteAll = () => {
    onDeleteAll();
    onCloseModal?.();
  };

  return {
    t,
    handlers: {
      handleDeleteCurrent,
      handleDeleteAll,
    },
  };
};
