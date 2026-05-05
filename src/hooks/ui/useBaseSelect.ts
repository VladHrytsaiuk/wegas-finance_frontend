import { useState, useRef, useEffect, useCallback, RefObject } from "react";
import { focusNextElement } from "../../utils/focusUtils"; // Перевір шлях

interface UseBaseSelectProps {
  disabled?: boolean;
  menuWidth?: string | number;
  isMulti?: boolean;
  onSearchChange?: (value: string) => void;
  onClear?: () => void;
}

interface DropdownCoords {
  top: number;
  left: number;
  width: string | number;
  isAbove: boolean;
}

export const useBaseSelect = ({
  disabled,
  menuWidth,
  isMulti,
  onSearchChange,
  onClear,
}: UseBaseSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<DropdownCoords>({
    top: 0,
    left: 0,
    width: "auto",
    isAbove: false,
  });

  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // --- Calculations ---
  const updateCoords = useCallback(() => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let calculatedWidth = rect.width;
    if (menuWidth) {
      if (typeof menuWidth === "number") calculatedWidth = menuWidth;
      else calculatedWidth = parseInt(menuWidth as string, 10) || rect.width;
    }

    let left = rect.left;
    if (left + calculatedWidth > viewportWidth - 10) {
      left = rect.right - calculatedWidth;
    }
    if (left < 10) left = 10;

    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const showAbove = spaceBelow < 250 && spaceAbove > spaceBelow;

    setCoords({
      top: showAbove ? rect.top - 4 : rect.bottom + 6,
      left: left,
      width: menuWidth || rect.width,
      isAbove: showAbove,
    });
  }, [menuWidth]);

  // --- Actions ---
  const toggle = () => {
    if (disabled) return;
    if (!isOpen) {
      updateCoords();
      setIsOpen(true);
    } else {
      setIsOpen(false);
      triggerRef.current?.focus();
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClear?.();
    triggerRef.current?.focus();
  };

  // --- Event Handlers ---
  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) toggle();
    }
  };

  const handleMenuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
      return;
    }

    const focusableElements = dropdownRef.current?.querySelectorAll(
      "input, button, [href], [tabindex]:not([tabindex='-1'])"
    );

    if (!focusableElements || focusableElements.length === 0) return;
    const elementsArr = Array.from(focusableElements) as HTMLElement[];
    const activeEl = document.activeElement as HTMLElement;
    const currentIndex = elementsArr.indexOf(activeEl);

    if (e.key === "Tab") {
      e.preventDefault();
      setIsOpen(false);

      if (e.shiftKey) {
        triggerRef.current?.focus();
      } else {
        if (triggerRef.current) {
          triggerRef.current.focus();
          setTimeout(() => {
            focusNextElement(triggerRef.current!);
          }, 0);
        }
      }
      return;
    }

    if (e.key === "Enter" && !isMulti && activeEl.tagName !== "INPUT") {
      setTimeout(() => {
        setIsOpen(false);
        if (triggerRef.current) {
          triggerRef.current.focus();
          setTimeout(() => focusNextElement(triggerRef.current!), 0);
        }
      }, 50);
      return;
    }

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      let nextIndex;
      if (e.key === "ArrowDown") {
        nextIndex =
          currentIndex + 1 < elementsArr.length ? currentIndex + 1 : 0;
      } else {
        nextIndex =
          currentIndex - 1 >= 0 ? currentIndex - 1 : elementsArr.length - 1;
      }
      elementsArr[nextIndex]?.focus();
    }
  };

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Якщо клікнули по інпуту - не закриваємо
    if ((e.target as HTMLElement).closest("input")) return;

    if (!isMulti) {
      setIsOpen(false);
      setTimeout(() => {
        if (triggerRef.current) {
          triggerRef.current.focus();
          focusNextElement(triggerRef.current);
        }
      }, 0);
    }
  };

  // --- Effects ---
  useEffect(() => {
    if (!isOpen) return;

    // Focus management on open
    const timer = setTimeout(() => {
      if (onSearchChange && searchInputRef.current) {
        searchInputRef.current.focus();
      } else if (dropdownRef.current) {
        const firstFocusable = dropdownRef.current.querySelector(
          "button, [href], input, [tabindex]:not([tabindex='-1'])"
        ) as HTMLElement;
        if (firstFocusable) firstFocusable.focus();
        else dropdownRef.current.focus();
      }
    }, 10);

    // Click outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    // Close on scroll
    const handleScroll = (event: Event) => {
      if (
        dropdownRef.current &&
        dropdownRef.current.contains(event.target as Node)
      ) {
        return;
      }
      setIsOpen(false);
    };

    const handleResize = () => setIsOpen(false);

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen, onSearchChange]);

  return {
    state: {
      isOpen,
      coords,
    },
    refs: {
      triggerRef,
      dropdownRef,
      searchInputRef,
    },
    actions: {
      toggle,
      handleClear,
      handleTriggerKeyDown,
      handleMenuKeyDown,
      handleDropdownClick,
      setIsOpen,
    },
  };
};
