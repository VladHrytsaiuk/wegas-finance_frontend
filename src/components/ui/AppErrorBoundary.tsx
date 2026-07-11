import React from "react";
import styled from "styled-components";
import { Button } from "./Button";

const ErrorShell = styled.div`
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--color-bg-page);
`;

const ErrorCard = styled.div`
  width: min(520px, 100%);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border: 1px solid var(--color-border);
  border-radius: 20px;
  background: var(--color-bg-surface);
  box-shadow: var(--shadow-lg);
`;

const ErrorTitle = styled.h2`
  font-size: 1.25rem;
  color: var(--color-text-main);
`;

const ErrorText = styled.p`
  color: var(--color-text-secondary);
  line-height: 1.6;
`;

const ActionsRow = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

type AppErrorBoundaryProps = {
  children: React.ReactNode;
  resetKey: string;
};

type AppErrorBoundaryState = {
  hasError: boolean;
};

class AppErrorBoundaryInner extends React.Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { hasError: false };

  private handleWindowError = () => {
    this.setState({ hasError: true });
    const bootstrapElement = document.getElementById("app-bootstrap");
    bootstrapElement?.classList.add("is-hidden");
    window.dispatchEvent(new Event("app:ready"));
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Application error boundary caught an error", error);
  }

  componentDidMount() {
    window.addEventListener("error", this.handleWindowError);
    window.addEventListener("unhandledrejection", this.handleWindowError);
  }

  componentDidUpdate(prevProps: AppErrorBoundaryProps) {
    if (
      this.state.hasError &&
      prevProps.resetKey !== this.props.resetKey
    ) {
      this.setState({ hasError: false });
    }
  }

  componentWillUnmount() {
    window.removeEventListener("error", this.handleWindowError);
    window.removeEventListener("unhandledrejection", this.handleWindowError);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <ErrorShell>
        <ErrorCard>
          <ErrorTitle>Сторінка зламалась, але застосунок ще працює</ErrorTitle>
          <ErrorText>
            Помилка на поточному екрані не повинна валити весь PWA. Можна
            повернутися назад, перейти на дашборд або перезавантажити цей екран.
          </ErrorText>
          <ActionsRow>
            <Button
              type="button"
              variation="secondary"
              onClick={() => window.history.back()}
            >
              Назад
            </Button>
            <Button
              type="button"
              variation="secondary"
              onClick={() => {
                window.location.href = "/dashboard";
              }}
            >
              На дашборд
            </Button>
            <Button
              type="button"
              onClick={() => window.location.reload()}
            >
              Перезавантажити
            </Button>
          </ActionsRow>
        </ErrorCard>
      </ErrorShell>
    );
  }
}

export function AppErrorBoundary({
  children,
  resetKey,
}: AppErrorBoundaryProps) {
  return (
    <AppErrorBoundaryInner resetKey={resetKey}>
      {children}
    </AppErrorBoundaryInner>
  );
}
