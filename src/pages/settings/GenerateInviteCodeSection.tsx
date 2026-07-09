import React, { useState } from "react";
import type { TFunction } from "i18next";
import { HiOutlineQrCode, HiOutlineClock, HiOutlineShieldCheck, HiOutlineUser, HiOutlineFaceSmile } from "react-icons/hi2";
import { Button } from "../../components/ui/Button";
import * as S from "./FamilySettings.styles";

interface GenerateInviteCodeSectionProps {
  inviteCode: string | null;
  timeLeft: number;
  formattedTime: string;
  isGenerating: boolean;
  onGenerate: (roleID: string) => void;
  t: TFunction;
}

export const GenerateInviteCodeSection: React.FC<GenerateInviteCodeSectionProps> = ({
  inviteCode,
  timeLeft,
  formattedTime,
  isGenerating,
  onGenerate,
  t,
}) => {
  const [selectedRole, setSelectedRole] = useState("member");

  const roles = [
    { id: "admin", label: t("settings:userRoles.admin_label"), icon: <HiOutlineShieldCheck /> },
    { id: "member", label: t("settings:userRoles.member_label"), icon: <HiOutlineUser /> },
    { id: "child", label: t("settings:userRoles.child_label"), icon: <HiOutlineFaceSmile /> },
  ];

  return (
    <S.Section>
      <S.SectionHeader>
        <S.SectionTitle>{t("settings:usersPage.invite_title", "Запросити учасника")}</S.SectionTitle>
        <S.SectionDescription>
          {t("settings:usersPage.invite_description", "Згенеруйте тимчасовий код, щоб інший користувач міг приєднатися до вашої сім'ї.")}
        </S.SectionDescription>
      </S.SectionHeader>

      {!inviteCode ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginTop: "1rem" }}>
          {/* Role Selector */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--color-text-main)" }}>
              {t("settings:userForm.label_role", "Роль для нового учасника")}
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.8rem",
                    borderRadius: "12px",
                    border: "2px solid",
                    borderColor: selectedRole === role.id ? "var(--color-brand-500)" : "var(--color-border)",
                    background: selectedRole === role.id ? "var(--color-brand-50)" : "transparent",
                    color: selectedRole === role.id ? "var(--color-brand-700)" : "var(--color-text-secondary)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <span style={{ fontSize: "1.2rem" }}>{role.icon}</span>
                  <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>{role.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={() => onGenerate(selectedRole)}
            isLoading={isGenerating}
            icon={<HiOutlineQrCode />}
            variation="primary"
            size="large"
            style={{ width: "100%" }}
          >
            {t("settings:usersPage.btn_generate_code", "Згенерувати код")}
          </Button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <S.CodeDisplay style={{ opacity: timeLeft === 0 ? 0.6 : 1 }}>
            <S.CodeText style={{ textDecoration: timeLeft === 0 ? "line-through" : "none" }}>
              {inviteCode}
            </S.CodeText>
            <S.TimerText $isUrgent={timeLeft < 30 && timeLeft > 0}>
              <HiOutlineClock size={18} />
              {timeLeft > 0 ? formattedTime : t("common:sync_widget.status_done_short", "Вийшов час")}
            </S.TimerText>
          </S.CodeDisplay>
          
          <Button
            onClick={() => onGenerate(selectedRole)}
            isLoading={isGenerating}
            variation="secondary"
            size="medium"
            style={{ alignSelf: "center" }}
            disabled={timeLeft > 0}
            title={timeLeft > 0 ? `Оновити можна через ${formattedTime}` : ""}
          >
            {t("settings:usersPage.btn_regenerate", "Згенерувати новий")}
          </Button>
        </div>
      )}
    </S.Section>
  );
};
