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
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;
    const viewportHeight = window.innerHeight;

    // Exact matching requirements
    const calculatedWidth = rect.width;
    let left = rect.left + scrollX;

    // Viewport overflow protection (Right edge)
    // We assume the dropdown might be around 300px wide (max-content)
    const viewportWidth = window.innerWidth;
    const padding = 10;
    const estimatedMaxContentWidth = 300; 

    if (rect.left + estimatedMaxContentWidth > viewportWidth - padding) {
      // If it overflows right, align the right edge of dropdown with right edge of trigger
      left = rect.right + scrollX - estimatedMaxContentWidth;
      // But don't go past the left edge of the screen
      if (left < scrollX + padding) left = scrollX + padding;
    }

    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    
    // Dynamic threshold: if space below is less than 280px and there's more space above
    const showAbove = spaceBelow < 280 && spaceAbove > spaceBelow;

    setCoords({
      top: showAbove ? rect.top + scrollY - 4 : rect.bottom + scrollY + 4,
      left: left,
      width: calculatedWidth,
      isAbove: showAbove,
    });
  }, []);

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

    // Update position on scroll/resize instead of closing
    const handleUpdate = (event: Event) => {
      // If we are scrolling INSIDE the dropdown, don't update coords (to avoid jitter)
      if (
        event.type === "scroll" &&
        dropdownRef.current &&
        dropdownRef.current.contains(event.target as Node)
      ) {
        return;
      }
      updateCoords();
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", handleUpdate);
    window.addEventListener("scroll", handleUpdate, true);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("scroll", handleUpdate, true);
    };
  }, [isOpen, onSearchChange, updateCoords]);

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
