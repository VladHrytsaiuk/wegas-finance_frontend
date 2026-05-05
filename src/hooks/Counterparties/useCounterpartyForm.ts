import { useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { getCpCategoriesApi } from "../../services/apiCounterparties";
import { getLogoSrc } from "../../utils/imageUtils";
import { useModal } from "../../components/ui/Modal";

interface UseCounterpartyFormProps {
  onSubmit: (data: any) => void;
  defaultValues?: any;
}

export const useCounterpartyForm = ({
  onSubmit,
  defaultValues = {},
}: UseCounterpartyFormProps) => {
  const { t } = useTranslation();
  const { close } = useModal();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch Categories
  const { data: categories = [] } = useQuery({
    queryKey: ["counterparty-categories"],
    queryFn: getCpCategoriesApi,
    staleTime: 5 * 60 * 1000,
  });

  // 2. Form Setup
  const form = useForm({
    defaultValues: {
      name: "",
      type: "shop",
      note: "",
      color: "#6366f1",
      icon: "HiBuildingStorefront",
      logo: "",
      ...defaultValues,
      category_id:
        defaultValues?.category_id || defaultValues?.category?.id || "",
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
    return categories.filter((c: any) => c.type === selectedType);
  }, [categories, selectedType]);

  const logoPreviewSrc = getLogoSrc(currentLogo);
  const showLogoPreview = selectedType === "shop" && !!currentLogo;
  const isPerson = selectedType === "person";
  const showIconPicker = !isPerson && !showLogoPreview;

  const title = defaultValues?.id
    ? t("counterpartyForm.title_edit")
    : t("counterpartyForm.title_new");

  // 5. Handlers
  const handleTypeSelect = (newType: string) => {
    setValue("type", newType, { shouldDirty: true });
    setValue("category_id", "");

    if (newType !== "shop") {
      setValue("logo", "", { shouldDirty: true });
    }

    // Default Icons Logic
    if (newType === "person") {
      setValue("icon", "HiUser");
    } else if (newType === "shop") {
      setValue("icon", "HiBuildingStorefront");
    } else {
      setValue("icon", "HiGlobeAlt");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "image/svg+xml") {
      toast.error(t("counterpartyForm.error_svg_only", "Тільки SVG файли"));
      return;
    }
    if (file.size > 20 * 1024) {
      toast.error(t("counterpartyForm.error_size_limit", "Макс 20КБ"));
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

  const onFormSubmit = (data: any) => {
    const payload = { ...data, category_id: data.category_id || null };
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
