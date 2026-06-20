import Modal from "../ui/Modal";
import ConfirmDelete from "../ui/ConfirmDelete";
import CounterpartyForm from "./form";
import { CounterpartyCategoryForm } from "./CounterpartyCategoryForm";
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
      <Modal.Window name="create-cat" padding="0" mobileBottomSheet>
        <CounterpartyCategoryForm
          onSubmit={(data) => actions.createCat.mutate(data)}
          isLoading={actions.createCat.isPending}
        />
      </Modal.Window>

      {/* 2. Редагування Категорії */}
      <Modal.Window name="edit-cat" padding="0" mobileBottomSheet>
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
      </Modal.Window>

      {/* 3. Створення Контрагента */}
      <Modal.Window name="create-cp" padding="2rem 2.5rem" mobileBottomSheet>
        <CounterpartyForm
          onSubmit={(data) => actions.createCp.mutate(data)}
          isLoading={actions.createCp.isPending}
        />
      </Modal.Window>

      {/* 4. Редагування Контрагента */}
      <Modal.Window name="edit-cp" padding="2rem 2.5rem" mobileBottomSheet>
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
      </Modal.Window>

      {/* 5. Видалення */}
      <Modal.Window name="delete-confirm" mobileBottomSheet>
        {itemToDelete?.hasDebt ? (
          <div style={{
            width: "100%",
            maxWidth: "32rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            textAlign: "center",
            alignItems: "center",
            padding: "2rem"
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🚫</div>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--color-text-main)", margin: 0 }}>
              {t("common:common.delete")}
            </h3>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem", lineHeight: 1.5, margin: 0 }}>
              Ви не можете видалити контрагента з активним балансом. Спочатку
              спишіть борг або погасіть його у розділі боргів.
            </p>
          </div>
        ) : (
          <ConfirmDelete
            resourceName={resourceName}
            onConfirm={handleConfirmDelete}
            disabled={actions.deleteCp.isPending || actions.deleteCat.isPending}
          />
        )}
      </Modal.Window>
    </>
  );
}
