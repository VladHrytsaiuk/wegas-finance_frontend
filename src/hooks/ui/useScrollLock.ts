import { useEffect } from "react";

type LockedElementState = {
  element: HTMLElement;
  overflow: string;
  overscrollBehavior: string;
};

let activeLocks = 0;
let lockedStates: LockedElementState[] = [];

function getLockTargets(): HTMLElement[] {
  const targets = [
    document.documentElement,
    document.body,
    ...Array.from(document.querySelectorAll("main")),
  ];

  return Array.from(new Set(targets)).filter(
    (node): node is HTMLElement => node instanceof HTMLElement,
  );
}

function lockScroll() {
  if (activeLocks === 0) {
    lockedStates = getLockTargets().map((element) => ({
      element,
      overflow: element.style.overflow,
      overscrollBehavior: element.style.overscrollBehavior,
    }));

    lockedStates.forEach(({ element }) => {
      element.style.overflow = "hidden";
      element.style.overscrollBehavior = "none";
    });
  }

  activeLocks += 1;
}

function unlockScroll() {
  activeLocks = Math.max(0, activeLocks - 1);

  if (activeLocks === 0) {
    lockedStates.forEach(({ element, overflow, overscrollBehavior }) => {
      element.style.overflow = overflow;
      element.style.overscrollBehavior = overscrollBehavior;
    });
    lockedStates = [];
  }
}

export function useScrollLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    lockScroll();

    return () => {
      unlockScroll();
    };
  }, [enabled]);
}
