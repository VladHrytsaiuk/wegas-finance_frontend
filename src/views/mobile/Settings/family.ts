import type { AxiosError } from "axios";

import { FUN_ROLES, getRoleConfig } from "../../../components/users/userConstants";

// Ролі родини й зрозумілі повідомлення про помилки бекенду.

export const ROLES = FUN_ROLES;

/** Стара роль «parent» має права адміна. */
export const roleOf = (roleId?: string) => getRoleConfig(roleId === "parent" ? "admin" : (roleId ?? "member"));

export const MIN_PASSWORD = 6;
export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const MESSAGES: [RegExp, string][] = [
  [/email already taken/i, "Цей email уже використовується"],
  [/last admin/i, "Це єдиний адмін родини. Спершу призначте іншого адміна."],
  [/invalid or expired code/i, "Код недійсний або застарів"],
  [/already in a family with other members/i, "Ви вже в родині з іншими учасниками. Спершу вийдіть із неї."],
  [/too many attempts/i, "Забагато спроб. Спробуйте пізніше."],
  [/permission denied/i, "Немає прав на цю дію"],
  [/invalid role/i, "Недійсна роль"],
  [/Field validation for 'Password'/i, `Пароль закороткий (мінімум ${MIN_PASSWORD} символів)`],
  [/Field validation for 'Email'/i, "Некоректний email"],
  [/old password/i, "Поточний пароль невірний"],
];

/** Текст помилки для користувача: відомі відповіді бекенду — українською. */
export function errorText(err: unknown, fallback: string): string {
  const raw = (err as AxiosError<{ error?: string }>)?.response?.data?.error;
  if (!raw) return fallback;
  return MESSAGES.find(([re]) => re.test(raw))?.[1] ?? fallback;
}
