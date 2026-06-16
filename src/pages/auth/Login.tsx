import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineEye, HiOutlineEyeSlash, HiFingerPrint } from "react-icons/hi2";

import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  AuthLayout,
  AuthForm,
  FormGroup,
} from "../../components/auth/AuthLayout";

import { useLogin } from "../../hooks/Auth/useLogin";
import { usePageTitle } from "../../hooks/usePageTitle";
import { usePasskeys } from "../../hooks/usePasskeys";
import { useAuth } from "../../context/AuthContext";

interface LoginProps {
  setToken: (token: string) => void;
}

function Login({ setToken }: LoginProps) {
  const { state, actions, t } = useLogin({ setToken });
  const navigate = useNavigate();
  const { unlock } = useAuth();
  
  usePageTitle(t("auth:auth.login_title", "Вхід"));
  const { email, password, isPending } = state;
  const { loginWithPasskey, loading: passkeyLoading, isSupported } = usePasskeys();

  // Додаємо стан для видимості пароля
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AuthLayout
      title={t("auth:auth.login_title")}
      subtitle={t("auth:auth.login_subtitle")}
      footer={
        <>
          {t("auth:auth.login_footer_text")}{" "}
          <Link
            to="/register"
            style={{ color: "var(--color-brand-600)", fontWeight: 500 }}
          >
            {t("auth:auth.login_footer_link")}
          </Link>
        </>
      }
    >
      <AuthForm onSubmit={actions.handleSubmit}>
        <FormGroup>
          <label htmlFor="email">{t("auth:auth.login_label_email")}</label>
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

        {isSupported && (
          <Button
            type="button"
            $variation="secondary"
            onClick={async () => {
              const success = await loginWithPasskey(email);
              if (success) {
                unlock();
                navigate("/dashboard", { replace: true });
              }
            }}
            disabled={isPending || passkeyLoading}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.8rem",
              marginTop: "-0.5rem",
              marginBottom: "1rem",
            }}
          >
            <HiFingerPrint size={20} />
            {passkeyLoading
              ? t("auth:auth.passkey_loading", "Зачекайте...")
              : t("auth:auth.login_with_passkey", "Увійти за допомогою FaceID / TouchID")}
          </Button>
        )}

        <FormGroup>
          <label htmlFor="password">{t("auth:auth.login_label_password")}</label>
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
          {isPending ? t("auth:auth.login_button_pending") : t("auth:auth.login_button")}
        </Button>
      </AuthForm>
    </AuthLayout>
  );
}

export default Login;
