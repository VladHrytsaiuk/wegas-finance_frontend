import { useCallback, useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { HiXMark } from "react-icons/hi2";
import { useTranslation } from "react-i18next";

// Components
import { AccountForm } from "./form/AccountForm";
import ConfirmCloseModal from "../ui/ConfirmCloseModal"; // Перевір шлях
import { Overlay, StyledModal, ModalCloseButton } from "../ui/Modal";
import Modal, { useModal } from "../ui/Modal";

// Hooks
import { useAccountsData } from "../../hooks/Accounts/useAccountsData";
import { useIsMobile } from "../../hooks/useIsMobile";

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
  const location = useLocation();
  const isMobile = useIsMobile(1001);
  const { open, openName, close } = useModal();

  const { users, actions } = useAccountsData();
  const { create } = actions;
  const isCreating = create.isPending;
  const previousOpenName = useRef(openName);

  useEffect(() => {
    open("create-account");
  }, [open]);

  useEffect(() => {
    if (previousOpenName.current === "create-account" && openName === "") {
      const background = location.state?.background;
      const fallbackPath = "/accounts";
      const targetPath = background
        ? `${background.pathname}${background.search}${background.hash}`
        : fallbackPath;

      navigate(targetPath, { replace: true });
    }
    previousOpenName.current = openName;
  }, [location.state, openName, navigate]);

  return (
    <Modal.Window name="create-account" mobileBottomSheet padding="1.5rem">
      <div style={{ width: isMobile ? "100%" : "fit-content", maxWidth: isMobile ? "none" : "95vw" }}>
        <h2
          style={{
            marginBottom: "1rem",
            fontSize: "1.25rem",
            fontWeight: 600,
          }}
        >
          {t("accounts:accountsPage.modal_create_title")}
        </h2>

        <AccountForm
          onSubmit={(data, options) => {
            create.mutate(data, {
              onSuccess: () => {
                options?.onSuccess?.();
              },
            });
          }}
          isLoading={isCreating}
          users={users || []}
          onCloseModal={close}
        />
      </div>
    </Modal.Window>
  );
}
