import { useEffect, useState, ReactNode } from "react";
import styled from "styled-components";
import { HiChatBubbleLeftRight } from "react-icons/hi2";

import Logo from "../ui/Logo";
import { ThemeSwitcher } from "../ui/ThemeSwitcher";
import { LanguageSwitcher } from "../ui/LanguageSwitcher";
import FeedbackWidget from "../ui/FeedbackWidget";
import { useBootstrap } from "../../context/BootstrapContext";

// === Styled Components ===

const PageContainer = styled.div`
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  position: relative;
  background-color: var(--color-bg-subtle);

  @media (max-width: 480px) {
    padding: 0.5rem;
    align-items: flex-start;
    padding-top: 5rem;
  }
`;

// Правий верхній кут (Мова + Тема)
const TopActions = styled.div`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 10;

  @media (max-width: 480px) {
    top: 1rem;
    right: 1rem;
    gap: 0.5rem;
  }
`;

// Лівй нижній кут (Фідбек)
const BottomLeftAction = styled.div`
  position: absolute;
  bottom: 1.5rem;
  left: 1.5rem;
  z-index: 2001;
`;

const SupportButton = styled.button`
  background: var(--color-bg-surface);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  padding: 0.6rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s;

  &:hover {
    background-color: var(--color-bg-subtle);
    color: var(--color-brand-600);
    border-color: var(--color-brand-300);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
`;

const Card = styled.div`
  background-color: var(--color-bg-surface);
  width: 100%;
  max-width: 420px;
  padding: 3rem 2.5rem;
  border-radius: 16px;
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--color-border);

  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  z-index: 1;

  @media (max-width: 480px) {
    padding: 2rem 1.5rem;
    gap: 1rem;
    box-shadow: none;
    border: none;
    background-color: transparent;
  }

  @media (max-height: 700px) {
    padding: 1.5rem 1.5rem;
    gap: 0.75rem;
  }
`;

const Header = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-main);
  letter-spacing: -0.025em;
`;

const Subtitle = styled.p`
  color: var(--color-text-secondary);
  font-size: 0.95rem;
`;

const Footer = styled.div`
  text-align: center;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin-top: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);

  a {
    color: var(--color-brand-600);
    font-weight: 600;
    margin-left: 0.25rem;
    transition: color 0.2s;
    &:hover {
      color: var(--color-brand-700);
      text-decoration: underline;
    }
  }
`;

// === 🔥 REUSABLE FORM STYLES (Повернув ці експорти) ===

export const AuthForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  label {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--color-text-main);
  }
`;

// === Component ===

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const { setStage } = useBootstrap();

  useEffect(() => {
    let cancelled = false;

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (!cancelled) {
          setStage("hidden");
          window.dispatchEvent(new Event("app:ready"));
        }
      });
    });

    return () => {
      cancelled = true;
    };
  }, [setStage]);

  return (
    <PageContainer>
      {/* 1. Налаштування */}
      <TopActions>
        <LanguageSwitcher />
        <ThemeSwitcher />
      </TopActions>

      {/* 2. Фідбек */}
      <BottomLeftAction>
        {!isFeedbackOpen && (
          <SupportButton onClick={() => setIsFeedbackOpen(true)}>
            <HiChatBubbleLeftRight size={20} />
            <span>Підтримка / Баг</span>
          </SupportButton>
        )}

        {isFeedbackOpen && (
          <FeedbackWidget
            onClose={() => setIsFeedbackOpen(false)}
            isCollapsed={false}
          />
        )}
      </BottomLeftAction>

      {/* 3. Картка */}
      <Card>
        <Header>
          <Logo />
          <Title>{title}</Title>
          <Subtitle>{subtitle}</Subtitle>
        </Header>

        {children}

        {footer && <Footer>{footer}</Footer>}
      </Card>
    </PageContainer>
  );
}
