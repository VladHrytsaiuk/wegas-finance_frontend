import { useState, type InputHTMLAttributes } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineEye, HiOutlineEyeSlash } from "react-icons/hi2";
import styled from "styled-components";

import { ActivityIndicator } from "../../../mobile/ui/Loader";
import { Group, Row } from "../../../mobile/ui/Group";
import { PrimaryButton } from "../../../mobile/ui/Sheet";

// Поля форм входу: згрупований список iOS, у кожному рядку лише поле зі
// підказкою (підпис — у aria-label). Шрифт 17px: менший iOS збільшує сторінку.

const Input = styled.input`
  flex: 1;
  width: 100%;
  min-width: 0;
  height: 36px;
  border: none;
  background: none;
  outline: none;
  font: inherit;
  font-size: 17px;
  color: var(--m-label);

  &::placeholder {
    color: var(--m-label-3);
  }

  &:disabled {
    color: var(--m-label-2);
  }
`;

const EyeButton = styled.button`
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  margin-right: -6px;
  border: none;
  background: none;
  color: var(--m-label-2);
  cursor: pointer;
`;

const Hint = styled.p`
  margin: -16px 4px 0;
  font-size: 13px;
  line-height: 1.35;
  color: #ff3b30;
`;

type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

/** Рядок із текстовим полем. */
export function FieldRow({ label, value, onChange, ...rest }: FieldProps) {
  return (
    <Row
      title={
        <Input
          aria-label={label}
          placeholder={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          {...rest}
        />
      }
    />
  );
}

/** Рядок пароля з кнопкою «показати / сховати». */
export function PasswordRow({ label, value, onChange, ...rest }: FieldProps) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  return (
    <Row
      title={
        <Input
          aria-label={label}
          placeholder={label}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          {...rest}
        />
      }
      trailing={
        <EyeButton
          type="button"
          aria-label={
            visible
              ? t("auth:auth.hide_password")
              : t("auth:auth.show_password")
          }
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? (
            <HiOutlineEyeSlash size={20} />
          ) : (
            <HiOutlineEye size={20} />
          )}
        </EyeButton>
      }
    />
  );
}

export const FieldGroup = Group;

/** Підказка під групою; порожній текст — нічого не малюємо. */
export function FieldHint({ children }: { children?: string }) {
  return children ? <Hint role="alert">{children}</Hint> : null;
}

/** Основна кнопка форми: під час запиту — індикатор замість підпису. */
export function SubmitButton({
  pending,
  disabled,
  children,
}: {
  pending: boolean;
  disabled?: boolean;
  children: string;
}) {
  return (
    <PrimaryButton
      type="submit"
      disabled={disabled || pending}
      aria-busy={pending}
    >
      {pending ? (
        <ActivityIndicator
          size={22}
          color="var(--m-on-accent)"
          label={children}
        />
      ) : (
        children
      )}
    </PrimaryButton>
  );
}

export const FormColumn = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;
