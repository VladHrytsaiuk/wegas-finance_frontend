import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { HiChevronDown, HiCheck } from "react-icons/hi2";
import * as Icons from "react-icons/hi2";

import { useColorIconPicker } from "../../hooks/ui/useColorIconPicker";
import * as S from "./ColorIconPicker.styles";

interface ColorIconPickerProps {
  color: string;
  icon: string;
  onColorChange: (color: string) => void;
  onIconChange: (icon: string) => void;
}

export function ColorIconPicker({
  color,
  icon,
  onColorChange,
  onIconChange,
}: ColorIconPickerProps) {
  const { state, refs, actions, t } = useColorIconPicker({ icon });
  const {
    isColorOpen,
    isIconOpen,
    SelectedIconComponent,
    presetIcons,
    presetColors,
  } = state;

  const [portalCoords, setPortalCoords] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const updatePortalPosition = (el: HTMLElement | null) => {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPortalCoords({
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
  };

  useEffect(() => {
    if (isColorOpen || isIconOpen) {
      const handleUpdate = () => {
        if (isColorOpen) updatePortalPosition(refs.colorRef.current);
        if (isIconOpen) updatePortalPosition(refs.iconRef.current);
      };

      window.addEventListener("scroll", handleUpdate, true);
      window.addEventListener("resize", handleUpdate);
      return () => {
        window.removeEventListener("scroll", handleUpdate, true);
        window.removeEventListener("resize", handleUpdate);
      };
    }
  }, [isColorOpen, isIconOpen, refs]);

  return (
    <S.Container>
      {/* --- COLOR PICKER --- */}
      <div style={{ position: "relative" }} ref={refs.colorRef}>
        <S.ColorTrigger
          type="button"
          $color={color}
          onClick={(e) => {
            updatePortalPosition(e.currentTarget);
            actions.toggleColor();
          }}
        />

        {isColorOpen &&
          createPortal(
            <S.DropdownPortalContainer
              $top={portalCoords.top}
              $left={portalCoords.left}
              // 🔥 ФІКС 1: Зупиняємо спливання події, щоб хук ClickOutside не закривав вікно
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <S.ColorGrid>
                {presetColors.map((c) => (
                  <S.ColorOption
                    key={c}
                    type="button" // 🔥 ФІКС 2: Явно вказуємо тип
                    $color={c}
                    $isActive={color === c}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onColorChange(c);
                      actions.setIsColorOpen(false);
                    }}
                  >
                    {color === c && <HiCheck />}
                  </S.ColorOption>
                ))}
              </S.ColorGrid>
            </S.DropdownPortalContainer>,
            document.body,
          )}
      </div>

      {/* --- ICON PICKER --- */}
      <S.IconSelectWrapper ref={refs.iconRef}>
        <S.IconTrigger
          type="button"
          onClick={(e) => {
            updatePortalPosition(e.currentTarget);
            actions.toggleIcon();
          }}
        >
          <S.SelectedIcon>
            <S.IconPreview $color={color}>
              <SelectedIconComponent />
            </S.IconPreview>
            <span>{icon.replace("Hi", "")}</span>
          </S.SelectedIcon>
          <HiChevronDown
            style={{
              color: "var(--color-text-secondary)",
              transform: isIconOpen ? "rotate(180deg)" : "none",
              transition: "transform 0.2s",
            }}
          />
        </S.IconTrigger>

        {isIconOpen &&
          createPortal(
            <S.DropdownPortalContainer
              $top={portalCoords.top}
              $left={portalCoords.left}
              $width={portalCoords.width}
              // 🔥 ФІКС 3: Зупиняємо спливання
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <S.IconGrid>
                {presetIcons.map((iconName) => {
                  const CurrentIcon = (Icons as any)[iconName];
                  if (!CurrentIcon) return null;

                  return (
                    <S.IconOption
                      key={iconName}
                      type="button"
                      $active={icon === iconName}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onIconChange(iconName);
                        actions.setIsIconOpen(false);
                      }}
                    >
                      <CurrentIcon />
                    </S.IconOption>
                  );
                })}
              </S.IconGrid>
            </S.DropdownPortalContainer>,
            document.body,
          )}
      </S.IconSelectWrapper>
    </S.Container>
  );
}
