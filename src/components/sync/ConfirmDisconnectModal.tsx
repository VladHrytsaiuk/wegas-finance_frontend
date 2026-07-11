import { useTranslation } from "react-i18next";
import { HiExclamationTriangle } from "react-icons/hi2";
import { Button } from "../ui/Button";
import Spinner from "../ui/Spinner";

// ... rest of styled components

interface Props {
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

export function ConfirmDisconnectModal({
  onClose,
  onConfirm,
  isPending,
}: Props) {
  const { t } = useTranslation();

  return (
    <Container>
      <WarningIcon>
        <HiExclamationTriangle />
      </WarningIcon>

      <div>
        <Title>{t("settings:integrations.disconnect_modal_title")}</Title>
        <Text>{t("settings:integrations.disconnect_modal_desc")}</Text>
      </div>

      <ButtonGroup>
        <Button
          $variation="secondary"
          onClick={onClose}
          disabled={isPending}
          type="button"
        >
          {t("settings:integrations.mono_flow_btn_cancel")}
        </Button>

        <Button $variation="danger" onClick={onConfirm} disabled={isPending}>
          {isPending ? (
            <Spinner size="sm" />
          ) : (
            t("settings:integrations.mono_flow_btn_disconnect")
          )}
        </Button>
      </ButtonGroup>
    </Container>
  );
}
