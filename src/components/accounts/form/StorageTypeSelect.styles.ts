import styled from "styled-components";

export const Wrapper = styled.div`
  position: relative;
  width: 100%;
`;

interface TriggerProps {
  $isOpen: boolean;
  $hasError?: boolean;
}

// 🔥 ВИПРАВЛЕНО: Це тепер DIV, а не button
export const Trigger = styled.div<TriggerProps>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 1rem;
  background-color: var(--color-bg-surface);

  border-radius: var(--radius-md);
  color: var(--color-text-main);
  font-size: 0.95rem;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;

  box-sizing: border-box;

  border: 1px solid
    ${(props) =>
      props.$hasError
        ? "var(--color-red-500)"
        : props.$isOpen
          ? "var(--color-brand-600)"
          : "var(--color-border)"};

  /* Якщо при фокусі додається box-shadow, він не впливає на розмір, це добре */
  &:focus {
    border-color: var(--color-brand-600);
    box-shadow: 0 0 0 2px var(--color-brand-100);
  }
`;

export const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  overflow: hidden;
`;

export const Placeholder = styled.span`
  color: var(--color-text-tertiary);
`;

export const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-secondary);
`;

export const ClearButton = styled.button`
  background: transparent;
  border: none;
  color: var(--color-text-tertiary);
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 2px;
  border-radius: 50%;

  &:hover {
    background-color: var(--color-bg-hover);
    color: var(--color-text-main);
  }
`;

// --- PORTAL DROPDOWN ---

export const PortalMenu = styled.div`
  position: fixed;
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: fadeIn 0.15s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const SearchWrapper = styled.div`
  padding: 0.5rem;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-page);
`;

export const SearchInputContainer = styled.div`
  position: relative;
  width: 100%;
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 0.6rem 0.8rem 0.6rem 2.2rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-surface);
  color: var(--color-text-main);
  font-size: 0.9rem;
  outline: none;

  &:focus {
    border-color: var(--color-brand-600);
  }
`;

export const List = styled.div`
  flex: 1;
  overflow-y: auto;
  max-height: 250px;
  padding: 0.5rem 0;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--color-border);
    border-radius: 4px;
  }
`;

// 🔥 ВИПРАВЛЕНО: Експортуємо як OptionItem (в компоненті була помилка назви)
export const OptionItem = styled.button<{ $selected?: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 1rem;
  background: ${(props) =>
    props.$selected ? "var(--color-brand-50)" : "transparent"};
  border: none;
  cursor: pointer;
  color: var(--color-text-main);
  font-size: 0.9rem;
  text-align: left;
  transition: background 0.2s;

  &:hover,
  &:focus {
    background-color: var(--color-bg-hover);
    outline: none;
  }
`;

export const CreateActionBtn = styled.button`
  width: 100%;
  padding: 0.8rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-brand-600);
  background: transparent;
  border: none;
  border-top: 1px solid var(--color-border);
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  transition: background 0.2s;

  &:hover {
    background-color: var(--color-brand-50);
  }
`;
