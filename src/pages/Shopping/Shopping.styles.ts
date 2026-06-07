import styled from "styled-components";

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
  flex: 1;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    font-size: 1.5rem;
    color: var(--color-text-main);
  }
`;

export const CreateNoteCard = styled.form`
  background-color: ${(p) => p.$color || "var(--color-bg-surface)"};
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 0.6rem 1rem;
  max-width: 500px;
  margin: 0 auto;
  width: 100%;
  box-shadow: var(--shadow-sm);
  display: flex;
  gap: 12px;
  transition: all 0.2s;

  &:focus-within {
    border-color: var(--color-brand-500);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
  }

  input {
    flex: 1;
    border: none;
    background: transparent;
    font-size: 0.95rem;
    color: var(--color-text-main);
    outline: none;
  }
`;

export const MasonryGrid = styled.div`
  column-count: 1;
  column-gap: 1.5rem;

  @media (min-width: 768px) {
    column-count: 2;
  }
  @media (min-width: 1100px) {
    column-count: 3;
  }
  @media (min-width: 1500px) {
    column-count: 4;
  }
`;

export const NoteCard = styled.div`
  break-inside: avoid;
  margin-bottom: 1.5rem;
  background-color: ${(p) => p.$color || "var(--color-bg-surface)"};
  border: 1px solid
    ${(p) =>
      p.$color && p.$color !== "#ffffff"
        ? "transparent"
        : "var(--color-border)"};
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-md);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  display: flex;
  flex-direction: column;

  &:hover {
    box-shadow: var(--shadow-lg);
    .note-footer {
      opacity: 1;
    }
  }
`;

export const NoteHeader = styled.div`
  padding: 0.75rem 1rem 0.4rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

// 🔥 ІНПУТ ДЛЯ РЕДАГУВАННЯ ЗАГОЛОВКА
export const TitleInput = styled.input`
  width: 100%;
  background: transparent;
  border: none;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text-main);
  outline: none;
  padding: 4px 0;
  border-bottom: 1px solid transparent;

  &:focus {
    border-bottom: 1px solid var(--color-brand-500);
  }

  &::placeholder {
    color: var(--color-text-tertiary);
  }
`;

export const ItemsList = styled.div`
  padding: 0.5rem 0;
  flex: 1; /* Розтягує список, щоб футер був знизу */
`;

// 🔥 НОВИЙ ФУТЕР
export const NoteFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  opacity: 0; /* Приховані дії, поки не наведеш мишку (як у Keep) */
  transition: opacity 0.2s ease-in-out;

  @media (max-width: 768px) {
    opacity: 1;
  }
`;

export const MetaData = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 0.65rem;
  color: var(--color-text-tertiary);
  gap: 2px;

  span.author {
    font-weight: 600;
    color: var(--color-text-secondary);
  }
`;

export const ActionsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

// Кнопка для видалення (стилізована під інші кнопки в тулбарі)
export const ActionButton = styled.button`
  background: none;
  border: none;
  color: var(--color-text-secondary);
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: var(--color-red-600);
  }
`;

export const ListItem = styled.div<{ $isBought?: boolean; $isInput?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 1rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${(props) => !props.$isInput && "rgba(0,0,0,0.03)"};
    .item-delete {
      opacity: 1;
    }
  }

  span {
    flex: 1;
    font-size: 0.85rem;
    color: ${(props) =>
      props.$isBought
        ? "var(--color-text-tertiary)"
        : "var(--color-text-main)"};
    text-decoration: ${(props) => (props.$isBought ? "line-through" : "none")};
    cursor: pointer;
    word-break: break-word;
  }
`;

export const AddItemForm = styled.form`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
`;

export const AddItemInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.85rem;
  color: var(--color-text-main);
  outline: none;
  padding: 4px 0;
  &::placeholder {
    color: var(--color-text-tertiary);
  }
`;

export const ItemDeleteBtn = styled.button`
  background: none;
  border: none;
  color: var(--color-text-tertiary);
  cursor: pointer;
  opacity: 0;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;

  @media (max-width: 768px) {
    opacity: 1;
  }

  &:hover {
    color: var(--color-red-600);
    background-color: var(--color-red-50);
  }
`;

export const Checkbox = styled.div<{ $checked?: boolean; $isAdd?: boolean }>`
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: ${(props) =>
    props.$isAdd
      ? "none"
      : `2px solid ${props.$checked ? "var(--color-brand-500)" : "var(--color-border)"}`};
  background-color: ${(props) =>
    props.$checked ? "var(--color-brand-500)" : "transparent"};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => (props.$isAdd ? "var(--color-text-tertiary)" : "white")};
  cursor: ${(props) => (props.$isAdd ? "default" : "pointer")};
  flex-shrink: 0;

  svg {
    opacity: ${(props) => (props.$checked || props.$isAdd ? 1 : 0)};
    width: 12px;
    height: 12px;
  }
`;

export const Divider = styled.div`
  height: 1px;
  background: rgba(0, 0, 0, 0.05);
  margin: 4px 0;
`;

export const PaginationWrapper = styled.div`
  width: 100%;
  margin-top: auto;
  padding-top: 1rem;

  /* Якщо хочеш центрувати пагінацію, незважаючи на flex-end в самому компоненті,
     можна спробувати перевизначити стилі через дочірній селектор, 
     але краще просто залишити як є, якщо flex-end (справа) тебе влаштовує.
     Або додай тут display: flex; justify-content: center; і передай className в Pagination.
  */
`;
