import { useState } from "react";
import { useUsers } from "../Settings/useUsers";
import { useDropdownPosition } from "../useDropdownPosition";

interface UseNoteOptionsProps {
  hiddenFrom: string;
  onChangeVisibility: (
    visibility: "public" | "private" | "hidden",
    hiddenFrom: string,
  ) => void;
}

export const useNoteOptions = ({
  hiddenFrom,
  onChangeVisibility,
}: UseNoteOptionsProps) => {
  const { users } = useUsers();

  const [isColorOpen, setIsColorOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isHiddenListOpen, setIsHiddenListOpen] = useState(false);

  // --- Позиціонування кольорів ---
  const colorDropdown = useDropdownPosition(
    isColorOpen,
    () => setIsColorOpen(false),
    "left",
    180, // Ширина для сітки кольорів
  );

  // --- Позиціонування приватності ---
  const privacyDropdown = useDropdownPosition(
    isPrivacyOpen,
    () => {
      setIsPrivacyOpen(false);
      setIsHiddenListOpen(false);
    },
    "right", // Відкриваємо вліво від кнопки
    240,
  );

  let currentUserId = localStorage.getItem("user_id");
  if (!currentUserId) {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        currentUserId = userObj.id || userObj._id;
      } catch (e) {
        console.error(e);
      }
    }
  }

  const otherUsers = (users || []).filter(
    (u: any) => String(u.id) !== String(currentUserId),
  );

  const handleToggleHiddenUser = (userId: string) => {
    let hiddenArray = hiddenFrom ? hiddenFrom.split(",").filter(Boolean) : [];
    if (hiddenArray.includes(userId)) {
      hiddenArray = hiddenArray.filter((id) => id !== userId);
    } else {
      hiddenArray.push(userId);
    }
    const newHiddenString = hiddenArray.join(",");
    if (hiddenArray.length === 0) onChangeVisibility("public", "");
    else onChangeVisibility("hidden", newHiddenString);
  };

  const handleSetPublic = () => {
    onChangeVisibility("public", "");
    setIsPrivacyOpen(false);
  };

  const handleSetPrivate = () => {
    onChangeVisibility("private", "");
    setIsPrivacyOpen(false);
  };

  return {
    state: {
      isColorOpen,
      setIsColorOpen,
      isPrivacyOpen,
      setIsPrivacyOpen,
      isHiddenListOpen,
      setIsHiddenListOpen,
      otherUsers,
    },
    refs: {
      colorTrigger: colorDropdown.triggerRef,
      colorMenu: colorDropdown.menuRef,
      colorStyle: colorDropdown.style,
      privacyTrigger: privacyDropdown.triggerRef,
      privacyMenu: privacyDropdown.menuRef,
      privacyStyle: privacyDropdown.style,
    },
    actions: {
      handleToggleHiddenUser,
      handleSetPublic,
      handleSetPrivate,
    },
  };
};
