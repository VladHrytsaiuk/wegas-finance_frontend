// useDropdownPosition.ts
import { useState, useRef, useEffect, useCallback } from "react";

export function useDropdownPosition(
  isOpen: boolean,
  onClose: () => void,
  preferredAlign: "left" | "right" = "left",
  width: number = 300,
) {
  const triggerRef = useRef<HTMLElement>(null); // змінив на HTMLElement для універсальності
  const menuRef = useRef<HTMLDivElement>(null);
  const hookId = useRef("dropdown-" + Math.random().toString(36).substr(2, 9));

  const [style, setStyle] = useState<{
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
    maxHeight: number;
    transformOrigin: string;
    position: "fixed";
    width: number;
    zIndex: number;
  }>({
    maxHeight: 300,
    transformOrigin: "top left",
    position: "fixed",
    width,
    zIndex: 9999,
  });

  // --- 1. РОЗРАХУНОК ПОЗИЦІЇ (без змін, працює добре) ---
  const calculate = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const SAFE_MARGIN = 16;

    let left: number | undefined;
    let right: number | undefined;

    const spaceRight = windowWidth - rect.left;
    if (preferredAlign === "left") {
      if (spaceRight < width) right = windowWidth - rect.right;
      else left = rect.left;
    } else {
      if (rect.right < width) left = rect.left;
      else right = windowWidth - rect.right;
    }

    const spaceBelow = windowHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUpwards = spaceBelow < 300 && spaceAbove > spaceBelow;

    let top: number | undefined;
    let bottom: number | undefined;
    let transformOrigin: string;
    let maxHeight: number;

    if (openUpwards) {
      bottom = windowHeight - rect.top + 6;
      maxHeight = spaceAbove - SAFE_MARGIN;
      transformOrigin = "bottom " + (left !== undefined ? "left" : "right");
    } else {
      top = rect.bottom + 6;
      maxHeight = spaceBelow - SAFE_MARGIN;
      transformOrigin = "top " + (left !== undefined ? "left" : "right");
    }

    setStyle({
      top,
      bottom,
      left,
      right,
      maxHeight: Math.max(maxHeight, 100),
      transformOrigin,
      position: "fixed",
      width,
      zIndex: 9999,
    });
  }, [preferredAlign, width]);

  useEffect(() => {
    if (isOpen) {
      calculate();
      // Додаємо requestAnimationFrame для гарантії, що DOM відрендерився
      requestAnimationFrame(calculate);

      window.addEventListener("resize", calculate);
      window.dispatchEvent(
        new CustomEvent("dropdown-opened", { detail: hookId.current }),
      );
    }
    return () => window.removeEventListener("resize", calculate);
  }, [isOpen, calculate]);

  // --- 2. ЛОГІКА ЗАКРИТТЯ ---
  useEffect(() => {
    if (!isOpen) return;

    // Обробка кліку ПОЗА межами (аналог useOutsideClick)
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;

      // 1. Якщо клікнули на саме меню (або його дітей) -> ігноруємо
      if (menuRef.current && menuRef.current.contains(target)) {
        return;
      }

      // 2. Якщо клікнули на кнопку, що відкрила меню -> ігноруємо
      // (щоб не було конфлікту з onClick кнопки, який тоглить меню)
      if (triggerRef.current && triggerRef.current.contains(target)) {
        return;
      }

      // 3. Інакше -> закриваємо
      onClose();
    };

    // Обробка скролу
    const handleScroll = (e: Event) => {
      const target = e.target as Node;

      // Якщо скролиться саме меню або його частина -> ігноруємо
      // ТУТ КРИТИЧНО ВАЖЛИВО, ЩОБ menuRef БУВ ПРИВ'ЯЗАНИЙ
      if (menuRef.current && menuRef.current.contains(target)) {
        return;
      }

      // Якщо скролиться сторінка (window) або інший блок -> закриваємо
      onClose();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    // Використовуємо mousedown, бо він швидший і надійніший для UX ніж click
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);

    // Скрол з capture: true, щоб ловити події до того, як вони зупиняться
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen, onClose]);

  // --- 3. ЗАКРИТТЯ ІНШИХ МЕНЮ ---
  useEffect(() => {
    const handleOtherOpened = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail !== hookId.current && isOpen) {
        onClose();
      }
    };
    window.addEventListener("dropdown-opened", handleOtherOpened);
    return () =>
      window.removeEventListener("dropdown-opened", handleOtherOpened);
  }, [isOpen, onClose]);

  return { triggerRef, menuRef, style };
}
