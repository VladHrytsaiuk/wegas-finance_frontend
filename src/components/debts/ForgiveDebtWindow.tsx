import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useModal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { AccountSelect } from "../accounts/form/AccountSelect";
import type { Account } from "../../types";

interface Props {
  onConfirm: (data: { accountId: string; onSuccessClose: () => void }) => void;
  isLoading: boolean;
  accounts: Account[];
}

export const ForgiveDebtWindow = ({
  onConfirm,
  isLoading,
  accounts,
}: Props) => {
  const { t } = useTranslation();
  const { close } = useModal();
  const [accountId, setAccountId] = useState("");

  const handleConfirm = () => {
    onConfirm({ accountId, onSuccessClose: close });
  };

  return (
    <div
      style={{
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        maxWidth: "400px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🤝</div>

      {/* transactions.forgiven = "Списання боргу" */}
      <h3 style={{ fontSize: "1.25rem", fontWeight: 600 }}>
        {t("transactions:transactions.forgiven")}
      </h3>

      {/* debtsPage.forgive_description = "Ви збираєтесь списати..." */}
      <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
        {t("goals_debts:debtsPage.forgive_description")}
      </p>

      <div style={{ textAlign: "left" }}>
        {/* debtsPage.technical_account = "Технічний рахунок..." */}
        <label
          style={{
            display: "block",
            marginBottom: "0.5rem",
            fontWeight: 500,
            fontSize: "0.9rem",
          }}
        >
          {t("goals_debts:debtsPage.technical_account")}:
        </label>

        <AccountSelect
          accounts={accounts}
          value={accountId}
          onChange={setAccountId}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "1rem",
          marginTop: "1rem",
        }}
      >
        {/* transactionForm.button_cancel = "Скасувати" */}
        <Button variation="secondary" onClick={close} disabled={isLoading}>
          {t("transactions:transactionForm.button_cancel")}
        </Button>

        {/* debtsPage.btn_confirm_forgive = "Списати назавжди" */}
        <Button disabled={!accountId || isLoading} onClick={handleConfirm}>
          {isLoading
            ? t("common:shared.loading")
            : t("goals_debts:debtsPage.btn_confirm_forgive")}
        </Button>
      </div>
    </div>
  );
};
