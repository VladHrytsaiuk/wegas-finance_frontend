import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { getCpCategoriesApi } from "../../services/apiCounterparties";
import { getLogoSrc } from "../../utils/imageUtils";
import { useModal } from "../../components/ui/Modal";
import type { Counterparty, CounterpartyCategory } from "../../types";

type CounterpartyFormValues = {
  name: string;
  type: string;
  color: string;
  icon: string;
  logo: string;
  category_id: string;
};

export type CounterpartyFormDefaults = Partial<Counterparty> & {
  category?: Partial<CounterpartyCategory>;
};

interface UseCounterpartyFormProps {
  onSubmit: (data: CounterpartyFormDefaults) => void;
  defaultValues?: CounterpartyFormDefaults;
}

export const useCounterpartyForm = ({
  onSubmit,
  defaultValues = {},
}: UseCounterpartyFormProps) => {
  const { t } = useTranslation();
  const { close } = useModal();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch Categories
  const { data: categories = [] } = useQuery<CounterpartyCategory[]>({
    queryKey: ["counterparty-categories"],
    queryFn: getCpCategoriesApi,
    staleTime: 5 * 60 * 1000,
  });

  const initialCategoryId = defaultValues?.category_id || defaultValues?.category?.id || "";

  // Стан для запам'ятовування вибраних категорій для кожного типу
  const [categoryHistory, setCategoryHistory] = useState<Record<string, string>>({
    [defaultValues?.type || "shop"]: initialCategoryId,
  });

  // 2. Form Setup
  const form = useForm<CounterpartyFormValues>({
    defaultValues: {
      name: "",
      type: "shop",
      color: "#6366f1",
      icon: "HiBuildingStorefront",
      logo: "",
      ...defaultValues,
      category_id: initialCategoryId,
    },
  });

  const { watch, setValue, handleSubmit } = form;

  // 3. Watched Values
  const selectedType = watch("type");
  const currentLogo = watch("logo");
  const currentCategoryId = watch("category_id");
  const currentColor = watch("color");
  const currentIcon = watch("icon");

  // 4. Computed Logic
  const availableCategories = useMemo(() => {
    return categories.filter((category: CounterpartyCategory) => category.type === selectedType);
  }, [categories, selectedType]);

  const logoPreviewSrc = getLogoSrc(currentLogo);
  // 🔥 Додаємо 'other' до списку тих, хто підтримує лого
  const showLogoPreview = (selectedType === "shop" || selectedType === "other") && !!currentLogo;
  const isPerson = selectedType === "person";
  const showIconPicker = !isPerson && !showLogoPreview;

  const title = defaultValues?.id
    ? t("counterparties:counterpartyForm.title_edit")
    : t("counterparties:counterpartyForm.title_new");

  // 5. Handlers
  const handleTypeSelect = (newType: string) => {
    if (newType === selectedType) return;
    
    // Зберігаємо поточну категорію перед перемиканням
    setCategoryHistory(prev => ({
      ...prev,
      [selectedType]: currentCategoryId
    }));

    setValue("type", newType, { shouldDirty: true });
    
    // Відновлюємо категорію для нового типу, якщо вона була раніше вибрана
    const restoredCategory = categoryHistory[newType] || "";
    setValue("category_id", restoredCategory);

    // Встановлюємо дефолтну іконку ТІЛЬКИ якщо це створення нового (немає defaultValues.id)
    if (!defaultValues?.id) {
      if (newType === "person") {
        setValue("icon", "HiUser", { shouldDirty: true });
      } else if (newType === "shop") {
        setValue("icon", "HiBuildingStorefront", { shouldDirty: true });
      } else {
        setValue("icon", "HiGlobeAlt", { shouldDirty: true });
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "image/svg+xml") {
      toast.error(
        t("counterparties:counterpartyForm.error_svg_only", "Тільки SVG файли"),
      );
      return;
    }
    if (file.size > 20 * 1024) {
      toast.error(
        t("counterparties:counterpartyForm.error_size_limit", "Макс 20КБ"),
      );
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setValue("logo", base64String, { shouldDirty: true });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setValue("logo", "", { shouldDirty: true });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onFormSubmit = (data: CounterpartyFormValues) => {
    // 🔥 Очищення даних перед відправкою (якщо це людина, лого нам не треба)
    const payload: CounterpartyFormDefaults = {
      ...data,
      category_id: data.category_id || null,
      logo: data.type === "shop" || data.type === "other" ? data.logo : "",
    };
    onSubmit(payload);
    close();
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return {
    form,
    refs: {
      fileInputRef,
    },
    values: {
      selectedType,
      currentCategoryId,
      currentColor,
      currentIcon,
      logoPreviewSrc,
      title,
    },
    uiState: {
      isPerson,
      showLogoPreview,
      showIconPicker,
      availableCategories,
    },
    handlers: {
      handleTypeSelect,
      handleFileSelect,
      handleRemoveLogo,
      submitHandler: handleSubmit(onFormSubmit),
      triggerFileUpload,
      onClose: close,
    },
  };
};
