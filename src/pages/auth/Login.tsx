import { useState } from "react";
import { Link } from "react-router-dom";
import { HiOutlineEye, HiOutlineEyeSlash } from "react-icons/hi2";

import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  AuthLayout,
  AuthForm,
  FormGroup,
} from "../../components/auth/AuthLayout";

import { useLogin } from "../../hooks/Auth/useLogin";

interface LoginProps {
  setToken: (token: string) => void;
}

function Login({ setToken }: LoginProps) {
  const { state, actions, t } = useLogin({ setToken });
  const { email, password, isPending } = state;

  // Додаємо стан для видимості пароля
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AuthLayout
      title={t("auth.login_title")}
      subtitle={t("auth.login_subtitle")}
      footer={
        <>
          {t("auth.login_footer_text")}{" "}
          <Link
            to="/register"
            style={{ color: "var(--color-brand-600)", fontWeight: 500 }}
          >
            {t("auth.login_footer_link")}
          </Link>
        </>
      }
    >
      <AuthForm onSubmit={actions.handleSubmit}>
        <FormGroup>
          <label htmlFor="email">{t("auth.login_label_email")}</label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => actions.setEmail(e.target.value)}
            disabled={isPending}
            autoComplete="email"
            placeholder="name@example.com"
          />
        </FormGroup>

        <FormGroup>
          <label htmlFor="password">{t("auth.login_label_password")}</label>
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => actions.setPassword(e.target.value)}
              disabled={isPending}
              autoComplete="current-password"
              placeholder="••••••••"
              style={{ paddingRight: "2.8rem", width: "100%" }} // Робимо відступ для іконки
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1} // Щоб не заважало навігації клавішею Tab
              style={{
                position: "absolute",
                right: "0.8rem",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                color: "var(--color-text-secondary)",
                padding: "0.2rem",
              }}
            >
              {showPassword ? (
                <HiOutlineEyeSlash size={20} />
              ) : (
                <HiOutlineEye size={20} />
              )}
            </button>
          </div>
        </FormGroup>

        <Button type="submit" $size="large" disabled={isPending}>
          {isPending ? t("auth.login_button_pending") : t("auth.login_button")}
        </Button>
      </AuthForm>
    </AuthLayout>
  );
}

export default Login;
