import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { NavBar } from "../../../mobile/ui/NavBar";
import { LargeTitle } from "../../../mobile/ui/Screen";

// Каркас вкладеного екрана налаштувань: «‹ Налаштування», великий заголовок, блоки.

const Page = styled.div.attrs<{ "data-m-screen"?: string }>({
  "data-m-screen": "",
})`
  min-height: 100%;
  background: var(--m-bg);
  color: var(--m-label);
  font-family: var(--m-font);
  -webkit-font-smoothing: antialiased;
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0 16px 32px;
`;

interface SettingsScreenProps {
  title: string;
  /** Куди веде «‹»; за замовчуванням — у корінь налаштувань. */
  backLabel?: string;
  backTo?: string;
  trailing?: ReactNode;
  children: ReactNode;
}

export function SettingsScreen({
  title,
  backLabel = "Налаштування",
  backTo = "/settings",
  trailing,
  children,
}: SettingsScreenProps) {
  const navigate = useNavigate();
  return (
    <Page>
      <NavBar backLabel={backLabel} onBack={() => navigate(backTo)} trailing={trailing} />
      <Body>
        <LargeTitle title={title} />
        {children}
      </Body>
    </Page>
  );
}
