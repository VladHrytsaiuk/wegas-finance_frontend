import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useModal } from "../../components/ui/Modal"; // Перевір шлях імпорту

interface UseCounterpartyCategoryFormProps {
  onSubmit: (data: any) => void;
  defaultValues?: any;
}

export const useCounterpartyCategoryForm = ({
  onSubmit,
  defaultValues = {},
}: UseCounterpartyCategoryFormProps) => {
  const { t } = useTranslation();
  const { close } = useModal();

  const form = useForm({
    defaultValues: {
      name: "",
      type: "shop",
      color: "#64748b",
      icon: "HiTag",
      ...defaultValues,
    },
  });

  const { watch, handleSubmit, setValue } = form;

  // Spies
  const type = watch("type");
  const color = watch("color");
  const icon = watch("icon");

  // Computed
  const title = defaultValues.id
    ? t("counterpartyCategoryForm.title_edit")
    : t("counterpartyCategoryForm.title_new");

  // Handlers
  const submitHandler = (data: any) => {
    onSubmit(data);
    close();
  };

  const handleTypeChange = (newType: string) => {
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
