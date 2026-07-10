import { useState } from "react";
import { useModal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { FUN_ROLES } from "./userConstants";
import * as S from "./styles";
import { useTranslation } from "react-i18next";
import type { CreateUserData, UserProfile } from "../../services/apiUsers";

interface BaseFormProps {
  onSubmit: (data: CreateUserData) => void;
  isLoading: boolean;
  initialData?: Partial<UserProfile>;
  onCloseModal?: () => void; // Provided by Modal.Window cloneElement
}

type ErrorType = "required" | "invalid_email" | null;

export function UserForm({
  onSubmit,
  isLoading,
  initialData = {},
  onCloseModal,
}: BaseFormProps) {
  // Loading namespaces explicitly
  const { t } = useTranslation(["common", "settings"]);
  const { close } = useModal();
  const [name, setName] = useState(initialData.name || "");
  const [email, setEmail] = useState(initialData.email || "");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState(initialData.role_id || "member");
  const [errors, setErrors] = useState<{ [key: string]: ErrorType }>({
    name: null,
    email: null,
    password: null,
  });

  const isEditSession = Boolean(initialData.id);

  // Use the local onCloseModal if provided by Modal.Window, otherwise use context close
  const closeSelf = onCloseModal || close;

  const validate = () => {
    const newErrors: { [key: string]: ErrorType } = {
      name: null,
      email: null,
      password: null,
    };

    if (!name.trim()) newErrors.name = "required";

    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      newErrors.email = "required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailTrimmed)) {
        newErrors.email = "invalid_email";
      }
    }

    if (!isEditSession && !password) {
      newErrors.password = "required";
    }
    
    setErrors(newErrors);
    return !newErrors.name && !newErrors.email && !newErrors.password;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({ name, email: email.trim(), password, role_id: roleId });
    closeSelf();
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    closeSelf();
  };

  // Динамічний переклад ролей на основі їх ID
  const translatedRoles = FUN_ROLES.map((role) => ({
    ...role,
    label: t(`settings:userRoles.${role.id}_label`),
    desc: t(`settings:userRoles.${role.id}_desc`),
  }));

  return (
    <S.FormLayout onSubmit={handleSubmit}>
      {/* Column 1: Basic Info */}
      <S.Column>
        <S.FieldGroup>
          <S.Label>
            {t("settings:userForm.label_name")}
            {errors.name === "required" && (
              <span style={{ color: "var(--color-red-600)", fontSize: "0.7rem", marginLeft: "0.5rem" }}>
                — {t("common:validation.required")}
              </span>
            )}
          </S.Label>
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors(prev => ({ ...prev, name: null }));
            }}
            placeholder={t("settings:userForm.placeholder_name")}
            $hasError={!!errors.name}
          />
        </S.FieldGroup>

        <S.FieldGroup>
          <S.Label>
            {t("settings:userForm.label_email")}
            {errors.email === "required" && (
              <span style={{ color: "var(--color-red-600)", fontSize: "0.7rem", marginLeft: "0.5rem" }}>
                — {t("common:validation.required")}
              </span>
            )}
            {errors.email === "invalid_email" && (
              <span style={{ color: "var(--color-red-600)", fontSize: "0.7rem", marginLeft: "0.5rem" }}>
                — {t("common:validation.invalid_email")}
              </span>
            )}
          </S.Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors(prev => ({ ...prev, email: null }));
            }}
            placeholder="user@example.com"
            $hasError={!!errors.email}
          />
        </S.FieldGroup>

        <S.FieldGroup>
          <S.Label>
            {isEditSession
              ? t("settings:userForm.label_new_password")
              : t("settings:userForm.label_password")}
            {!isEditSession && errors.password === "required" && (
              <span style={{ color: "var(--color-red-600)", fontSize: "0.7rem", marginLeft: "0.5rem" }}>
                — {t("common:validation.required")}
              </span>
            )}
          </S.Label>
          <Input
            type="text"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors(prev => ({ ...prev, password: null }));
            }}
            placeholder={t("settings:userForm.placeholder_password_default")}
            $hasError={!!errors.password}
          />
        </S.FieldGroup>
      </S.Column>

      {/* Column 2: Role Selection */}
      <S.Column>
        <S.FieldGroup>
          <S.Label>{t("settings:userForm.label_role")}</S.Label>
          <S.RoleSelectionGroup>
            {translatedRoles.map((role) => (
              <S.RoleLabel
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
                <div style={{ color: role.color, fontSize: "1.2rem", display: "flex" }}>
                  <role.icon />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{role.label}</div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {role.desc}
                  </div>
                </div>
              </S.RoleLabel>
            ))}
          </S.RoleSelectionGroup>
        </S.FieldGroup>
      </S.Column>
      <S.ButtonRow>
        <Button
          type="button"
          variation="secondary"
          onClick={handleCancel}
          style={{ width: "auto" }}
        >
          {t("settings:userForm.button_cancel")}
        </Button>
        <Button 
          style={{ width: "auto" }} 
          disabled={isLoading} 
          type="submit"
        >
          {isEditSession ? t("settings:userForm.button_save") : t("settings:userForm.button_add")}
        </Button>
      </S.ButtonRow>
    </S.FormLayout>
  );
}
