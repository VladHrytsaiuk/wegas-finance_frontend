import { useEffect, useState } from "react";
import styled, { keyframes, css } from "styled-components";
import {
  HiArrowPath,
  HiMinus,
  HiArrowsPointingOut,
  HiCheckCircle, // 👈 Додали галочку
} from "react-icons/hi2";
import { useSync } from "../../../context/SyncContext";

// --- ANIMATIONS ---

const slideUp = keyframes`
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

// Нова анімація для закриття
const slideDown = keyframes`
  from { transform: translateY(0); opacity: 1; }
  to { transform: translateY(100%); opacity: 0; }
`;

const popIn = keyframes`
  0% { transform: scale(0); opacity: 0; }
  80% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
`;

const indeterminateLoading = keyframes`
  0% { transform: translateX(-100%); }
  50% { transform: translateX(0%); }
  100% { transform: translateX(100%); }
`;

// --- STYLES ---

const WidgetContainer = styled.div<{
  $minimized: boolean;
  $isFinished: boolean;
}>`
  position: fixed;
  bottom: 24px;
  right: 24px;
  background-color: var(--color-bg-surface);
  border: 1px solid
    ${(props) =>
      props.$isFinished
        ? "var(--color-brand-500)"
        : "var(--color-border)"}; /* Зелений бордер при успіху */
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  z-index: 9999;
  animation: ${(props) => (props.$isClosing ? slideDown : slideUp)} 0.4s ease-in
    forwards;
  transition: all 0.3s ease;
  overflow: hidden;

  ${(props) =>
    props.$minimized
      ? css`
          width: 220px;
          padding: 10px 16px;
          cursor: pointer;
          &:hover {
            border-color: ${props.$isFinished
              ? "var(--color-brand-500)"
              : "var(--color-brand-600)"};
          }
        `
      : css`
          width: 320px;
          padding: 16px;
        `}
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  h4 {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--color-text-main);
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 6px;
  background-color: var(--color-bg-secondary);
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressBarIndeterminate = styled.div`
  height: 100%;
  width: 100%;
  background-color: var(--color-brand-600);
  animation: ${indeterminateLoading} 1.5s infinite linear;
`;

const ProgressBarFinished = styled.div`
  height: 100%;
  width: 100%;
  background-color: var(--color-brand-500);
  transition: width 0.3s ease;
`;

const StatusText = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  display: flex;
  justify-content: space-between;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: var(--color-bg-hover);
    color: var(--color-text-main);
  }
`;

// Галочка з анімацією
const SuccessIcon = styled(HiCheckCircle)`
  color: var(--color-brand-500);
  animation: ${popIn} 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
`;

// --- COMPONENT ---

export function SyncWidget() {
  const { statusData, isVisible } = useSync();
  const [isMinimized, setIsMinimized] = useState(false);
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      setIsClosing(false);
    } else if (shouldRender) {
      // Починаємо анімацію закриття
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 400); // Час анімації
      return () => clearTimeout(timer);
    }
  }, [isVisible, shouldRender]);

  // 🔥 ВАЖЛИВО: Перевіряємо shouldRender, а не isVisible
  if (!shouldRender) return null;

  const isFinished = !statusData.is_running;

  return (
    <WidgetContainer
      $minimized={isMinimized}
      $isFinished={isFinished}
      $isClosing={isClosing} // Додано сюди для обох режимів
      onClick={isMinimized ? () => setIsMinimized(false) : undefined}
    >
      <Header>
        <h4>
          {isFinished ? (
            <>
              <SuccessIcon size={isMinimized ? 20 : 24} />
              <span style={{ color: "var(--color-brand-500)" }}>
                {isMinimized ? "Готово!" : "Успішно!"}
              </span>
            </>
          ) : (
            <>
              <HiArrowPath
                className="spin"
                style={{ color: "var(--color-brand-600)" }}
                size={20}
              />
              {isMinimized ? "Синхронізація..." : "Monobank Sync"}
            </>
          )}
        </h4>

        {isMinimized ? (
          <HiArrowsPointingOut size={16} title="Розгорнути" />
        ) : (
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(true);
            }}
            title="Згорнути"
          >
            <HiMinus size={18} />
          </IconButton>
        )}
      </Header>

      {!isMinimized && (
        <Content>
          <StatusText>
            <span>
              {isFinished
                ? "Синхронізацію завершено"
                : statusData.message || "Ініціалізація..."}
            </span>
            <span
              style={{
                fontWeight: 600,
                color: isFinished
                  ? "var(--color-brand-500)"
                  : "var(--color-text-main)",
              }}
            >
              {statusData.total_imported} шт.
            </span>
          </StatusText>

          <ProgressBarContainer>
            {isFinished ? (
              <ProgressBarFinished />
            ) : (
              <ProgressBarIndeterminate />
            )}
          </ProgressBarContainer>

          <div
            style={{
              fontSize: "0.75rem",
              color: isFinished
                ? "var(--color-brand-500)"
                : "var(--color-text-secondary)",
              marginTop: "4px",
            }}
          >
            {isFinished
              ? "Це вікно закриється автоматично."
              : "Процес виконується у фоновому режимі."}
          </div>
        </Content>
      )}
    </WidgetContainer>
  );
}
