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

import { useRegister } from "../../hooks/Auth/useRegister";

function Register() {
  const { state, actions, t } = useRegister();
  const { name, email, password, inviteCode, isPending } = state;

  // Додаємо стан для видимості пароля
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AuthLayout
      title={t("auth.register_title")}
      subtitle={t("auth.register_subtitle")}
      footer={
        <>
          {t("auth.register_footer_text")}{" "}
          <Link
            to="/login"
            style={{ color: "var(--color-brand-600)", fontWeight: 500 }}
          >
            {t("auth.register_footer_link")}
          </Link>
        </>
      }
    >
      <AuthForm onSubmit={actions.handleSubmit}>
        <FormGroup>
          <label htmlFor="name">{t("auth.register_label_name")}</label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => actions.setName(e.target.value)}
            disabled={isPending}
            placeholder={t("auth.placeholder_name", "Влад")}
          />
        </FormGroup>

        <FormGroup>
          <label htmlFor="email">{t("auth.register_label_email")}</label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => actions.setEmail(e.target.value)}
            disabled={isPending}
            placeholder="name@example.com"
          />
        </FormGroup>

        <FormGroup>
          <label htmlFor="password">{t("auth.register_label_password")}</label>
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
              placeholder="••••••••"
              style={{ paddingRight: "2.8rem", width: "100%" }} // Робимо відступ для іконки
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
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

        <FormGroup>
          <label htmlFor="inviteCode">
            {t("auth.register_label_invite_code", "Код запрошення")}
          </label>
          <Input
            id="inviteCode"
            type="text"
            value={inviteCode}
            onChange={(e) => actions.setInviteCode(e.target.value)}
            disabled={isPending}
            placeholder="SECRET-CODE-2026"
            autoComplete="off"
          />
        </FormGroup>

        <Button type="submit" $size="large" disabled={isPending}>
          {isPending
            ? t("auth.register_button_pending")
            : t("auth.register_button")}
        </Button>
      </AuthForm>
    </AuthLayout>
  );
}

export default Register;
