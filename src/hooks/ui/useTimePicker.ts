import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDropdownPosition } from "../useDropdownPosition";

interface UseTimePickerProps {
  value: string;
  onChange: (time: string) => void;
}

export const useTimePicker = ({ value, onChange }: UseTimePickerProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [draftTime, setDraftTime] = useState<{ hh: string; mm: string } | null>(
    null,
  );

  const hourRef = useRef<HTMLInputElement>(null);
  const minRef = useRef<HTMLInputElement>(null);
  const [hh, mm] =
    draftTime !== null
      ? [draftTime.hh, draftTime.mm]
      : value && value.includes(":")
        ? value.split(":")
        : ["", ""];

  const { triggerRef, menuRef, style } = useDropdownPosition(
    isOpen,
    () => setIsOpen(false),
    "right",
    200
  );

  const updateParent = (newH: string, newM: string) => {
    if (newH.length === 2 && newM.length === 2) {
      onChange(`${newH}:${newM}`);
    }
  };

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length === 1 && parseInt(val) > 2) val = "0" + val;
    if (val.length === 2 && parseInt(val) > 23) val = "23";
    val = val.slice(0, 2);

    setDraftTime({ hh: val, mm });

    if (val.length === 2) {
      minRef.current?.focus();
      minRef.current?.select();
      updateParent(val, mm);
    }
  };

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length === 2 && parseInt(val) > 59) val = "59";
    val = val.slice(0, 2);

    setDraftTime({ hh, mm: val });

    if (val.length === 2) {
      updateParent(hh, val);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, field: "hh" | "mm") => {
    if (e.key === "Backspace") {
      if (field === "mm" && mm === "") {
        e.preventDefault();
        hourRef.current?.focus();
      }
    }
    if (e.key === "ArrowRight" && field === "hh") {
      e.preventDefault();
      minRef.current?.focus();
    }
    if (e.key === "ArrowLeft" && field === "mm") {
      e.preventDefault();
      hourRef.current?.focus();
    }
  };

  const handleSelect = (h: number, m: number) => {
    const hStr = h.toString().padStart(2, "0");
    const mStr = m.toString().padStart(2, "0");
    setDraftTime({ hh: hStr, mm: mStr });
    onChange(`${hStr}:${mStr}`);
  };

  const handleWrapperClick = () => {
    if (
      document.activeElement !== hourRef.current &&
      document.activeElement !== minRef.current
    ) {
      hourRef.current?.focus();
      hourRef.current?.select();
    }
  };

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  // Lists for dropdown
  const hoursList = Array.from({ length: 24 }, (_, i) => i);
  const minutesList = Array.from({ length: 12 }, (_, i) => i * 5);

  return {
    state: {
      isOpen,
      hh,
      mm,
      hoursList,
      minutesList,
      positionStyle: style,
    },
    refs: {
      hourRef,
      minRef,
      triggerRef,
      menuRef,
    },
    actions: {
      setIsOpen,
      handleHourChange,
      handleMinChange,
      handleKeyDown,
      handleSelect,
      handleWrapperClick,
      toggleOpen,
    },
    t,
  };
};
