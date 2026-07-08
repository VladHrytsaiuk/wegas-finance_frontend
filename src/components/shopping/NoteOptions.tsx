import { createPortal } from "react-dom";
import {
  HiOutlineSwatch,
  HiUsers,
  HiLockClosed,
  HiCheck,
  HiEyeSlash,
  HiChevronDown,
  HiChevronUp,
} from "react-icons/hi2";
import { NOTE_COLORS } from "../../utils/constants";
import { useTranslation } from "react-i18next";
import type { UserProfile } from "../../services/apiUsers";
import type { useDropdownPosition } from "../../hooks/useDropdownPosition";

import * as S from "./NoteOptions.styles";
import { useNoteOptions } from "../../hooks/Shopping/useNoteOptions";

// --- HELPER COMPONENT (Portal) ---
const PortalDropdown = ({
  isOpen,
  positionStyle,
  children,
  menuRef,
}: {
  isOpen: boolean;
  positionStyle: ReturnType<typeof useDropdownPosition>["style"];
  children: React.ReactNode;
  menuRef: React.RefObject<HTMLDivElement>;
}) => {
  if (!isOpen) return null;
  return createPortal(
    <div
      ref={menuRef}
      style={{
        ...positionStyle,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {children}
    </div>,
    document.body,
  );
};

// --- MAIN COMPONENT ---
interface NoteOptionsProps {
  color: string;
  visibility: string;
  hiddenFrom?: string;
  onChangeColor: (color: string) => void;
  onChangeVisibility: (
    visibility: "public" | "private" | "hidden",
    hiddenFrom: string,
  ) => void;
}

export function NoteOptions({
  color,
  visibility,
  hiddenFrom = "",
  onChangeColor,
  onChangeVisibility,
}: NoteOptionsProps) {
  const { t } = useTranslation();

  const {
    state,
    colorTriggerRef,
    colorMenuRef,
    colorStyle,
    privacyTriggerRef,
    privacyMenuRef,
    privacyStyle,
    actions,
  } = useNoteOptions({
    hiddenFrom,
    onChangeVisibility,
  });
  const { otherUsers } = state;

  return (
    <S.Container>
      {/* --- COLOR PICKER --- */}
      <S.IconButton
        ref={colorTriggerRef as React.RefObject<HTMLButtonElement>}
        type="button"
        onClick={() => state.setIsColorOpen((v) => !v)}
        $isActive={state.isColorOpen}
        title={t("shopping_wishlist:shopping.change_color")}
      >
        <HiOutlineSwatch size={18} />
      </S.IconButton>

      <PortalDropdown
        isOpen={state.isColorOpen}
        positionStyle={colorStyle}
        menuRef={colorMenuRef}
      >
        <S.DropdownMenu>
          <S.ColorGrid>
            {NOTE_COLORS.map((c) => (
              <S.ColorCircle
                key={c.name}
                $color={c.value}
                $selected={color === c.value}
                onClick={() => {
                  onChangeColor(c.value);
                  state.setIsColorOpen(false);
                }}
              >
                {color === c.value && <HiCheck />}
              </S.ColorCircle>
            ))}
          </S.ColorGrid>
        </S.DropdownMenu>
      </PortalDropdown>

      {/* --- PRIVACY PICKER --- */}
      <S.IconButton
        ref={privacyTriggerRef as React.RefObject<HTMLButtonElement>}
        type="button"
        onClick={() => state.setIsPrivacyOpen((v) => !v)}
        $isActive={state.isPrivacyOpen}
        title={visibility}
      >
        {visibility === "private" ? (
          <HiLockClosed size={18} />
        ) : visibility === "hidden" ? (
          <HiEyeSlash size={18} />
        ) : (
          <HiUsers size={18} />
        )}
      </S.IconButton>

      <PortalDropdown
        isOpen={state.isPrivacyOpen}
        positionStyle={privacyStyle}
        menuRef={privacyMenuRef}
      >
        <S.DropdownMenu>
          <S.MenuItem
            $selected={visibility === "public"}
            onClick={actions.handleSetPublic}
          >
            <HiUsers /> {t("shopping_wishlist:shopping.public", "Сім'я (всі)")}
          </S.MenuItem>

          <S.MenuItem
            $selected={visibility === "private"}
            onClick={actions.handleSetPrivate}
          >
            <HiLockClosed /> {t("shopping_wishlist:shopping.private", "Тільки я")}
          </S.MenuItem>

          {otherUsers.length > 0 && (
            <>
              <S.Divider />

              <S.MenuItem
                $isHeader
                onClick={(e) => {
                  e.stopPropagation();
                  state.setIsHiddenListOpen(!state.isHiddenListOpen);
                }}
                style={{ justifyContent: "space-between" }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <HiEyeSlash />
                  <span>{t("shopping_wishlist:shopping.hide_from", "Приховати від:")}</span>
                </div>
                {state.isHiddenListOpen ? (
                  <HiChevronUp size={16} />
                ) : (
                  <HiChevronDown size={16} />
                )}
              </S.MenuItem>

              {state.isHiddenListOpen && (
                <S.UserScrollList>
                  {otherUsers.map((user: UserProfile) => {
                    const isHidden = hiddenFrom
                      .split(",")
                      .includes(String(user.id));
                    return (
                      <S.MenuItem
                        key={user.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          actions.handleToggleHiddenUser(String(user.id));
                        }}
                      >
                        <S.CheckIconWrapper $isHidden={isHidden}>
                          {isHidden && <HiCheck size={14} />}
                        </S.CheckIconWrapper>
                        <span
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {user.name}
                        </span>
                      </S.MenuItem>
                    );
                  })}
                </S.UserScrollList>
              )}
            </>
          )}
        </S.DropdownMenu>
      </PortalDropdown>
    </S.Container>
  );
}
