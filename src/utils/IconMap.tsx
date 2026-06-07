import React, { useState, useEffect } from "react";
import {
  // --- UI & General ---
  HiQuestionMarkCircle,
  HiEllipsisHorizontalCircle,
  HiCheckCircle,
  HiXCircle,
  HiFlag,

  // --- Home & Living ---
  HiHome,
  HiHomeModern,
  HiSparkles,
  HiArchiveBox,
  HiKey,
  HiBolt,
  HiFire,
  HiCloud,
  HiBuildingOffice,
  HiSwatch,

  // --- Services ---
  HiClipboardDocumentList,
  HiInbox,
  HiScale,

  // --- Communication ---
  HiWifi,
  HiDevicePhoneMobile,
  HiGlobeAlt,

  // --- Food ---
  HiShoppingCart,
  HiShoppingBag,
  HiBuildingStorefront,
  HiCake,
  HiBeaker,
  HiNoSymbol,

  // --- Transport ---
  HiTruck,
  HiMapPin,
  HiMap,
  HiTicket,
  HiFunnel,
  HiWrenchScrewdriver,
  HiWrench,
  HiShieldCheck,
  HiExclamationCircle,

  // --- Travel ---
  HiGlobeAmericas,
  HiPaperAirplane,
  HiBriefcase,

  // --- Shopping ---
  HiTag,
  HiDeviceTablet,
  HiComputerDesktop,
  HiFaceSmile,
  HiGift,

  // --- Health ---
  HiHeart,
  HiPlusCircle,
  HiUser,
  HiUserGroup,

  // --- Education ---
  HiAcademicCap,
  HiBookOpen,
  HiPresentationChartLine,
  HiChatBubbleLeftRight,
  HiCodeBracket,

  // --- Entertainment ---
  HiFilm,
  HiTrophy,
  HiPlay,
  HiMusicalNote,
  HiPuzzlePiece,

  // --- Finance & Obligations ---
  HiBanknotes,
  HiHandRaised,
  HiUsers,
  HiDocumentText,
  HiReceiptPercent,
  HiExclamationTriangle,
  HiChartBar,
  HiSun,
  HiCube,
  HiStar,
  HiCurrencyDollar,
  HiTrash,
  HiArrowTrendingDown,
  HiArrowTrendingUp,
  HiArrowsRightLeft,
  HiCreditCard,
  HiCircleStack,
} from "react-icons/hi2";

// === 1. МАПА ІКОНОК ===
export const ICON_MAP: Record<string, React.ElementType> = {
  HiEllipsisHorizontalCircle,
  HiQuestionMarkCircle,
  HiCheckCircle,
  HiXCircle,
  HiHome,
  HiHomeModern,
  HiShoppingCart,
  HiBuildingStorefront,
  HiClipboardDocumentList,
  HiGlobeAmericas,
  HiScale,
  HiBanknotes,
  HiBriefcase,
  HiAcademicCap,
  HiHeart,
  HiTicket,
  HiShoppingBag,
  HiWifi,
  HiKey,
  HiMapPin,
  HiInbox,
  HiTag,
  HiSparkles,
  HiArchiveBox,
  HiSwatch,
  HiBolt,
  HiFire,
  HiCloud,
  HiBuildingOffice,
  HiDevicePhoneMobile,
  HiGlobeAlt,
  HiPlay,
  HiCake,
  HiBeaker,
  HiNoSymbol,
  HiTruck,
  HiMap,
  HiFunnel,
  HiWrenchScrewdriver,
  HiWrench,
  HiShieldCheck,
  HiExclamationCircle,
  HiPaperAirplane,
  HiDeviceTablet,
  HiComputerDesktop,
  HiFaceSmile,
  HiGift,
  HiPlusCircle,
  HiUser,
  HiUserGroup,
  HiBookOpen,
  HiPresentationChartLine,
  HiChatBubbleLeftRight,
  HiCodeBracket,
  HiFilm,
  HiTrophy,
  HiMusicalNote,
  HiPuzzlePiece,
  HiHandRaised,
  HiUsers,
  HiDocumentText,
  HiReceiptPercent,
  HiExclamationTriangle,
  HiChartBar,
  HiSun,
  HiCube,
  HiStar,
  HiCurrencyDollar,
  HiTrash,
  HiArrowTrendingDown,
  HiArrowTrendingUp,
  HiArrowsRightLeft,
  HiCreditCard,
  HiCircleStack,
  HiFlag,
};

// === 2. ХЕЛПЕР ДЛЯ ЛОГОТИПІВ (Внутрішній) ===
const getLogoSrc = (logoIdentifier: string | undefined | null) => {
  if (!logoIdentifier) return undefined;
  if (logoIdentifier.startsWith("data:")) return logoIdentifier;
  if (logoIdentifier.startsWith("http")) return logoIdentifier;

  // 🔥 ГНУЧКИЙ ШЛЯХ:
  // Якщо назва починається на 'icon_', шукаємо в банках, інакше в брендах
  const folder = logoIdentifier.startsWith("icon_") ? "banks" : "brands";

  // Якщо розширення вже є — повертаємо як є, інакше додаємо .svg
  const hasExtension = /\.(svg|png|jpg|jpeg|webp)$/i.test(logoIdentifier);
  const fileName = hasExtension ? logoIdentifier : `${logoIdentifier}.svg`;

  return `/${folder}/${fileName}`;
};


// === 3. КОМПОНЕНТ CATEGORY ICON (Базовий) ===
interface IconProps extends React.ComponentProps<"svg"> {
  name?: string;
  size?: number | string;
}

export const CategoryIcon: React.FC<IconProps> = ({
  name,
  size = 20,
  ...props
}) => {
  if (!name) {
    return <HiQuestionMarkCircle size={size} {...props} />;
  }

  let IconComponent = ICON_MAP[name];

  if (!IconComponent && !name.startsWith("Hi")) {
    const pascalName = "Hi" + name.charAt(0).toUpperCase() + name.slice(1);
    IconComponent = ICON_MAP[pascalName];
  }

  if (!IconComponent) {
    IconComponent = HiQuestionMarkCircle;
  }

  return <IconComponent size={size} {...props} />;
};

// === 4. КОМПОНЕНТ SMART ICON (Розумний: Лого + Іконка) ===
interface SmartIconProps extends React.ComponentProps<"svg"> {
  iconName?: string;
  logo?: string | null;
  size?: number | string;
  color?: string;
  className?: string;
}

export const SmartIcon: React.FC<SmartIconProps> = ({
  iconName,
  logo,
  size = 20,
  color,
  className,
  ...props
}) => {
  const [imageError, setImageError] = useState(false);

  // Скидаємо помилку при зміні лого
  useEffect(() => {
    setImageError(false);
  }, [logo]);

  // Спроба 1: Логотип
  const logoSrc = getLogoSrc(logo);

  if (logoSrc && !imageError) {
    return (
      <img
        src={logoSrc}
        alt={iconName || "logo"}
        className={className}
        onError={() => setImageError(true)}
        style={{
          width: typeof size === "number" ? `${size}px` : size,
          height: typeof size === "number" ? `${size}px` : size,
          objectFit: "contain",
          borderRadius: "6px",
          display: "block",
        }}
      />
    );
  }

  // Спроба 2: Іконка
  return (
    <CategoryIcon
      name={iconName}
      size={size}
      color={color}
      className={className}
      {...props}
    />
  );
};
