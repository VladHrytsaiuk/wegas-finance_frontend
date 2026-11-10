import { useState, type FormEvent } from "react";

import { useRegister } from "../../../hooks/Auth/useRegister";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { AuthLink, AuthShell } from "./AuthShell";
import {
  FieldGroup,
  FieldHint,
  FieldRow,
  FormColumn,
  PasswordRow,
  SubmitButton,
} from "./AuthFields";
import { looksLikeEmail, MIN_PASSWORD } from "./validation";

// Реєстрація: ім'я, email, пароль і код запрошення (обов'язковий). Невірний код
// (403) і зайнятий email показує хук; формат email і довжину пароля перевіряємо
// одразу, щоб не показувати сире повідомлення валідатора бекенду.

export default function MobileRegister() {
  const { state, actions, t } = useRegister();
  usePageTitle(t("auth:auth.register_title", "Реєстрація"));
  const [tried, setTried] = useState(false);

  const { name, email, password, inviteCode, isPending } = state;
  const ready = [name, email, password, inviteCode].every(
    (v) => v.trim().length > 0,
  );
  const emailError = !looksLikeEmail(email) ? t("auth:auth.error_email") : "";
  const passwordError =
    password.length < MIN_PASSWORD ? t("auth:auth.error_password_short") : "";

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setTried(true);
    if (emailError || passwordError) return;
    actions.handleSubmit(event);
  };

  return (
    <AuthShell
      title={t("auth:auth.register_title")}
      subtitle={t("auth:auth.register_subtitle")}
      footer={
        <span>
          {t("auth:auth.register_footer_text")}{" "}
          <AuthLink to="/login">{t("auth:auth.register_footer_link")}</AuthLink>
        </span>
      }
    >
      <FormColumn onSubmit={submit} noValidate>
        <FieldGroup>
          <FieldRow
            id="name"
            name="name"
            label={t("auth:auth.register_label_name")}
            autoComplete="name"
            enterKeyHint="next"
            disabled={isPending}
            value={name}
            onChange={actions.setName}
          />
          <FieldRow
            id="email"
            name="email"
            label={t("auth:auth.register_label_email")}
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
            label={t("auth:auth.register_label_password")}
            autoComplete="new-password"
            enterKeyHint="next"
            disabled={isPending}
            value={password}
            onChange={actions.setPassword}
          />
          <FieldRow
            id="inviteCode"
            name="inviteCode"
            label={t("auth:auth.register_label_invite_code", "Код запрошення")}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
            disabled={isPending}
            value={inviteCode}
            onChange={actions.setInviteCode}
          />
        </FieldGroup>
        {tried && <FieldHint>{emailError || passwordError}</FieldHint>}

        <SubmitButton pending={isPending} disabled={!ready}>
          {t("auth:auth.register_button")}
        </SubmitButton>
      </FormColumn>
    </AuthShell>
  );
}
