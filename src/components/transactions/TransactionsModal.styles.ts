import styled from "styled-components";

export const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 80vw; /* Займає всі 95vw від батька */
  height: 75vh; /* Даємо фіксовану висоту, щоб включився внутрішній скрол */
  max-height: 100%;
`;

export const Header = styled.div`
  margin-bottom: 1rem;
  flex-shrink: 0;

  h2 {
    font-size: clamp(1.2rem, 4vw, 1.5rem);
    color: var(--color-text-main);
    margin: 0;
    line-height: 1.3;
    /* 🔥 Якщо ключ перекладу довгий - він перенесеться, а не розірве модалку */
    word-wrap: break-word;
  }
`;

export const ToolbarWrapper = styled.div`
  margin-bottom: 1rem;
  width: 100%;
  flex-shrink: 0;
`;

export const ScrollArea = styled.div`
  flex: 1;
  min-height: 0; /* 🔥 Секрет Flexbox: дозволяє цьому блоку скролитись всередині модалки */
  overflow-y: auto;
  padding-right: 0.5rem;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--color-border);
    border-radius: 10px;
  }
`;

export const DateGroup = styled.div`
  margin-bottom: 1.5rem;
`;

export const DateLabel = styled.div`
  position: sticky;
  top: 0;
  background: var(--color-bg-surface);
  padding: 0.5rem 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  z-index: 5;
  border-bottom: 1px solid var(--color-bg-page);
`;

export const EmptyState = styled.div`
  padding: 3rem 1rem;
  text-align: center;
  color: var(--color-text-secondary);
`;

export const LoadingIndicator = styled.div`
  text-align: center;
  font-size: 0.8rem;
  color: var(--color-text-tertiary);
  padding: 0.5rem;
`;

export const SpinnerContainer = styled.div`
  padding: 3rem;
  display: flex;
  justify-content: center;
`;
