import { HiOutlineTag, HiTrash } from "react-icons/hi2";
import { useTranslation } from "react-i18next"; // ⬅️ ІМПОРТ ДЛЯ ПЕРЕКЛАДУ
import Modal from "../ui/Modal";
import ConfirmDelete from "../ui/ConfirmDelete";
import { StyledTag, DeleteButton } from "./TagItem.styles";

// === COMPONENT ===
interface TagItemProps {
  tag: {
    id: string;
    name: string;
    color: string;
  };
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export function TagItem({ tag, onDelete, isDeleting }: TagItemProps) {
  const { t } = useTranslation(); // ⬅️ ВИКОРИСТАННЯ ХУКА

  return (
    <StyledTag $color={tag.color}>
      <HiOutlineTag />
      <span>{tag.name}</span>

      <Modal.Open opens={`delete-tag-${tag.id}`}>
        <DeleteButton
          // ➡️ ПЕРЕКЛАД ПІДКАЗКИ
          title={t("tagItem.tooltip_delete")}
        >
          <HiTrash />
        </DeleteButton>
      </Modal.Open>

      <Modal.Window name={`delete-tag-${tag.id}`}>
        <ConfirmDelete
          // ➡️ ПЕРЕКЛАД ІМЕНІ РЕСУРСУ (З ІНТЕРПОЛЯЦІЄЮ)
          resourceName={t("tagItem.resource_name_delete", { name: tag.name })}
          onConfirm={() => onDelete(tag.id)}
          disabled={isDeleting}
        />
      </Modal.Window>
    </StyledTag>
  );
}
