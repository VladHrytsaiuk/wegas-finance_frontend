import { useTranslation } from "react-i18next";
import { HiExclamationTriangle } from "react-icons/hi2";
import { Button } from "../../ui/Button";
import * as S from "../MonobankModal.styles";

export default function StepRateLimit({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();

  return (
    <S.ContentWrapper>
      <S.CenterState>
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            backgroundColor: "var(--color-warning-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-warning-dark)",
          }}
        >
          <HiExclamationTriangle size={40} />
        </div>
        <div>
          <h3
            style={{
              fontSize: "1.2rem",
              fontWeight: 600,
              marginBottom: "0.5rem",
            }}
          >
            {t("settings:integrations.mono_flow_step_limit_title")}
          </h3>
          <S.Description>{t("settings:integrations.mono_flow_step_limit_desc")}</S.Description>
        </div>
        <S.FooterRow>
          <Button onClick={onClose} $variation="secondary">
            {t("settings:integrations.mono_flow_step_limit_btn_close")}
          </Button>
        </S.FooterRow>
      </S.CenterState>
    </S.ContentWrapper>
  );
}
