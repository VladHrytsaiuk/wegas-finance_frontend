import {
  cloneElement,
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  type ReactElement,
} from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import { HiXMark } from "react-icons/hi2";
import ConfirmCloseModal from "./ConfirmCloseModal";

export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  z-index: 1000;
  transition: all 0.5s;
`;

export const StyledModal = styled.div<{ $padding?: string }>`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: var(--color-bg-surface);
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  padding: ${(props) => props.$padding || "3.2rem 4rem"};
  transition: all 0.5s;
  z-index: 1001;
  border: 1px solid var(--color-border);

  max-height: 95vh;
  overflow-y: auto;

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

export const ModalCloseButton = styled.button`
  background: transparent;
  border: none;
  position: absolute;
  top: 1.2rem;
  right: 1.2rem;
  z-index: 10;
  padding: 0.4rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  color: var(--color-text-secondary);

  &:hover {
    background-color: var(--color-bg-hover);
    color: var(--color-text-main);
  }

  & svg {
    width: 1.5rem;
    height: 1.5rem;
  }
`;

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
  if (!context) return cloneElement(children, { onClick: () => {} });

  const { open } = context;
  return cloneElement(children, { onClick: () => open(opensWindowName) });
}

function Window({
  children,
  name,
  padding,
}: {
  children: ReactElement;
  name: string;
  padding?: string;
}) {
  const context = useContext(ModalContext);

  // Якщо контексту немає, вікно просто не рендериться (але не ламає додаток)
  if (!context) return null;

  const { openName, close, isDirty } = context;
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
  }, [openName, name, isDirty, showConfirm]);

  if (name !== openName) return null;

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
          cloneElement(children, { onCloseModal: handleCloseAttempt } as any)
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
