import { useModal } from "../ui/Modal";
import { useMonobank } from "../../hooks/Settings/useMonobank";
import * as S from "./MonobankModal.styles";

// Steps Components
import StepInput from "./steps/StepInput";
import StepLoading from "./steps/StepLoading";
import StepRateLimit from "./steps/StepRateLimit";
import StepActive from "./steps/StepActive";
import StepSelection from "./steps/StepSelection";

function MonobankModal() {
  const { close } = useModal();
  const { state, actions } = useMonobank();
  const { step } = state;

  return (
    <S.Container>
      {step === "input" && (
        <StepInput state={state} actions={actions} onClose={close} />
      )}

      {step === "loading" && <StepLoading />}

      {step === "rate_limit" && <StepRateLimit onClose={close} />}

      {step === "selection" && (
        <StepSelection state={state} actions={actions} onClose={close} />
      )}

      {step === "active" && <StepActive onClose={close} />}
    </S.Container>
  );
}

export default MonobankModal;
