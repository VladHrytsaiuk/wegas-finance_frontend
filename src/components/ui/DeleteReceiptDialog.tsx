import { HiTrash, HiPhoto, HiRectangleStack } from "react-icons/hi2";

import { useDeleteReceiptDialog } from "../../hooks/ui/useDeleteReceiptDialog";
import * as S from "./DeleteReceiptDialog.styles";

interface DeleteReceiptDialogProps {
  onCloseModal?: () => void;
  onDeleteCurrent: () => void;
  onDeleteAll: () => void;
  isDeleting: boolean;
  isSinglePhoto: boolean;
}

export const DeleteReceiptDialog = (props: DeleteReceiptDialogProps) => {
  const { isDeleting, isSinglePhoto, onCloseModal } = props;
  const { t, handlers } = useDeleteReceiptDialog(props);

  return (
    <S.Container>
      <S.IconWrapper>
        <HiTrash />
      </S.IconWrapper>

      <S.Title>{t("confirmDelete.title_prefix")}</S.Title>

      <S.Description>
        {t(
          "receipts.delete_warning",
          "Ви збираєтесь видалити файл. Цю дію неможливо скасувати."
        )}
      </S.Description>

      <S.ButtonGroup>
        <S.DeleteButton
          variation="danger"
          size="medium"
          onClick={handlers.handleDeleteCurrent}
          disabled={isDeleting}
        >
          <HiPhoto style={{ marginRight: "8px" }} />
          {t("receipts.delete_this", "Видалити це фото")}
        </S.DeleteButton>

        {!isSinglePhoto && (
          <S.DeleteAllButton
            size="medium"
            onClick={handlers.handleDeleteAll}
            disabled={isDeleting}
          >
            <HiRectangleStack style={{ marginRight: "8px" }} />
            {t("receipts.delete_all", "Видалити всі фото")}
          </S.DeleteAllButton>
        )}

        <S.CancelButton
          variation="secondary"
          size="medium"
          onClick={onCloseModal}
          disabled={isDeleting}
        >
          {t("confirmDelete.button_cancel")}
        </S.CancelButton>
      </S.ButtonGroup>
    </S.Container>
  );
};
