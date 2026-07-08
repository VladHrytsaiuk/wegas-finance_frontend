import { useState } from "react";
import { createPortal } from "react-dom";
import { HiCheck, HiChevronDown } from "react-icons/hi2";
import * as Icons from "react-icons/hi2";
import type { IconType } from "react-icons";

import { useColorIconPicker } from "../../hooks/ui/useColorIconPicker";
import { useDropdownPosition } from "../../hooks/useDropdownPosition";
import * as S from "./ColorIconPicker.styles";

interface ColorIconPickerProps {
  color: string;
  icon: string;
  onColorChange: (color: string) => void;
  onIconChange: (icon: string) => void;
  square?: boolean;
}

/**
 * Combined picker that renders two separate columns (Color & Icon)
 */
export function ColorIconPicker(props: ColorIconPickerProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: "0.75rem",
        width: props.square ? "auto" : "100%",
      }}
    >
      <div style={{ flex: props.square ? "0 0 auto" : 1 }}>
        <ColorPicker
          color={props.color}
          onColorChange={props.onColorChange}
          square={props.square}
        />
      </div>
      <div style={{ flex: props.square ? "0 0 auto" : 1 }}>
        <IconPicker
          icon={props.icon}
          onIconChange={props.onIconChange}
          color={props.color}
          square={props.square}
        />
      </div>
    </div>
  );
}

export function ColorPicker({
  color,
  onColorChange,
  square,
}: {
  color: string;
  onColorChange: (c: string) => void;
  square?: boolean;
}) {
  const { state } = useColorIconPicker({ icon: "" });
  const { presetColors } = state;
  const [isOpen, setIsOpen] = useState(false);

  const { triggerRef, menuRef, style } = useDropdownPosition(
    isOpen,
    () => setIsOpen(false),
    "left",
    180,
  );

  const setTriggerRef = (node: HTMLButtonElement | null) => {
    triggerRef.current = node;
  };

  return (
    <S.Container $square={square}>
      <S.PickerTrigger
        ref={setTriggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        $square={square}
      >
        <S.ColorSwatch $color={color} />
        {!square && (
          <HiChevronDown
            size={14}
            style={{
              marginLeft: "auto",
              color: "var(--color-text-tertiary)",
              transform: isOpen ? "rotate(180deg)" : "none",
              transition: "transform 0.2s",
            }}
          />
        )}
      </S.PickerTrigger>

      {isOpen &&
        createPortal(
          <S.DropdownPortalContainer
            ref={menuRef}
            style={{
              position: "fixed",
              top: style.top !== undefined ? `${style.top}px` : "auto",
              bottom: style.bottom !== undefined ? `${style.bottom}px` : "auto",
              left: style.left !== undefined ? `${style.left}px` : "auto",
              right: style.right !== undefined ? `${style.right}px` : "auto",
              maxHeight: `${style.maxHeight}px`,
              transformOrigin: style.transformOrigin,
              zIndex: 20000,
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <S.Section>
              <S.ColorGrid>
                {presetColors.map((c) => (
                  <S.ColorOption
                    key={c}
                    type="button"
                    $color={c}
                    $isActive={color === c}
                    onClick={(e) => {
                      e.preventDefault();
                      onColorChange(c);
                      setIsOpen(false);
                    }}
                  >
                    {color === c && <HiCheck />}
                  </S.ColorOption>
                ))}
              </S.ColorGrid>
            </S.Section>
          </S.DropdownPortalContainer>,
          document.body,
        )}
    </S.Container>
  );
}

export function IconPicker({
  icon,
  onIconChange,
  color,
  square,
}: {
  icon: string;
  onIconChange: (i: string) => void;
  color: string;
  square?: boolean;
}) {
  const { state } = useColorIconPicker({ icon });
  const { presetIcons, SelectedIconComponent } = state;
  const [isOpen, setIsOpen] = useState(false);

  const { triggerRef, menuRef, style } = useDropdownPosition(
    isOpen,
    () => setIsOpen(false),
    "left",
    180,
  );

  const setTriggerRef = (node: HTMLButtonElement | null) => {
    triggerRef.current = node;
  };

  const iconMap = Icons as Record<string, IconType>;

  return (
    <S.Container $square={square}>
      <S.PickerTrigger
        ref={setTriggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        $square={square}
      >
        <S.IconPreview $color={color}>
          <SelectedIconComponent />
        </S.IconPreview>
        {!square && (
          <HiChevronDown
            size={14}
            style={{
              marginLeft: "auto",
              color: "var(--color-text-tertiary)",
              transform: isOpen ? "rotate(180deg)" : "none",
              transition: "transform 0.2s",
            }}
          />
        )}
      </S.PickerTrigger>

      {isOpen &&
        createPortal(
          <S.DropdownPortalContainer
            ref={menuRef}
            style={{
              position: "fixed",
              top: style.top !== undefined ? `${style.top}px` : "auto",
              bottom: style.bottom !== undefined ? `${style.bottom}px` : "auto",
              left: style.left !== undefined ? `${style.left}px` : "auto",
              right: style.right !== undefined ? `${style.right}px` : "auto",
              maxHeight: `${style.maxHeight}px`,
              transformOrigin: style.transformOrigin,
              zIndex: 20000,
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <S.Section>
              <S.IconGrid>
                {presetIcons.map((iconName) => {
                  const CurrentIcon = iconMap[iconName];
                  if (!CurrentIcon) return null;

                  return (
                    <S.IconOption
                      key={iconName}
                      type="button"
                      $active={icon === iconName}
                      $color={color}
                      onClick={(e) => {
                        e.preventDefault();
                        onIconChange(iconName);
                        setIsOpen(false);
                      }}
                    >
                      <CurrentIcon />
                    </S.IconOption>
                  );
                })}
              </S.IconGrid>
            </S.Section>
          </S.DropdownPortalContainer>,
          document.body,
        )}
    </S.Container>
  );
}
