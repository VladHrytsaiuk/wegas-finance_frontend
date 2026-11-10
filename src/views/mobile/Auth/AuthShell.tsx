import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineMoon, HiOutlineSun } from "react-icons/hi2";
import { Link } from "react-router-dom";
import styled from "styled-components";

import { useTheme } from "../../../context/ThemeContext";
import { MobileTokens } from "../../../mobile/tokens";
import { AppMark } from "../../../mobile/ui/AppMark";
import { FeedbackSheet } from "../../../mobile/FeedbackSheet";

// Каркас екранів входу, реєстрації та PIN: плитка застосунку, заголовок, форма,
// перемикачі мови й теми та «Підтримка / Баг». Прокручується сам контейнер, а
// не документ (глобальні стилі мобільної версії блокують прокрутку body).

const Page = styled.div.attrs<{ "data-m-screen"?: string }>({
  "data-m-screen": "",
})`
  position: relative;
  height: 100dvh;
  overflow-y: auto;
  overscroll-behavior-y: contain;
  display: flex;
  flex-direction: column;
  background: var(--m-bg);
  color: var(--m-label);
  font-family: var(--m-font);
  -webkit-font-smoothing: antialiased;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  padding: calc(env(safe-area-inset-top) + 12px) 16px 0;
`;

const Pill = styled.div`
  display: flex;
  padding: 2px;
  border-radius: 9px;
  background: var(--m-fill);
`;

const LangButton = styled.button<{ $active: boolean }>`
  min-width: 40px;
  height: 28px;
  padding: 0 10px;
  border: none;
  border-radius: 7px;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  color: ${(p) => (p.$active ? "var(--m-label)" : "var(--m-label-2)")};
  background: ${(p) => (p.$active ? "var(--m-segment-active)" : "transparent")};
  box-shadow: ${(p) => (p.$active ? "0 1px 3px rgba(0, 0, 0, 0.12)" : "none")};
`;

const RoundButton = styled.button`
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: var(--m-fill);
  color: var(--m-label-2);
  cursor: pointer;
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 28px;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 24px 16px 16px;
  box-sizing: border-box;
`;

const Hero = styled.header`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;

  h1 {
    margin: 12px 0 0;
    font-size: 28px;
    line-height: 34px;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  p {
    margin: 0;
    font-size: 15px;
    color: var(--m-label-2);
  }
`;

const Footer = styled.footer`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 8px 16px calc(env(safe-area-inset-bottom) + 20px);
  font-size: 15px;
  color: var(--m-label-2);
`;

export const AuthLinkButton = styled.button`
  padding: 6px 4px;
  border: none;
  background: none;
  font: inherit;
  font-size: 15px;
  color: var(--m-accent);
  cursor: pointer;
`;

/** Посилання в тексті під формою («Зареєструватися»). */
export const AuthLink = styled(Link)`
  padding: 6px 4px;
  font-size: 15px;
  font-weight: 600;
  color: var(--m-accent);
  text-decoration: none;
`;

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  /** Під формою: «Ще немає акаунту? Зареєструватися». */
  footer?: ReactNode;
}

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: AuthShellProps) {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [feedback, setFeedback] = useState(false);
  const isUk = i18n.language === "uk" || i18n.language === "ua";

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("i18nextLng", lang);
  };

  return (
    <Page>
      <MobileTokens />
      <TopBar>
        <Pill role="group" aria-label="Language">
          <LangButton
            type="button"
            $active={isUk}
            aria-pressed={isUk}
            onClick={() => changeLanguage("uk")}
          >
            UA
          </LangButton>
          <LangButton
            type="button"
            $active={i18n.language === "en"}
            aria-pressed={i18n.language === "en"}
            onClick={() => changeLanguage("en")}
          >
            EN
          </LangButton>
        </Pill>
        <RoundButton
          type="button"
          aria-label={t("common:themeSwitcher.theme_toggle_tip")}
          onClick={toggleTheme}
        >
          {theme === "light" ? (
            <HiOutlineMoon size={18} />
          ) : (
            <HiOutlineSun size={18} />
          )}
        </RoundButton>
      </TopBar>

      <Main>
        <Hero>
          <AppMark size={72} />
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </Hero>
        {children}
      </Main>

      <Footer>
        {footer}
        <AuthLinkButton type="button" onClick={() => setFeedback(true)}>
          {t("auth:auth.support_link")}
        </AuthLinkButton>
      </Footer>

      <FeedbackSheet open={feedback} onOpenChange={setFeedback} />
    </Page>
  );
}
