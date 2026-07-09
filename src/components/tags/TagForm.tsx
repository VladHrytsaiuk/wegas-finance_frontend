import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useModal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { ColorPicker } from "../ui/ColorIconPicker";
import * as S from "./TagForm.styles";

interface TagFormData {
  name: string;
  color: string;
}

interface TagFormSubmitOptions {
  onSuccess?: () => void;
}

// === COMPONENT ===
interface TagFormProps {
  onSubmit: (data: TagFormData, options?: TagFormSubmitOptions) => void;
  isLoading?: boolean;
}

export function TagForm({ onSubmit, isLoading }: TagFormProps) {
  const { t } = useTranslation();
  const { close } = useModal();
  const [name, setName] = useState("");
  const [color, setColor] = useState(S.PRESET_COLORS[5]); // Default green

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    onSubmit(
      { name, color },
      {
        onSuccess: () => {
          setName("");
          close();
        },
      }
    );
  };

  return (
    <S.Form onSubmit={handleSubmit}>
      <S.CompactRow>
        <S.FieldGroup style={{ flex: "0 0 auto" }}>
          <S.Label>{t("settings:tagForm.label_color")}</S.Label>
          <ColorPicker color={color} onColorChange={setColor} square />
        </S.FieldGroup>

        <S.FieldGroup style={{ flex: 1 }}>
          <S.Label>{t("settings:tagForm.label_name")}</S.Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("settings:tagForm.placeholder_name")}
            autoFocus
            required
          />
        </S.FieldGroup>
      </S.CompactRow>

      <S.ButtonRow>
        <Button
          type="button"
          variation="secondary"
          onClick={close}
          style={{ width: "auto" }}
        >
          {t("settings:tagForm.button_cancel")}
        </Button>
        <Button disabled={isLoading} style={{ width: "auto" }} type="submit">
          {t("settings:tagForm.button_add")}
        </Button>
      </S.ButtonRow>
    </S.Form>
  );
}
