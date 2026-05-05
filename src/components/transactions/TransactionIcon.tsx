import { useState, useEffect } from "react";
import {
  HiArrowLongRight,
  HiArrowLongLeft,
  HiArrowsRightLeft,
  HiBanknotes,
  HiArrowUpRight,
  HiArrowDownLeft,
} from "react-icons/hi2";
import { SmartIcon } from "../../utils/IconMap";
import { IconBox } from "./TransactionItem.styles";

interface TransactionIconProps {
  logoUrl?: string | null;
  iconName: string;
  color: string;
  isTransfer: boolean;
  size?: number;
}

export const TransactionIcon = ({
  logoUrl,
  iconName,
  color,
  isTransfer,
  size = 40,
}: TransactionIconProps) => {
  const [imgError, setImgError] = useState(false);

  // 1. Скидаємо помилку, якщо змінився URL (важливо при скролі/фільтрації)
  useEffect(() => {
    setImgError(false);
  }, [logoUrl]);

  // 2. Хелпер для шляху
  const getLogoUrl = (filename: string) => {
    if (!filename) return "";
    if (filename.startsWith("http")) return filename;
    return `/brands/${filename}`;
  };

  // Визначаємо, чи показувати логотип (умова: є URL, немає помилки, не переказ, не борг)
  const shouldShowLogo =
    !!logoUrl && !imgError && !isTransfer && !iconName.startsWith("Debt");

  // Helper to render content based on type
  const renderContent = () => {
    // A. Спеціальні іконки
    if (iconName === "Handshake") {
      return <span style={{ fontSize: `${size * 0.5}px` }}>🤝</span>;
    }
    if (iconName === "HiArrowsRightLeft") {
      return <HiArrowsRightLeft size={size * 0.5} />;
    }
    if (iconName === "HiArrowLeft") {
      return <HiArrowLongLeft size={size * 0.5} />;
    }
    if (iconName === "HiArrowRight" || isTransfer) {
      return <HiArrowLongRight size={size * 0.5} />;
    }
    if (iconName === "HiBanknotes") {
      return <HiBanknotes size={size * 0.5} />;
    }

    // B. Іконки для боргів
    if (iconName === "DebtOut") {
      return <HiArrowUpRight size={size * 0.5} />;
    }
    if (iconName === "DebtIn") {
      return <HiArrowDownLeft size={size * 0.5} />;
    }

    // C. Логотип
    if (shouldShowLogo) {
      return (
        <img
          src={getLogoUrl(logoUrl!)}
          alt="brand logo"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      );
    }

    // D. Default SmartIcon
    return <SmartIcon name={iconName} size={size * 0.5} />;
  };

  return (
    <IconBox $color={color} $hasLogo={shouldShowLogo} $size={size}>
      {renderContent()}
    </IconBox>
  );
};
