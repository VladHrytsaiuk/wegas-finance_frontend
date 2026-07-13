import styled from "styled-components";

export const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  width: min(1040px, calc(100vw - 3rem));
  height: min(78vh, 860px);
  max-height: 100%;
  overflow: hidden;

  @media (max-width: 991px) {
    width: min(100vw - 1.5rem, 100%);
    height: min(82vh, 860px);
  }
`;

export const Header = styled.div`
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  flex-shrink: 0;
  border-bottom: 1px solid var(--color-border);

  h2 {
    font-size: clamp(1.2rem, 4vw, 1.5rem);
    color: var(--color-text-main);
    margin: 0;
    line-height: 1.3;
    /* 🔥 Якщо ключ перекладу довгий - він перенесеться, а не розірве модалку */
    word-wrap: break-word;
  }

  @media (max-width: 991px) {
    padding: 1.1rem 1rem 0.9rem 1rem;
  }
`;

export const ToolbarWrapper = styled.div`
  padding: 1rem 1.5rem 0 1.5rem;
  width: 100%;
  flex-shrink: 0;

  @media (max-width: 991px) {
    padding: 0.9rem 1rem 0 1rem;
  }
`;

export const ScrollArea = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 1rem 1.5rem 1.5rem 1.5rem;
  overscroll-behavior: contain;

  @media (max-width: 991px) {
    padding: 0.85rem 1rem 1rem 1rem;
  }

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--color-border);
    border-radius: 10px;
  }
`;

export const DateGroup = styled.div`
  margin-bottom: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 18px;
  overflow: hidden;
  background: var(--color-bg-surface);
  box-shadow: var(--shadow-sm);
`;

export const DateLabel = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  cursor: pointer;
  border: none;
  background: var(--color-bg-page);
  padding: 0.8rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid var(--color-border);

  &:hover {
    background: var(--color-bg-hover);
    color: var(--color-text-main);
  }
`;

export const EmptyState = styled.div`
  min-height: 320px;
  padding: 3rem 1rem;
  text-align: center;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const LoadingIndicator = styled.div`
  text-align: center;
  font-size: 0.8rem;
  color: var(--color-text-tertiary);
  padding: 0 0 1rem 0;
`;

export const Sentinel = styled.div`
  height: 1px;
`;

export const PickerOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 12020;
  background: rgba(15, 23, 42, 0.3);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

export const PickerSheet = styled.div`
  width: min(100%, 420px);
  border-radius: 24px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-surface);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.22);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
`;

export const PickerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;

  h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 800;
    color: var(--color-text-main);
  }
`;

export const PickerActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const PickerDismiss = styled.button`
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-page);
  color: var(--color-text-main);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

export const ScrollTopButton = styled.button`
  position: absolute;
  right: 1.5rem;
  bottom: 1.5rem;
  width: 46px;
  height: 46px;
  border-radius: 14px;
  border: 1px solid var(--color-border);
  background: color-mix(in srgb, var(--color-bg-surface), white 8%);
  color: var(--color-text-main);
  box-shadow: var(--shadow-lg);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 4;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    color: var(--color-brand-700);
    border-color: var(--color-brand-200);
    background: var(--color-brand-50);
    box-shadow: 0 14px 30px rgba(16, 185, 129, 0.18);
    transform: translateY(-2px);
  }

  @media (max-width: 991px) {
    right: 1rem;
    bottom: 1rem;
  }
`;

export const SpinnerContainer = styled.div`
  padding: 3rem;
  display: flex;
  justify-content: center;
`;
