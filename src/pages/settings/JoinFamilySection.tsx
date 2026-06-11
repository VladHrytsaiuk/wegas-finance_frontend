import React, { useEffect } from "react";
import { HiOutlineUserPlus } from "react-icons/hi2";
import { Button } from "../../components/ui/Button";
import { useOtpInput } from "../../hooks/useOtpInput";
import * as S from "./TeamSettings.styles";

interface JoinFamilySectionProps {
  isJoining: boolean;
  onJoin: (code: string) => void;
  t: any;
}

export const JoinFamilySection: React.FC<JoinFamilySectionProps> = ({
  isJoining,
  onJoin,
  t,
}) => {
  const {
    otp,
    otpString,
    inputRefs,
    handleChange,
    handleKeyDown,
    handlePaste,
    resetOtp,
  } = useOtpInput(6);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Strictly combine and trim
    const finalCode = otp.join("").trim();
    
    if (finalCode.length === 6) {
      onJoin(finalCode);
    }
  };

  // Reset OTP when component mounts (or when modal opens if parent handles it)
  useEffect(() => {
    resetOtp();
  }, [resetOtp]);

  return (
    <S.Section>
      <S.SectionHeader>
        <S.SectionTitle>{t("settings:usersPage.join_title", "Приєднатися до сім'ї")}</S.SectionTitle>
        <S.SectionDescription>
          {t("settings:usersPage.join_description", "Введіть 6-значний код, щоб приєднатися до існуючої сім'ї.")}
        </S.SectionDescription>
      </S.SectionHeader>

      <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <S.OtpContainer>
            {otp.map((digit, index) => (
              <S.OtpBox
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={index === 0 ? handlePaste : undefined}
                autoFocus={index === 0}
              />
            ))}
          </S.OtpContainer>
          
          <Button
            type="submit"
            isLoading={isJoining}
            icon={<HiOutlineUserPlus />}
            disabled={otp.join("").trim().length !== 6 || isJoining}
            size="large"
            style={{ width: "100%" }}
          >
            {t("settings:usersPage.btn_join", "Приєднатися до сім'ї")}
          </Button>
        </div>
      </form>
    </S.Section>
  );
};
