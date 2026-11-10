import { useNavigate } from "react-router-dom";

import { useLogin } from "../../../hooks/Auth/useLogin";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { AuthLink, AuthLinkButton, AuthShell } from "./AuthShell";
import {
  FieldGroup,
  FieldRow,
  FormColumn,
  PasswordRow,
  SubmitButton,
} from "./AuthFields";

// Вхід: email і пароль (passkey вимкнено — у PWA працював з багами). Посилання
// на PIN з'являється лише якщо раніше вже було налаштовано PIN, як і на старому екрані.

interface MobileLoginProps {
  setToken: (token: string) => void;
}

export default function MobileLogin({ setToken }: MobileLoginProps) {
  const { state, actions, t } = useLogin({ setToken });
  const navigate = useNavigate();
  usePageTitle(t("auth:auth.login_title", "Вхід"));

  const { email, password, isPending } = state;
  const hasPin = localStorage.getItem("has_pin") === "true";
  const ready = email.trim().length > 0 && password.length > 0;

  return (
    <AuthShell
      title={t("auth:auth.login_title")}
      subtitle={t("auth:auth.login_subtitle")}
      footer={
        <span>
          {t("auth:auth.login_footer_text")}{" "}
          <AuthLink to="/register">{t("auth:auth.login_footer_link")}</AuthLink>
        </span>
      }
    >
      <FormColumn onSubmit={actions.handleSubmit} noValidate>
        <FieldGroup>
          <FieldRow
            id="email"
            name="email"
            label={t("auth:auth.login_label_email")}
            type="email"
            inputMode="email"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="next"
            disabled={isPending}
            value={email}
            onChange={actions.setEmail}
          />
          <PasswordRow
            id="password"
            name="password"
            label={t("auth:auth.login_label_password")}
            autoComplete="current-password"
            enterKeyHint="go"
            disabled={isPending}
            value={password}
            onChange={actions.setPassword}
          />
        </FieldGroup>

        <SubmitButton pending={isPending} disabled={!ready}>
          {t("auth:auth.login_button")}
        </SubmitButton>

        {hasPin && (
          <AuthLinkButton
            type="button"
            onClick={() => navigate("/pin-login")}
            disabled={isPending}
          >
            {t("auth:auth.back_to_pin", "Повернутися до ПІН-коду")}
          </AuthLinkButton>
        )}
      </FormColumn>
    </AuthShell>
  );
}
