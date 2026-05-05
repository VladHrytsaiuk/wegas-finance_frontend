import Modal from "../ui/Modal";
import ConfirmDelete from "../ui/ConfirmDelete";
import CounterpartyForm from "./form";
import CounterpartyCategoryForm from "./form";
import { useTranslation } from "react-i18next";

interface CounterpartyModalsProps {
  selectedCp: any;
  selectedCat: any;
  itemToDelete: { id: string; name: string; isCategory: boolean } | null;
  actions: any;
  onCloseSelection: () => void;
}

export function CounterpartyModals({
  selectedCp,
  selectedCat,
  itemToDelete,
  actions,
  onCloseSelection,
}: CounterpartyModalsProps) {
  const { t } = useTranslation();

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    if (itemToDelete.isCategory) {
      actions.deleteCat.mutate(itemToDelete.id);
    } else {
      actions.deleteCp.mutate(itemToDelete.id);
    }
  };

  const onSuccess = () => {
    onCloseSelection();
  };

  const resourceName =
    itemToDelete?.name || t("counterparties:counterpartiesPage.delete_default_name");

  return (
    <>
      {/* 1. Створення Категорії */}
      <Modal.Window name="create-cat">
        <div style={{ width: "400px" }}>
          <CounterpartyCategoryForm
            onSubmit={(data) => actions.createCat.mutate(data)}
            isLoading={actions.createCat.isPending}
          />
        </div>
      </Modal.Window>

      {/* 2. Редагування Категорії */}
      <Modal.Window name="edit-cat">
        <div style={{ width: "400px" }}>
          <CounterpartyCategoryForm
            defaultValues={selectedCat}
            onSubmit={(data) =>
              actions.updateCat.mutate(
                { ...data, id: selectedCat?.id },
                { onSuccess },
              )
            }
            isLoading={actions.updateCat.isPending}
          />
        </div>
      </Modal.Window>

      {/* 3. Створення Контрагента */}
      <Modal.Window name="create-cp">
        <div style={{ width: "560px" }}>
          <CounterpartyForm
            onSubmit={(data) => actions.createCp.mutate(data)}
            isLoading={actions.createCp.isPending}
          />
        </div>
      </Modal.Window>

      {/* 4. Редагування Контрагента */}
      <Modal.Window name="edit-cp">
        <div style={{ width: "560px" }}>
          <CounterpartyForm
            defaultValues={selectedCp}
            onSubmit={(data) =>
              actions.updateCp.mutate(
                { ...data, id: selectedCp?.id },
                { onSuccess },
              )
            }
            isLoading={actions.updateCp.isPending}
          />
        </div>
      </Modal.Window>

      {/* 5. Видалення */}
      <Modal.Window name="delete-confirm">
        <ConfirmDelete
          resourceName={resourceName}
          onConfirm={handleConfirmDelete}
          disabled={actions.deleteCp.isPending || actions.deleteCat.isPending}
        />
      </Modal.Window>
    </>
  );
}
