import {
  cloneElement,
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  isValidElement,
  forwardRef,
  type ReactNode,
  type ReactElement,
} from "react";
import { createPortal } from "react-dom";
import styled, { keyframes, css } from "styled-components";
import { HiXMark } from "react-icons/hi2";
import ConfirmCloseModal from "./ConfirmCloseModal";

// --- ANIMATIONS ---
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
`;

const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;

// --- STYLED COMPONENTS ---
const StyledOverlay = styled.div<{ $isBottomSheet?: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  background-color: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  z-index: 10000;
  animation: ${fadeIn} 0.2s ease-out;

  ${(props) =>
    props.$isBottomSheet
      ? css`
          display: flex;
          align-items: flex-end;
          padding: 0;
        `
      : css`
          display: grid;
          place-items: center;
          padding: 1rem;
        `}
`;

export const Overlay = forwardRef<
  HTMLDivElement,
  {
    children?: ReactNode;
    $isBottomSheet?: boolean;
    style?: React.CSSProperties;
    [key: string]: any;
  }
>(({ children, $isBottomSheet, style, ...props }, ref) => {
  const [viewportStyles, setViewportStyles] = useState<React.CSSProperties>({});
  const localRef = useRef<HTMLDivElement | null>(null);

  const setRefs = (node: HTMLDivElement | null) => {
    localRef.current = node;
    if (ref) {
      if (typeof ref === "function") {
        ref(node);
      } else {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    }
  };

  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;

    const handleVisualViewportChange = () => {
      const vv = window.visualViewport;
      if (!vv) return;

      setViewportStyles({
        height: `${vv.height}px`,
        width: `${vv.width}px`,
        top: `${vv.offsetTop}px`,
        left: `${vv.offsetLeft}px`,
      });
    };

    window.visualViewport.addEventListener("resize", handleVisualViewportChange);
    window.visualViewport.addEventListener("scroll", handleVisualViewportChange);

    // Initial run
    handleVisualViewportChange();

    return () => {
      window.visualViewport?.removeEventListener("resize", handleVisualViewportChange);
      window.visualViewport?.removeEventListener("scroll", handleVisualViewportChange);
    };
  }, []);

  // Smooth scroll input into view on mobile keyboard toggle
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (!localRef.current?.contains(target)) return;

      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT")
      ) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 150);
      }
    };

    document.addEventListener("focusin", handleFocusIn);
    return () => {
      document.removeEventListener("focusin", handleFocusIn);
    };
  }, []);

  return (
    <StyledOverlay
      ref={setRefs}
      $isBottomSheet={$isBottomSheet}
      style={{ ...viewportStyles, ...style }}
      {...props}
    >
      {children}
    </StyledOverlay>
  );
});

Overlay.displayName = "Overlay";


export const StyledModal = styled.div<{ $padding?: string }>`
  background-color: var(--color-bg-surface);
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  padding: ${(props) => props.$padding || "3.2rem 4rem"};
  z-index: 10001;
  border: 1px solid var(--color-border);
  position: relative;
  animation: ${scaleIn} 0.2s ease-out;

  max-height: 90%;
  overflow-y: auto;
  width: auto;

  @media (max-width: 480px) {
    width: 96%;
    padding: ${(props) => props.$padding || "1.5rem 1rem 1.25rem 1rem"};
    border-radius: 12px;
  }

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--color-border);
    border-radius: 20px;
  }
`;

// --- BOTTOM SHEET STYLED COMPONENTS ---
export const BottomSheetPanel = styled.div<{ $padding?: string; $bgColor?: string }>`
  background-color: ${(props) => props.$bgColor || "var(--color-bg-surface)"};
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -4px 32px rgba(0, 0, 0, 0.15);
  z-index: 10001;
  position: relative;
  width: 100%;
  max-height: calc(100% - 24px);
  overflow-y: auto; /* Prevent flex collapse, container handles scrolling */
  animation: ${slideUp} 0.3s cubic-bezier(0.32, 0.72, 0, 1);
  display: flex;
  flex-direction: column;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.15);
    border-radius: 20px;
  }
`;

export const DragHandle = styled.div`
  display: flex;
  justify-content: center;
  padding: 12px 0 4px 0;
  flex-shrink: 0;

  &::after {
    content: "";
    width: 36px;
    height: 4px;
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }
`;



export const BottomSheetContent = styled.div<{ $padding?: string }>`
  flex: 1;
  padding: ${(props) => props.$padding || "0"};

  @media (max-width: 768px) {
    /* Limit horizontal padding to 1.25rem on mobile to keep form inputs wide enough */
    padding: ${(props) => (props.$padding === "0" ? "0" : "1rem 1.25rem 2rem 1.25rem")};
  }
`;

export const ModalCloseButton = styled.button`
  background: transparent;
  border: none;
  position: absolute;
  top: 1.2rem;
  right: 1.2rem;
  z-index: 110;
  padding: 0.4rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  color: var(--color-text-secondary);

  @media (max-width: 480px) {
    top: 0.8rem;
    right: 0.8rem;
  }

  &:hover {
    background-color: var(--color-bg-hover);
    color: var(--color-text-main);
  }

  & svg {
    width: 1.5rem;
    height: 1.5rem;
  }
`;

