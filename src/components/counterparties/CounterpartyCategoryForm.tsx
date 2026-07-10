import { HiShoppingCart, HiUser, HiGlobeAlt } from "react-icons/hi2";
import { useTranslation } from "react-i18next";

import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { ColorPicker, IconPicker } from "../ui/ColorIconPicker";

import * as S from "./CounterpartyCategoryForm.styles";
import { useCounterpartyCategoryForm } from "../../hooks/Counterparties/useCounterpartyCategoryForm";
import type { CounterpartyCategory } from "../../types";

type CounterpartyCategoryFormValues = Pick<
  CounterpartyCategory,
  "name" | "type" | "color" | "icon"
> & {
  id?: string;
};

interface Props {
  onSubmit: (data: CounterpartyCategoryFormValues) => void;
  defaultValues?: Partial<CounterpartyCategoryFormValues>;
  isLoading?: boolean;
}

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

      {/* 1. TYPE SELECTOR */}
      <S.FormRow>
        <S.Label>{t("counterparties:counterpartyCategoryForm.label_type")}</S.Label>
        <S.TypeGrid>
          {TYPE_OPTIONS.map(({ id, icon: Icon, labelKey }) => (
            <S.TypeCard
              key={id}
              type="button"
              $active={type === id}
              onClick={() => handleTypeChange(id)}
            >
              <Icon size={20} />
              <span>{t("counterparties:" + labelKey)}</span>
            </S.TypeCard>
          ))}
        </S.TypeGrid>
      </S.FormRow>

      {/* 2. NAME + ICON + COLOR (Compact Row) */}
      <S.CompactInputRow>
        <S.FieldGroup style={{ flex: 1 }}>
          <S.Label>{t("counterparties:counterpartyCategoryForm.label_name")}</S.Label>
          <Input
            {...register("name", { required: true })}
            placeholder={t("counterparties:counterpartyCategoryForm.placeholder_name")}
            autoFocus
            autoComplete="off"
          />
        </S.FieldGroup>

        <S.FieldGroup style={{ flex: "0 0 auto" }}>
          <S.Label>{t("goals_debts:goals.label_color")}</S.Label>
          <ColorPicker
            color={color}
            onColorChange={(c) => setValue("color", c, { shouldDirty: true })}
            square
          />
        </S.FieldGroup>

        <S.FieldGroup style={{ flex: "0 0 auto" }}>
          <S.Label>{t("goals_debts:goals.label_icon")}</S.Label>
          <IconPicker
            icon={icon}
            onIconChange={(i) => setValue("icon", i, { shouldDirty: true })}
            color={color}
            square
          />
        </S.FieldGroup>
      </S.CompactInputRow>

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
