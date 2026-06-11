import React from "react";
import { HiOutlineQrCode, HiOutlineClock } from "react-icons/hi2";
import { Button } from "../../components/ui/Button";
import * as S from "./TeamSettings.styles";

interface GenerateInviteCodeSectionProps {
  inviteCode: string | null;
  timeLeft: number;
  formattedTime: string;
  isGenerating: boolean;
  onGenerate: () => void;
  t: any;
}

export const GenerateInviteCodeSection: React.FC<GenerateInviteCodeSectionProps> = ({
  inviteCode,
  timeLeft,
  formattedTime,
  isGenerating,
  onGenerate,
  t,
}) => {
  return (
    <S.Section>
      <S.SectionHeader>
        <S.SectionTitle>{t("settings:usersPage.invite_title", "Запросити учасника")}</S.SectionTitle>
        <S.SectionDescription>
          {t("settings:usersPage.invite_description", "Згенеруйте тимчасовий код, щоб інший користувач міг приєднатися до вашої сім'ї.")}
        </S.SectionDescription>
      </S.SectionHeader>

      {!inviteCode ? (
        <S.ActionRow style={{ marginTop: "1rem" }}>
          <Button
            onClick={onGenerate}
            isLoading={isGenerating}
            icon={<HiOutlineQrCode />}
            variation="primary"
            size="large"
            style={{ width: "100%" }}
          >
            {t("settings:usersPage.btn_generate_code", "Згенерувати код")}
          </Button>
        </S.ActionRow>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <S.CodeDisplay>
            <S.CodeText>{inviteCode}</S.CodeText>
            <S.TimerText $isUrgent={timeLeft < 30}>
              <HiOutlineClock size={18} />
              {formattedTime}
            </S.TimerText>
          </S.CodeDisplay>
          
          <Button
            onClick={onGenerate}
            isLoading={isGenerating}
            variation="secondary"
            size="medium"
            style={{ alignSelf: "center" }}
          >
            {t("settings:usersPage.btn_regenerate", "Згенерувати новий")}
          </Button>
        </div>
      )}
    </S.Section>
  );
};
