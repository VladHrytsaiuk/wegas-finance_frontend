import { useState } from "react";
import { HiCheck } from "react-icons/hi2";
import { useTranslation } from "react-i18next"; // ⬅️ ІМПОРТ ДЛЯ ПЕРЕКЛАДУ

import { useModal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import {
  PRESET_COLORS,
  Form,
  ColorGrid,
  ColorSwatch,
  ButtonRow,
} from "./TagForm.styles";

// === COMPONENT ===
interface TagFormProps {
  onSubmit: (data: any, options?: any) => void;
  isLoading?: boolean;
}

export function TagForm({ onSubmit, isLoading }: TagFormProps) {
  const { t } = useTranslation(); // ⬅️ ВИКОРИСТАННЯ ХУКА
  const { close } = useModal();
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[5]); // Default green

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
    <Form onSubmit={handleSubmit}>
      <div>
        <label
          style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}
        >
          {/* ➡️ ПЕРЕКЛАД МІТКИ */}
          {t("settings:tagForm.label_name")}
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          // ➡️ ПЕРЕКЛАД ПЛЕЙСХОЛДЕРА
          placeholder={t("settings:tagForm.placeholder_name")}
          autoFocus
        />
      </div>

      <div>
        <label
          style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}
        >
          {/* ➡️ ПЕРЕКЛАД МІТКИ */}
          {t("settings:tagForm.label_color")}
        </label>
        <ColorGrid>
          {PRESET_COLORS.map((c) => (
            <ColorSwatch
              key={c}
              type="button"
              $color={c}
              $isSelected={color === c}
              onClick={() => setColor(c)}
            >
              {color === c && <HiCheck style={{ strokeWidth: 2 }} />}
            </ColorSwatch>
          ))}
        </ColorGrid>
      </div>

      <ButtonRow>
        <Button
          type="button"
          variation="secondary"
          onClick={close}
          style={{ width: "auto" }}
        >
          {/* ➡️ ПЕРЕКЛАД КНОПКИ */}
          {t("settings:tagForm.button_cancel")}
        </Button>
        <Button disabled={isLoading} style={{ width: "auto" }} type="submit">
          {/* ➡️ ПЕРЕКЛАД КНОПКИ */}
          {t("settings:tagForm.button_add")}
        </Button>
      </ButtonRow>
    </Form>
  );
}
