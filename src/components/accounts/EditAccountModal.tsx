import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { HiXMark } from "react-icons/hi2";
import { useTranslation } from "react-i18next"; // ✅ Додано

import { Overlay, StyledModal, ModalCloseButton } from "../ui/Modal";
import { AccountForm } from "./form/AccountForm";
import Spinner from "../ui/Spinner";

import { useAccountsData } from "../../hooks/Accounts/useAccountsData";
import { getAccountApi } from "../../services/apiAccounts";

function EditAccountModal() {
  const { t } = useTranslation(); // ✅ Додано
  const navigate = useNavigate();
  const { accountId } = useParams();

  const { users, actions } = useAccountsData();
  const { mutate: updateAccount, isPending: isUpdating } = actions.update;

  const { data: account, isLoading } = useQuery({
    queryKey: ["account", accountId],
    queryFn: () => getAccountApi(accountId!),
    enabled: !!accountId,
  });

  const handleClose = () => navigate(-1);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  return createPortal(
    <Overlay onClick={handleClose}>
      <StyledModal onClick={(e) => e.stopPropagation()}>
        <ModalCloseButton onClick={handleClose}>
          <HiXMark />
        </ModalCloseButton>

        <div style={{ width: "900px", maxWidth: "95vw" }}>
          {/* ✅ Локалізовано заголовок */}
          <h3 style={{ marginBottom: "1.5rem" }}>
            {t("accounts:accountsPage.modal_edit_title")}
          </h3>

          {isLoading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "2rem",
              }}
            >
              <Spinner />
            </div>
          ) : (
            <AccountForm
              defaultValues={account}
              onSubmit={(data, options) => updateAccount(data, options)}
              isLoading={isUpdating}
              users={users || []}
              onClose={handleClose}
            />
          )}
        </div>
      </StyledModal>
    </Overlay>,
    document.body
  );
}

export default EditAccountModal;
