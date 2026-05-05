import { useState } from "react";
import { useModal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { FUN_ROLES } from "./userConstants";
import { RoleLabel, FormLayout, ButtonRow } from "./styles";
import { useTranslation } from "react-i18next";

interface BaseFormProps {
  onSubmit: (data: any) => void;
  isLoading: boolean;
  initialData?: any;
}

export function UserForm({
  onSubmit,
  isLoading,
  initialData = {},
}: BaseFormProps) {
  const { t } = useTranslation();
  const { close } = useModal();
  const [name, setName] = useState(initialData.name || "");
  const [email, setEmail] = useState(initialData.email || "");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState(initialData.role_id || "member");

  const isEditSession = Boolean(initialData.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || (!isEditSession && !password)) return;

    onSubmit({ name, email, password, role_id: roleId });
    close();
  };

  // Динамічний переклад ролей на основі їх ID
  const translatedRoles = FUN_ROLES.map((role) => ({
    ...role,
    label: t(`userRoles.${role.id}_label`),
    desc: t(`userRoles.${role.id}_desc`),
  }));

  return (
    <FormLayout onSubmit={handleSubmit}>
      <div>
        <label>{t("settings:userForm.label_name")}</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("settings:userForm.placeholder_name")}
          required
        />
      </div>

      <div>
        <label>{t("settings:userForm.label_email")}</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@example.com"
          required
        />
      </div>

      <div>
        <label>
          {isEditSession
            ? t("settings:userForm.label_new_password")
            : t("settings:userForm.label_password")}
        </label>
        <Input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("settings:userForm.placeholder_password_default")}
          required={!isEditSession}
        />
      </div>

      <div>
        <label style={{ marginBottom: "0.5rem", display: "block" }}>
          {t("settings:userForm.label_role")}
        </label>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          {translatedRoles.map((role) => (
            <RoleLabel
              key={role.id}
              $isActive={roleId === role.id}
              $color={role.color}
            >
              <input
                type="radio"
                name="role"
                value={role.id}
                checked={roleId === role.id}
                onChange={() => setRoleId(role.id)}
                style={{ accentColor: role.color }}
              />
              <div style={{ color: role.color, fontSize: "1.2rem" }}>
                <role.icon />
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{role.label}</div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {role.desc}
                </div>
              </div>
            </RoleLabel>
          ))}
        </div>
      </div>

      <ButtonRow>
        <Button
          type="button"
          variation="secondary"
          onClick={close}
          style={{ width: "auto" }}
        >
          {t("settings:userForm.button_cancel")}
        </Button>
        <Button style={{ width: "auto" }} disabled={isLoading} type="submit">
          {isEditSession ? t("settings:userForm.button_save") : t("settings:userForm.button_add")}
        </Button>
      </ButtonRow>
    </FormLayout>
  );
}
