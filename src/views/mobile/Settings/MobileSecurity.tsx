import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { HiOutlineKey } from "react-icons/hi2";

import { usePageTitle } from "../../../hooks/usePageTitle";
import { changePasswordApi } from "../../../services/apiUsers";
import { Footnote, RowInput } from "../../../mobile/ui/Field";
import { Group, Row, Section } from "../../../mobile/ui/Group";
import { PrimaryButton, Sheet } from "../../../mobile/ui/Sheet";
import { Tile } from "../../../mobile/ui/Tile";
import { MIN_PASSWORD, errorText } from "./family";
import { SettingsScreen } from "./SettingsScreen";

// Безпека: зміна пароля. ПІН і біометрія вимкнені (як і в старій сторінці).

function PasswordSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: changePasswordApi,
    onSuccess: () => {
      toast.success("Пароль змінено");
      setOldPassword("");
      setNewPassword("");
      setConfirm("");
      onOpenChange(false);
    },
    onError: (err) => toast.error(errorText(err, "Не вдалося змінити пароль")),
  });

  const submit = () => {
    if (newPassword !== confirm) return void toast.error("Паролі не збігаються");
    if (newPassword.length < MIN_PASSWORD) return void toast.error(`Пароль закороткий (мінімум ${MIN_PASSWORD} символів)`);
    mutate({ old_password: oldPassword, new_password: newPassword });
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Зміна пароля"
      footer={
        <PrimaryButton type="button" disabled={isPending || !oldPassword || !newPassword || !confirm} onClick={submit}>
          Змінити пароль
        </PrimaryButton>
      }
    >
      <Section>
        <Group>
          <Row
            title="Поточний"
            trailing={
              <RowInput
                type="password"
                aria-label="Поточний пароль"
                autoComplete="current-password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            }
          />
          <Row
            title="Новий"
            trailing={
              <RowInput
                type="password"
                aria-label="Новий пароль"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            }
          />
          <Row
            title="Ще раз"
            trailing={
              <RowInput
                type="password"
                aria-label="Повторіть новий пароль"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            }
          />
        </Group>
        <Footnote>Мінімум {MIN_PASSWORD} символів.</Footnote>
      </Section>
    </Sheet>
  );
}

export default function MobileSecurity() {
  usePageTitle("Безпека");
  const [open, setOpen] = useState(false);

  return (
    <SettingsScreen title="Безпека">
      <Group>
        <Row
          onClick={() => setOpen(true)}
          leading={<Tile icon={<HiOutlineKey size={18} />} tint="gray" size={30} />}
          title="Змінити пароль"
          inset={58}
          chevron
        />
      </Group>
      <PasswordSheet open={open} onOpenChange={setOpen} />
    </SettingsScreen>
  );
}
