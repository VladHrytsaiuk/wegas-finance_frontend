import styled from "styled-components";
import type { BankSkin } from "../bankSkins";

// === STYLED COMPONENTS ===

const LogoContainer = styled.div<{ $color?: string }>`
  color: ${(props) => props.$color || "inherit"};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const BankLabelText = styled.span<{ $color: string }>`
  font-weight: 600;
  font-size: 0.9rem;
  opacity: 0.9;
  letter-spacing: 0.5px;
  white-space: nowrap;
  color: ${(props) => props.$color};
`;

// 1. Компонент для МАСКИ (монохромний логотип)
const BankIconMask = styled.div<{
  $url: string;
  $color: string;
  $width?: string;
}>`
  height: 24px;
  width: ${(props) => props.$width || "24px"};
  min-width: ${(props) => props.$width || "24px"};
  background-color: ${(props) => props.$color};

  mask-image: url(${(props) => props.$url});
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center left;

  -webkit-mask-image: url(${(props) => props.$url});
  -webkit-mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center left;
`;

// 2. 🔥 Компонент для ОРИГІНАЛЬНОГО ЛОГО (кольоровий)
const BankIconImg = styled.img<{ $width?: string }>`
  height: 24px;
  width: ${(props) => props.$width || "24px"};
  min-width: ${(props) => props.$width || "24px"};
  object-fit: contain;
  object-position: left; /* Вирівнювання зліва, як у маски */
  display: block;
`;

const PaymentMask = styled.div<{ $url: string; $color: string }>`
  height: 24px;
  width: 40px;
  background-color: ${(props) => props.$color};

  mask-image: url(${(props) => props.$url});
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center right;

  -webkit-mask-image: url(${(props) => props.$url});
  -webkit-mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center right;

  opacity: 0.9;
`;

const PaymentImg = styled.img`
  height: 24px;
  width: auto;
  display: block;
  filter: drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.3));
`;

// === LOGIC COMPONENTS ===

// 1. BANK LOGO// src/components/Accounts/form/CardStyles.tsx

export const BankLogo = ({ skin }: { skin: BankSkin }) => {
  if (!skin) return null;

  // 🔥 Спробуй взяти logoFile, якщо нема - бери bank
  const fileName = skin.logoFile || skin.bank;
  const logoSrc = `/banks/${fileName}.svg`;

  const logoWidth = skin.logoWidth || "24px";

  // Перевіряємо bankId або шукаємо в імені файлу
  const bankId = skin.bankId || fileName;

  const showLabel =
    bankId === "privat" ||
    (typeof bankId === "string" && bankId.includes("privat"));

  const useOriginalColor = ["pumb", "oschad"].some(
    (b) => bankId && bankId.includes(b),
  );

  return (
    <LogoContainer>
      {useOriginalColor ? (
        <BankIconImg src={logoSrc} alt="bank" $width={logoWidth} />
      ) : (
        <BankIconMask $url={logoSrc} $color={skin.color} $width={logoWidth} />
      )}

      {showLabel && (
        <BankLabelText $color={skin.color}>{skin.label}</BankLabelText>
      )}
    </LogoContainer>
  );
};

// 2. PAYMENT SYSTEM LOGO
export const PaymentSystemLogo = ({
  system,
  color,
}: {
  system: string;
  color: string;
}) => {
  if (!system) return null;

  const logoSrc = `/banks/${system}.svg`;

  if (system === "visa") {
    return <PaymentMask $url={logoSrc} $color={color} />;
  }

  return <PaymentImg src={logoSrc} alt={system} />;
};
