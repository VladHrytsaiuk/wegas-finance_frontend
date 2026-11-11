import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { HiCheck } from "react-icons/hi2";

import { addUserApi, deleteUserApi, updateUserApi, type UserProfile } from "../../../services/apiUsers";
import { ConfirmSheet } from "../../../mobile/ui/ConfirmSheet";
import { Footnote, RowInput } from "../../../mobile/ui/Field";
import { Group, Meta, Row, Section } from "../../../mobile/ui/Group";
import { PrimaryButton, Sheet } from "../../../mobile/ui/Sheet";
import { MIN_PASSWORD, ROLES, errorText, isEmail } from "./family";

// Учасник родини: додати вручну або змінити (імʼя, email, новий пароль, роль) / вилучити.

interface MemberSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Без учасника — додаємо нового. */
  member?: UserProfile;
  isSelf?: boolean;
}

export function MemberSheet({ open, onOpenChange, member, isSelf }: MemberSheetProps) {
  const queryClient = useQueryClient();
  const editing = !!member;
  const [name, setName] = useState(member?.name ?? "");
  const [email, setEmail] = useState(member?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(member?.role_id === "parent" ? "admin" : (member?.role_id ?? "member"));
  const [confirmRemove, setConfirmRemove] = useState(false);

  const done = (message: string) => {
    toast.success(message);
    queryClient.invalidateQueries({ queryKey: ["users"] });
    queryClient.invalidateQueries({ queryKey: ["me"] });
    onOpenChange(false);
  };

  const save = useMutation({
    mutationFn: () =>
      editing
        ? updateUserApi({ id: member!.id, name: name.trim(), email: email.trim(), role_id: role, ...(password ? { password } : {}) })
        : addUserApi({ name: name.trim(), email: email.trim(), password, role_id: role }),
    onSuccess: () => done(editing ? "Дані оновлено" : "Учасника додано"),
    onError: (err) => toast.error(errorText(err, editing ? "Не вдалося оновити" : "Не вдалося додати")),
  });

  const remove = useMutation({
    mutationFn: () => deleteUserApi(member!.id),
    onSuccess: () => done("Учасника вилучено з родини"),
    onError: (err) => toast.error(errorText(err, "Не вдалося вилучити")),
  });

  const passwordOk = editing ? password === "" || password.length >= MIN_PASSWORD : password.length >= MIN_PASSWORD;
  const valid = name.trim() !== "" && isEmail(email) && passwordOk;

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Учасник" : "Новий учасник"}
      footer={
        <PrimaryButton type="button" disabled={!valid || save.isPending} onClick={() => save.mutate()}>
          {editing ? "Зберегти" : "Додати"}
        </PrimaryButton>
      }
    >
      <Section>
        <Group>
          <Row
            title="Ім'я"
            trailing={<RowInput aria-label="Ім'я учасника" value={name} onChange={(e) => setName(e.target.value)} />}
          />
          <Row
            title="Email"
            trailing={
              <RowInput
                aria-label="Email учасника"
                type="email"
                inputMode="email"
                autoCapitalize="none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            }
          />
          <Row
            title={editing ? "Новий пароль" : "Пароль"}
            trailing={
              <RowInput
                aria-label={editing ? "Новий пароль учасника" : "Пароль учасника"}
                type="text"
                autoCapitalize="none"
                autoComplete="off"
                placeholder={editing ? "не змінювати" : ""}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            }
          />
        </Group>
        <Footnote>
          {editing
            ? `Залиште порожнім, щоб не змінювати пароль. Якщо задати новий — мінімум ${MIN_PASSWORD} символів; учасник увійде знову.`
            : `Мінімум ${MIN_PASSWORD} символів. Передайте пароль учаснику — він зможе змінити його в налаштуваннях.`}
        </Footnote>
      </Section>

      <Section caption="Роль">
        <Group>
          {ROLES.map((r) => (
            <Row
              key={r.id}
              onClick={() => setRole(r.id)}
              title={r.label}
              subtitle={r.desc}
              trailing={role === r.id ? <HiCheck size={20} color="var(--m-accent)" aria-label="Обрано" /> : undefined}
            />
          ))}
        </Group>
      </Section>

      {editing && !isSelf && (
        <Section>
          <Group>
            <Row
              onClick={() => setConfirmRemove(true)}
              title={<span style={{ color: "#ff3b30" }}>Вилучити з родини</span>}
              trailing={remove.isPending ? <Meta>…</Meta> : undefined}
            />
          </Group>
          <Footnote>
            Акаунт лишається, але переходить в окрему особисту родину й більше не бачить спільних даних.
          </Footnote>
        </Section>
      )}

      <ConfirmSheet
        open={confirmRemove}
        onOpenChange={setConfirmRemove}
        message={`Вилучити ${member?.name ?? "учасника"} з родини?`}
        actions={[{ label: "Вилучити", destructive: true, onSelect: () => remove.mutate() }]}
      />
    </Sheet>
  );
}
