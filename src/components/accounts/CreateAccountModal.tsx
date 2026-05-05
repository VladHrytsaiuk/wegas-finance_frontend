import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { HiXMark } from "react-icons/hi2";
import { useTranslation } from "react-i18next";

// Components
import { AccountForm } from "./form/AccountForm";
import ConfirmCloseModal from "../ui/ConfirmCloseModal"; // Перевір шлях
import { Overlay, StyledModal, ModalCloseButton } from "../ui/Modal";
import Modal, { useModal } from "../ui/Modal";

// Hooks
import { useAccountsData } from "../../hooks/Accounts/useAccountsData";

export default function CreateAccountModal() {
  return (
    <Modal>
      <CreateAccountModalContent />
    </Modal>
  );
}

function CreateAccountModalContent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isDirty } = useModal();
  const [showConfirm, setShowConfirm] = useState(false);

  const { users, actions } = useAccountsData();
  const { create } = actions;
  const isCreating = create.isPending;

  const handleCloseAttempt = () => {
    if (isDirty) {
      setShowConfirm(true);
    } else {
      navigate(-1);
    }
  };

  const forceClose = () => {
    navigate(-1);
  };

  // Обробка ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Якщо відкрито підтвердження - закриваємо тільки його
        if (showConfirm) {
          e.stopPropagation();
          setShowConfirm(false);
        } else {
          // Інакше пробуємо закрити форму
          handleCloseAttempt();
        }
      }
    };
    // Використовуємо capture фазу, щоб перехопити подію раніше за інших
    document.addEventListener("keydown", handleEsc, true);
    return () => document.removeEventListener("keydown", handleEsc, true);
  }, [showConfirm, isDirty]);

  return (
    <>
      {/* --- ОСНОВНА МОДАЛКА З ФОРМОЮ --- */}
      {createPortal(
        <Overlay onClick={handleCloseAttempt}>
          <StyledModal
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "fit-content", padding: "2rem" }}
          >
            <ModalCloseButton onClick={handleCloseAttempt}>
              <HiXMark />
            </ModalCloseButton>

            <h2
              style={{
                marginBottom: "1.5rem",
                fontSize: "1.5rem",
                fontWeight: 600,
              }}
            >
              {t("accountsPage.modal_create_title")}
            </h2>

            <AccountForm
              onSubmit={(data, options) => {
                create.mutate(data, {
                  onSuccess: () => {
                    options?.onSuccess?.();
                    forceClose();
                  },
                });
              }}
              isLoading={isCreating}
              users={users || []}
              onCloseModal={handleCloseAttempt}
              onClose={forceClose}
            />
          </StyledModal>
        </Overlay>,
        document.body,
      )}

      {/* --- МОДАЛКА ПІДТВЕРДЖЕННЯ (ОКРЕМИЙ ШАР) --- */}
      {showConfirm &&
        createPortal(
          <Overlay
            onClick={() => setShowConfirm(false)}
            style={{ zIndex: 2000 }} // Вищий z-index, щоб перекрити форму
          >
            <StyledModal
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "fit-content",
                padding: "2.4rem",
                maxWidth: "28rem",
                zIndex: 2001,
              }}
            >
              <ConfirmCloseModal
                onConfirm={forceClose}
                onCloseModal={() => setShowConfirm(false)}
              />
            </StyledModal>
          </Overlay>,
          document.body,
        )}
    </>
  );
}
