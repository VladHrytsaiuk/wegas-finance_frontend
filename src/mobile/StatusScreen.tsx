import styled from "styled-components";

import { MobileTokens } from "./tokens";
import { AppMark } from "./ui/AppMark";
import { PrimaryButton } from "./ui/Sheet";

// Повноекранне повідомлення: «Система в режимі обслуговування», «Сторінку не знайдено».

const Page = styled.div.attrs<{ "data-m-screen"?: string }>({
  "data-m-screen": "",
})`
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: calc(env(safe-area-inset-top) + 24px) 24px
    calc(env(safe-area-inset-bottom) + 24px);
  box-sizing: border-box;
  text-align: center;
  background: var(--m-bg);
  color: var(--m-label);
  font-family: var(--m-font);
  -webkit-font-smoothing: antialiased;

  h1 {
    margin: 16px 0 0;
    font-size: 24px;
    line-height: 30px;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  p {
    margin: 0;
    max-width: 320px;
    font-size: 16px;
    line-height: 1.45;
    color: var(--m-label-2);
  }
`;

const Action = styled.div`
  width: 100%;
  max-width: 320px;
  margin-top: 20px;
`;

interface StatusScreenProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function StatusScreen({
  title,
  message,
  actionLabel,
  onAction,
}: StatusScreenProps) {
  return (
    <Page role="alert">
      <MobileTokens />
      <AppMark size={64} />
      <h1>{title}</h1>
      <p>{message}</p>
      {actionLabel && onAction && (
        <Action>
          <PrimaryButton type="button" onClick={onAction}>
            {actionLabel}
          </PrimaryButton>
        </Action>
      )}
    </Page>
  );
}