// --- CONTEXT ---
interface ModalContextType {
  openName: string;
  close: () => void;
  open: (name: string) => void;
  isDirty: boolean;
  setIsDirty: (value: boolean) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

function Modal({ children }: { children: ReactNode }) {
  const [openName, setOpenName] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  const open = (name: string) => {
    setIsDirty(false);
    setOpenName(name);
  };

  const close = () => {
    setOpenName("");
    setIsDirty(false);
  };

  // Centralized body scroll lock when modal is open
  useEffect(() => {
    if (openName) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [openName]);

  return (
    <ModalContext.Provider
      value={{ openName, close, open, isDirty, setIsDirty }}
    >
      {children}
    </ModalContext.Provider>
  );
}

function Open({
  children,
  opens: opensWindowName,
}: {
  children: ReactElement;
  opens: string;
}) {
  const context = useContext(ModalContext);
  
  // Якщо контексту немає, просто повертаємо кнопку, але вона не спрацює як модалка
  if (!context) {
    return cloneElement(children, { onClick: () => {} });
  }

  const { open } = context;
  return cloneElement(children, {
    onClick: (e: React.MouseEvent) => {
      // Викликаємо оригінальний onClick, якщо він є
      if (children.props.onClick) {
        children.props.onClick(e);
      }
      // Відкриваємо модальне вікно
      open(opensWindowName);
    },
  });
}


// --- HOOK: Detect mobile ---
function useIsMobileModal(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= breakpoint : false,
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isMobile;
}

function Window({
  children,
  name,
  padding,
  mobileBottomSheet = false,
}: {
  children: ReactElement;
  name: string;
  padding?: string;
  mobileBottomSheet?: boolean;
}) {
  const context = useContext(ModalContext);
  const isMobile = useIsMobileModal();

  // Витягуємо значення з контексту або заглушки (щоб хуки завжди викликались)
  const openName = context?.openName ?? "";
  const close = context?.close ?? (() => {});
  const isDirty = context?.isDirty ?? false;

  const [showConfirm, setShowConfirm] = useState(false);

  const handleCloseAttempt = () => {
    if (isDirty) setShowConfirm(true);
    else close();
  };

  useEffect(() => {
    if (name === openName) {
      setShowConfirm(false);
    }
  }, [name, openName]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showConfirm) setShowConfirm(false);
        else handleCloseAttempt();
      }
    };

    if (name === openName) {
      document.addEventListener("keydown", handleEsc);
    }
    return () => document.removeEventListener("keydown", handleEsc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openName, name, isDirty, showConfirm]);

  // Якщо контексту немає або модалка не відкрита — не рендеримо
  if (!context || name !== openName) return null;


  // --- BOTTOM SHEET RENDER (mobile only) ---
  const useBottomSheet = mobileBottomSheet && isMobile;

  if (useBottomSheet) {
    return createPortal(
      <Overlay $isBottomSheet onClick={handleCloseAttempt}>
        <BottomSheetPanel onClick={(e) => e.stopPropagation()}>
          <DragHandle />

          {!showConfirm && (
            <ModalCloseButton onClick={handleCloseAttempt}>
              <HiXMark />
            </ModalCloseButton>
          )}

          {showConfirm ? (
            <BottomSheetContent $padding="1.5rem">
              <ConfirmCloseModal
                onConfirm={close}
                onCloseModal={() => setShowConfirm(false)}
              />
            </BottomSheetContent>
          ) : (
            <BottomSheetContent $padding={padding}>
              {isValidElement(children) ? (
                cloneElement(children, {
                  onCloseModal: handleCloseAttempt,
                } as Record<string, unknown>)
              ) : (
                children
              )}
            </BottomSheetContent>
          )}
        </BottomSheetPanel>
      </Overlay>,
      document.body,
    );
  }

  // --- DEFAULT CENTERED MODAL RENDER ---
  return createPortal(
    <Overlay onClick={handleCloseAttempt}>
      <StyledModal
        $padding={padding}
        onClick={(e) => e.stopPropagation()}
        style={
          showConfirm
            ? {
                padding: "2.4rem",
                width: "fit-content",
                maxWidth: "28rem",
                minWidth: "22rem",
              }
            : {}
        }
      >
        {!showConfirm && (
          <ModalCloseButton onClick={handleCloseAttempt}>
            <HiXMark />
          </ModalCloseButton>
        )}

        {showConfirm ? (
          <ConfirmCloseModal
            onConfirm={close}
            onCloseModal={() => setShowConfirm(false)}
          />
        ) : (
          isValidElement(children) ? (
            cloneElement(children, {
              onCloseModal: handleCloseAttempt,
            } as Record<string, unknown>)
          ) : (
            children
          )
        )}
      </StyledModal>
    </Overlay>,
    document.body,
  );
}

Modal.Open = Open;
Modal.Window = Window;

// 🔥 ВИПРАВЛЕНО: БЕЗПЕЧНИЙ useModal
export const useModal = () => {
  const context = useContext(ModalContext);

  // Замість викидання помилки, повертаємо "заглушку".
  // Це дозволяє викликати useModal() навіть без <Modal> обгортки.
  if (context === undefined) {
    return {
      openName: "",
      close: () => {},
      open: () => {},
      isDirty: false,
      setIsDirty: () => {}, // Пуста функція, нічого не ламає
    };
  }

  return context;
};

export default Modal;
