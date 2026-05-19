import { useTranslation } from "react-i18next";
import { HiCheckCircle, HiInformationCircle } from "react-icons/hi2";
import { Button } from "../../ui/Button";
import * as S from "../MonobankModal.styles";

export default function StepActive({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();

  return (
    <S.ContentWrapper>
      <S.CenterState>
        <div style={{ marginBottom: "1rem" }}>
          <HiCheckCircle
            style={{ fontSize: "4rem", color: "var(--color-success)" }}
          />
        </div>
        <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
          {t("settings:integrations.mono_flow_step_active_title")}
        </h3>
        <p
          style={{
            color: "var(--color-text-secondary)",
            marginBottom: "1.5rem",
          }}
        >
          {t("settings:integrations.mono_flow_step_active_desc")}
        </p>
        <S.InfoBox>
          <S.InfoTitle>
            <HiInformationCircle size={20} /> {t("settings:integrations.mono_flow_step_active_important")}
          </S.InfoTitle>
          <S.InfoList>
            <li>
              <strong>{t("settings:integrations.mono_flow_step_active_time_warning")}</strong>{" "}
              {t("settings:integrations.mono_flow_step_active_time_desc")}
            </li>
            <li>
              <strong>{t("settings:integrations.mono_flow_step_active_close_warning")}</strong>{" "}
              {t("settings:integrations.mono_flow_step_active_close_desc")}
            </li>
          </S.InfoList>
        </S.InfoBox>
        <Button onClick={onClose}>{t("settings:integrations.mono_flow_step_active_btn_ok")}</Button>
      </S.CenterState>
    </S.ContentWrapper>
  );
}
