import { useState, useRef, useEffect, useCallback, RefObject } from "react";
import { focusNextElement } from "../../utils/focusUtils"; // Перевір шлях

interface UseBaseSelectProps {
  disabled?: boolean;
  menuWidth?: string | number;
  isMulti?: boolean;
  onSearchChange?: (value: string) => void;
  onClear?: () => void;
  searchValue?: string;
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
  searchValue,
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
    if (!isOpen) triggerRef.current?.focus();
    else searchInputRef.current?.focus();
  };

  // --- Event Handlers ---
  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    // Якщо відкрито і ми в інпуті
    if (isOpen && onSearchChange) {
      if (e.key === "ArrowDown" || e.key === "Tab") {
        e.preventDefault();
        // Якщо натиснули Tab або ArrowDown в інпуті - переходимо до списку
        const firstFocusable = dropdownRef.current?.querySelector(
          "button, [href], [role='button'][tabindex='0']"
        ) as HTMLElement;
        firstFocusable?.focus();
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        // Пріоритет: шукаємо елемент з атрибутом data-autofocus="true"
        const autoFocused = dropdownRef.current?.querySelector('[data-autofocus="true"]') as HTMLElement;
        if (autoFocused) {
          autoFocused.click();
        } else {
          // Якщо немає явного авто-фокусу, клікаємо по першому ліпшому
          const firstFocusable = dropdownRef.current?.querySelector(
            "button, [role='button'][tabindex='0'], [href]"
          ) as HTMLElement;
          if (firstFocusable) firstFocusable.click();
        }
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        return;
      }
      return; // Дозволяємо типити
    }

    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) toggle();
    }
  };

  // Ефект для автоматичного "підсвічування" першого елемента при пошуку
  useEffect(() => {
    if (isOpen && onSearchChange && dropdownRef.current) {
      // Видаляємо старі підсвічування
      const highlighted = dropdownRef.current.querySelectorAll("[data-autofocus]");
      highlighted.forEach((el) => el.removeAttribute("data-autofocus"));

      if (!searchValue) return;

      // ШУКАЄМО НАЙКРАЩИЙ МАТЧ:
      // 1. Спочатку шукаємо "кінцеві" вузли (без aria-expanded або закриті), які містять текст
      // 2. Якщо таких немає, беремо будь-який перший фокусабельний
      const query = searchValue.toLowerCase();
      
      const allFocusable = Array.from(
        dropdownRef.current.querySelectorAll("button, [role='button'][tabindex='0'], [href]")
      ) as HTMLElement[];

      // Шукаємо елемент, текст якого максимально відповідає пошуку (пріоритет на підкатегорії)
      const bestMatch = allFocusable.find(el => {
        const text = el.textContent?.toLowerCase() || "";
        // Перевіряємо, чи це кінцевий елемент (не має HiChevronDown або aria-expanded="true")
        const isLeaf = !el.querySelector('svg') || el.getAttribute('aria-expanded') !== 'true';
        return isLeaf && text.includes(query);
      }) || allFocusable.find(el => el.textContent?.toLowerCase().includes(query)) || allFocusable[0];

      if (bestMatch) {
        bestMatch.setAttribute("data-autofocus", "true");
        // Scroll to best match if it's not in view
        bestMatch.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [isOpen, onSearchChange, dropdownRef, searchValue]);

  const handleMenuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
      return;
    }

    const focusableElements = dropdownRef.current?.querySelectorAll(
      "button, [href], input, [role='button'], [tabindex]:not([tabindex='-1'])"
    );

    if (!focusableElements || focusableElements.length === 0) return;
    const elementsArr = Array.from(focusableElements) as HTMLElement[];
    const activeEl = document.activeElement as HTMLElement;
    const currentIndex = elementsArr.indexOf(activeEl);

    if (e.key === "Tab") {
      const activeEl = document.activeElement as HTMLElement;
      const currentIndex = elementsArr.indexOf(activeEl);

      // Якщо Shift+Tab на першому елементі - повертаємо в інпут
      if (e.shiftKey && currentIndex === 0) {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }
      
      // Якщо Tab на останньому елементі - закриваємо
      if (!e.shiftKey && currentIndex === elementsArr.length - 1) {
        setIsOpen(false);
        // Дозволяємо браузеру перейти далі
        return;
      }
      
      // Інакше дозволяємо звичайний Tab між елементами (якщо вони tabIndex=0)
      return;
    }

    if (e.key === "Enter" && !isMulti && activeEl.tagName !== "INPUT") {
      setTimeout(() => {
        setIsOpen(false);
        triggerRef.current?.focus();
      }, 50);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = currentIndex + 1 < elementsArr.length ? currentIndex + 1 : 0;
      elementsArr[nextIndex]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (currentIndex === 0 && onSearchChange) {
        searchInputRef.current?.focus();
      } else {
        const nextIndex = currentIndex - 1 >= 0 ? currentIndex - 1 : elementsArr.length - 1;
        elementsArr[nextIndex]?.focus();
      }
    }
  };

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Якщо клікнули по інпуту - не закриваємо
    if ((e.target as HTMLElement).closest("input")) return;

    if (!isMulti) {
      setIsOpen(false);
      setTimeout(() => {
        triggerRef.current?.focus();
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
