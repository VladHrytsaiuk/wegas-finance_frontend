import { useCallback, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { HiXMark } from "react-icons/hi2";
import { useTranslation } from "react-i18next"; // ✅ Додано

import Modal, { useModal } from "../ui/Modal";
import { AccountForm } from "./form/AccountForm";
import { CenteredSpinner } from "../ui/CenteredSpinner";

import { useAccountsData } from "../../hooks/Accounts/useAccountsData";
import { getAccountApi } from "../../services/apiAccounts";
import { useIsMobile } from "../../hooks/useIsMobile";

function EditAccountModal() {
  const { t } = useTranslation(); // ✅ Додано
  const navigate = useNavigate();
  const location = useLocation();
  const { accountId } = useParams();

  const { users, actions } = useAccountsData();
  const { mutate: updateAccount, isPending: isUpdating } = actions.update;

  const { data: account, isLoading } = useQuery({
    queryKey: ["account", accountId],
    queryFn: () => getAccountApi(accountId!),
    enabled: !!accountId,
  });

  const { open, openName, close } = useModal();
  const previousOpenName = useRef(openName);
  const isMobile = useIsMobile();

  useEffect(() => {
    open("edit-account");
  }, [open]);

  useEffect(() => {
    if (previousOpenName.current === "edit-account" && openName === "") {
      const background = location.state?.background;
      const fallbackPath = `/accounts/${accountId}`;
      const targetPath = background
        ? `${background.pathname}${background.search}${background.hash}`
        : fallbackPath;

      navigate(targetPath, { replace: true });
    }
    previousOpenName.current = openName;
  }, [accountId, location.state, openName, navigate]);

  return (
    <Modal.Window name="edit-account" mobileBottomSheet padding="1.5rem">
      <div style={{ width: isMobile ? "100%" : "fit-content", maxWidth: isMobile ? "none" : "95vw" }}>
        <h3 style={{ marginBottom: "1.5rem" }}>
          {t("accounts:accountsPage.modal_edit_title")}
        </h3>

        {isLoading ? (
          <CenteredSpinner isContainer />
        ) : (
          <AccountForm
            defaultValues={account}
            onSubmit={(data, options) => updateAccount(data, options)}
            isLoading={isUpdating}
            users={users || []}
            onCloseModal={close}
          />
        )}
      </div>
    </Modal.Window>
  );
}

export default function EditAccountModalWrapper() {
  return (
    <Modal>
      <EditAccountModal />
    </Modal>
  );
}
