import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { HiCheck, HiChevronDown } from "react-icons/hi2";
import * as Icons from "react-icons/hi2";

import { useColorIconPicker } from "../../hooks/ui/useColorIconPicker";
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
  const { state, t } = useColorIconPicker({ icon: "" });
  const { presetColors } = state;
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [portalCoords, setPortalCoords] = useState({ top: 0, left: 0 });

  const updatePortalPosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPortalCoords({
      top: rect.bottom + window.scrollY + 6,
      left: rect.left + window.scrollX,
    });
  };

  useEffect(() => {
    if (isOpen) {
      updatePortalPosition();
      window.addEventListener("scroll", updatePortalPosition, true);
      window.addEventListener("resize", updatePortalPosition);
      return () => {
        window.removeEventListener("scroll", updatePortalPosition, true);
        window.removeEventListener("resize", updatePortalPosition);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <S.Container style={{ width: square ? "auto" : "100%" }}>
      <S.PickerTrigger
        ref={triggerRef}
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
            $top={portalCoords.top}
            $left={portalCoords.left}
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
  const { state, t } = useColorIconPicker({ icon });
  const { presetIcons, SelectedIconComponent } = state;
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [portalCoords, setPortalCoords] = useState({ top: 0, left: 0 });

  const updatePortalPosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPortalCoords({
      top: rect.bottom + window.scrollY + 6,
      left: rect.left + window.scrollX,
    });
  };

  useEffect(() => {
    if (isOpen) {
      updatePortalPosition();
      window.addEventListener("scroll", updatePortalPosition, true);
      window.addEventListener("resize", updatePortalPosition);
      return () => {
        window.removeEventListener("scroll", updatePortalPosition, true);
        window.removeEventListener("resize", updatePortalPosition);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <S.Container style={{ width: square ? "auto" : "100%" }}>
      <S.PickerTrigger
        ref={triggerRef}
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
            $top={portalCoords.top}
            $left={portalCoords.left}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <S.Section>
              <S.IconGrid>
                {presetIcons.map((iconName) => {
                  const CurrentIcon = (Icons as any)[iconName];
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
