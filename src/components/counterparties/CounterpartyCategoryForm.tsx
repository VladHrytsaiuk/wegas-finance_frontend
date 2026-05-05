import { HiShoppingCart, HiUser, HiGlobeAlt } from "react-icons/hi2";
import { useTranslation } from "react-i18next";

import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { ColorIconPicker } from "../ui/ColorIconPicker";

import * as S from "./CounterpartyCategoryForm.styles"; // Імпорт стилів
import { useCounterpartyCategoryForm } from "../../hooks/Counterparties/useCounterpartyCategoryForm";

interface Props {
  onSubmit: (data: any) => void;
  defaultValues?: any;
  isLoading?: boolean;
}

// Конфігурація для рендеру карток типів
const TYPE_OPTIONS = [
  {
    id: "shop",
    icon: HiShoppingCart,
    labelKey: "counterpartyCategoryForm.type_shop",
  },
  {
    id: "person",
    icon: HiUser,
    labelKey: "counterpartyCategoryForm.type_person",
  },
  {
    id: "other",
    icon: HiGlobeAlt,
    labelKey: "counterpartyCategoryForm.type_other",
  },
] as const;

export function CounterpartyCategoryForm({
  onSubmit,
  defaultValues,
  isLoading,
}: Props) {
  const { t } = useTranslation();

  const {
    form: { register, setValue },
    values: { type, color, icon, title },
    handlers: { submitHandler, handleTypeChange, close },
  } = useCounterpartyCategoryForm({ onSubmit, defaultValues });

  return (
    <S.Form onSubmit={submitHandler}>
      <S.Title>{title}</S.Title>

      <S.FormRow>
        <S.Label>{t("counterparties:counterpartyCategoryForm.label_type")}</S.Label>
        <S.TypeGrid>
          {TYPE_OPTIONS.map(({ id, icon: Icon, labelKey }) => (
            <S.TypeCard
              key={id}
              type="button" // Важливо, щоб не сабмітило форму
              $active={type === id}
              onClick={() => handleTypeChange(id)}
            >
              <Icon size={20} />
              <span>{t(labelKey)}</span>
            </S.TypeCard>
          ))}
        </S.TypeGrid>
      </S.FormRow>

      <S.FormRow>
        <S.Label>{t("counterparties:counterpartyCategoryForm.label_appearance")}</S.Label>
        <ColorIconPicker
          color={color}
          icon={icon}
          onColorChange={(c) => setValue("color", c, { shouldDirty: true })}
          onIconChange={(i) => setValue("icon", i, { shouldDirty: true })}
        />
      </S.FormRow>

      <S.FormRow>
        <S.Label>{t("counterparties:counterpartyCategoryForm.label_name")}</S.Label>
        <Input
          {...register("name", { required: true })}
          placeholder={t("counterparties:counterpartyCategoryForm.placeholder_name")}
          autoFocus
          autoComplete="off"
        />
      </S.FormRow>

      <S.Footer>
        <Button
          variation="secondary"
          type="button"
          onClick={close}
          disabled={isLoading}
        >
          {t("counterparties:counterpartyCategoryForm.button_cancel")}
        </Button>
        <Button disabled={isLoading} type="submit">
          {t("counterparties:counterpartyCategoryForm.button_save")}
        </Button>
      </S.Footer>
    </S.Form>
  );
}
