import { Drawer } from "vaul";
import styled from "styled-components";

// Аркуш дій iOS: пояснення і кнопки знизу, «Скасувати» окремо. Лежить вище за
// повноекранне фото (1100), щоб підтвердження видалення фото було видно.

const Overlay = styled(Drawer.Overlay)`
  position: fixed;
  inset: 0;
  z-index: 1200;
  background: var(--m-overlay);
`;

const Content = styled(Drawer.Content)`
  position: fixed;
  left: 8px;
  right: 8px;
  bottom: calc(env(safe-area-inset-bottom) + 8px);
  z-index: 1200;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-family: var(--m-font);
  outline: none;
`;

const Card = styled.div`
  overflow: hidden;
  border-radius: 14px;
  background: var(--m-surface);
`;

const Message = styled(Drawer.Title)`
  margin: 0;
  padding: 14px 16px;
  text-align: center;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.35;
  color: var(--m-label-2);
`;

const Action = styled.button<{ $destructive?: boolean; $bold?: boolean }>`
  display: block;
  width: 100%;
  min-height: 56px;
  border: none;
  border-top: 0.5px solid var(--m-separator);
  background: none;
  font: inherit;
  font-size: 20px;
  font-weight: ${(p) => (p.$bold ? 600 : 400)};
  color: ${(p) => (p.$destructive ? "#ff3b30" : "var(--m-accent)")};
  cursor: pointer;

  &:first-child {
    border-top: none;
  }

  &:disabled {
    color: var(--m-label-3);
  }
`;

export interface ConfirmAction {
  label: string;
  onSelect: () => void;
  destructive?: boolean;
}

interface ConfirmSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
  actions: ConfirmAction[];
  disabled?: boolean;
}

export function ConfirmSheet({ open, onOpenChange, message, actions, disabled }: ConfirmSheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Overlay />
        <Content aria-describedby={undefined}>
          <Card>
            <Message>{message}</Message>
            {actions.map((action) => (
              <Action
                key={action.label}
                type="button"
                $destructive={action.destructive}
                disabled={disabled}
                onClick={() => {
                  action.onSelect();
                  onOpenChange(false);
                }}
              >
                {action.label}
              </Action>
            ))}
          </Card>
          <Card>
            <Action type="button" $bold onClick={() => onOpenChange(false)}>
              Скасувати
            </Action>
          </Card>
        </Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
