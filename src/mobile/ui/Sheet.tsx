import type { ReactNode } from "react";
import { Drawer } from "vaul";
import styled from "styled-components";

// Нижня панель iOS: тягнеться вниз, щоб закрити; вкладені панелі (вибір
// категорії, рахунку) відкриваються поверх і зсувають попередню.

// Однаковий z-index у всіх панелей: порядок задає DOM, тож вкладена панель
// разом зі своїм затемненням лягає поверх батьківської, а не під неї.
const Overlay = styled(Drawer.Overlay)`
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: var(--m-overlay);
`;

const Content = styled(Drawer.Content)`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  max-height: calc(100dvh - env(safe-area-inset-top) - 12px);
  border-radius: 14px 14px 0 0;
  background: var(--m-bg);
  color: var(--m-label);
  font-family: var(--m-font);
  -webkit-font-smoothing: antialiased;
  outline: none;
`;

const Grabber = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 6px;

  &::before {
    content: "";
    width: 36px;
    height: 5px;
    border-radius: 3px;
    background: var(--m-label-3);
  }
`;

const Header = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 16px;
`;

const Title = styled(Drawer.Title)`
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  white-space: nowrap;
`;

export const SheetTextButton = styled.button<{ $bold?: boolean }>`
  justify-self: start;
  padding: 10px 0;
  border: none;
  background: none;
  font: inherit;
  font-size: 17px;
  font-weight: ${(p) => (p.$bold ? 600 : 400)};
  color: var(--m-accent);
  cursor: pointer;

  &:disabled {
    color: var(--m-label-3);
  }
`;

const Trailing = styled.div`
  justify-self: end;
`;

const Body = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 12px 16px 16px;

  /* У прокручуваній колонці блоки з overflow: hidden інакше стискаються
     й обрізають свої рядки (у Safari зникали «Дата» й «Нотатка»). */
  & > * {
    flex-shrink: 0;
  }
`;

const Footer = styled.div`
  padding: 12px 16px calc(env(safe-area-inset-bottom) + 12px);
  border-top: 0.5px solid var(--m-separator);
  background: var(--m-bg);
`;

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  /** Кнопка справа в шапці (напр. «Готово»). */
  trailing?: ReactNode;
  footer?: ReactNode;
  /** Вкладена панель поверх іншої. */
  nested?: boolean;
  /** Кнопка «Скасувати»; без обробника просто закриває панель. */
  onCancel?: () => void;
  /** Без «Скасувати» — коли зміни застосовуються одразу і скасовувати нічого. */
  hideCancel?: boolean;
}

export function Sheet({ open, onOpenChange, title, children, trailing, footer, nested, onCancel, hideCancel }: SheetProps) {
  const Root = nested ? Drawer.NestedRoot : Drawer.Root;
  return (
    <Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Overlay />
        <Content aria-describedby={undefined}>
          <Grabber aria-hidden="true" />
          <Header>
            {hideCancel ? (
              <span />
            ) : (
              <SheetTextButton type="button" onClick={onCancel ?? (() => onOpenChange(false))}>
                Скасувати
              </SheetTextButton>
            )}
            <Title>{title}</Title>
            <Trailing>{trailing}</Trailing>
          </Header>
          <Body>{children}</Body>
          {footer && <Footer>{footer}</Footer>}
        </Content>
      </Drawer.Portal>
    </Root>
  );
}

export const PrimaryButton = styled.button`
  width: 100%;
  height: 50px;
  border: none;
  border-radius: var(--m-radius-group);
  font: inherit;
  font-size: 17px;
  font-weight: 600;
  color: var(--m-on-accent);
  background: var(--m-accent);
  cursor: pointer;

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;
