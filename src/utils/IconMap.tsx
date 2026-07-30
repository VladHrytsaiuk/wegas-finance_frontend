import React, { useState } from "react";
import { HiQuestionMarkCircle } from "react-icons/hi2";
import { ICON_MAP } from "./IconConstants";

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
  fillContainer?: boolean;
}

export const SmartIcon: React.FC<SmartIconProps> = ({
  iconName,
  logo,
  size = 20,
  color,
  className,
  fillContainer = false,
  ...props
}) => {
  const [failedLogo, setFailedLogo] = useState<string | null>(null);

  // Спроба 1: Логотип
  const logoSrc = getLogoSrc(logo);

  if (logoSrc && failedLogo !== logoSrc) {
    return (
      <img
        src={logoSrc}
        alt={iconName || "logo"}
        className={className}
        onError={() => setFailedLogo(logoSrc)}
        style={{
          width: fillContainer ? "100%" : typeof size === "number" ? `${size}px` : size,
          height: fillContainer ? "100%" : typeof size === "number" ? `${size}px` : size,
          objectFit: fillContainer ? "cover" : "contain",
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
