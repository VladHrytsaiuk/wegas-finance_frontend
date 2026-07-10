import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useModal } from "../../components/ui/Modal"; // Перевір шлях імпорту
import type { CounterpartyCategory, CounterpartyType } from "../../types";

type CounterpartyCategoryFormValues = Pick<
  CounterpartyCategory,
  "name" | "type" | "color" | "icon"
> & {
  id?: string;
};

interface UseCounterpartyCategoryFormProps {
  onSubmit: (data: CounterpartyCategoryFormValues) => void;
  defaultValues?: Partial<CounterpartyCategoryFormValues>;
}

export const useCounterpartyCategoryForm = ({
  onSubmit,
  defaultValues = {},
}: UseCounterpartyCategoryFormProps) => {
  const { t } = useTranslation();
  const { close } = useModal();

  const form = useForm<CounterpartyCategoryFormValues>({
    defaultValues: {
      name: "",
      type: "shop",
      color: "#64748b",
      icon: "HiTag",
      ...defaultValues,
    },
  });

  const { control, handleSubmit, setValue } = form;

  // Spies
  const type = useWatch({ control, name: "type" });
  const color = useWatch({ control, name: "color" });
  const icon = useWatch({ control, name: "icon" });

  // Computed
  const title = defaultValues.id
    ? t("counterparties:counterpartyCategoryForm.title_edit")
    : t("counterparties:counterpartyCategoryForm.title_new");

  // Handlers
  const submitHandler = (data: CounterpartyCategoryFormValues) => {
    onSubmit(data);
    close();
  };

  const handleTypeChange = (newType: CounterpartyType) => {
    setValue("type", newType, { shouldDirty: true });
  };

  return {
    form,
    values: {
      type,
      color,
      icon,
      title,
    },
    handlers: {
      submitHandler: handleSubmit(submitHandler),
      handleTypeChange,
      close,
    },
  };
};
