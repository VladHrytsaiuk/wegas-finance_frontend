import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { HiExclamationTriangle } from "react-icons/hi2";
import { Button } from "../ui/Button";
import Spinner from "../ui/Spinner";

// Без власного фону й тіней: компонент рендериться всередині модалки.
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.5rem;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
`;

const WarningIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: var(--color-warning-light);
  color: var(--color-warning);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
`;

const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-text-main);
`;

const Text = styled.p`
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin-bottom: 0.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  width: 100%;
  justify-content: center;
`;

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
          variation="secondary"
          onClick={onClose}
          disabled={isPending}
          type="button"
        >
          {t("settings:integrations.mono_flow_btn_cancel")}
        </Button>

        <Button variation="danger" onClick={onConfirm} disabled={isPending}>
          {isPending ? (
            <Spinner size="1.6rem" />
          ) : (
            t("settings:integrations.mono_flow_btn_disconnect")
          )}
        </Button>
      </ButtonGroup>
    </Container>
  );
}
