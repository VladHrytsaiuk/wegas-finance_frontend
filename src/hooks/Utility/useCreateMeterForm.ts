import { useState, useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { useUtilityMeters } from "./useUtility"; // Ваш існуючий хук
import {
  getCounterpartiesApi,
  getCpCategoriesApi,
} from "../../services/apiCounterparties";
import type { CreateAssetOnFlyInput, UtilityMeter } from "../../types";

type MeterFormValues = {
  name: string;
  type: string;
  unit: string;
  tariff: string;
  personal_account: string;
  counterparty_id: string;
};

interface UseCreateMeterFormProps {
  onCloseModal?: () => void;
  meterToEdit?: UtilityMeter;
}

export const useCreateMeterForm = ({
  onCloseModal,
  meterToEdit,
}: UseCreateMeterFormProps) => {
  const { t } = useTranslation();
  const { create, update } = useUtilityMeters();
  const isEdit = !!meterToEdit;

  // --- 1. LOCAL STATE FOR ASSETS ---
  const [assetIdOverride, setAssetIdOverride] = useState<string | null>(null);
  const [newAsset, setNewAssetState] = useState<CreateAssetOnFlyInput | null>(null);
  const assetId = assetIdOverride ?? meterToEdit?.asset_id ?? "";

  // --- 2. FORM SETUP ---
  const {
    register,
    handleSubmit,
    setValue,
    control,
    trigger,
    reset,
    formState: { isSubmitting, errors, isSubmitted },
  } = useForm<MeterFormValues>({
    defaultValues: {
      name: "",
      type: "electricity",
      unit: "kW",
      tariff: "",
      personal_account: "",
      counterparty_id: "",
    },
  });

  // Заповнення форми при редагуванні
  useEffect(() => {
    if (meterToEdit) {
      reset({
        name: meterToEdit.name,
        type: meterToEdit.type,
        unit: meterToEdit.unit,
        tariff: meterToEdit.tariff,
        personal_account: meterToEdit.personal_account || "",
        counterparty_id: meterToEdit.counterparty_id || "",
      });
    }
  }, [meterToEdit, reset]);

  // --- 3. DATA FETCHING ---
  const { data: categories = [] } = useQuery({
    queryKey: ["counterparty-categories"],
    queryFn: getCpCategoriesApi,
  });

  const { data: allCounterparties = [] } = useQuery({
    queryKey: ["counterparties"],
    queryFn: getCounterpartiesApi,
  });

  // ВАЖЛИВО: Ми повертаємо ВСІХ контрагентів, щоб не втратити жодну категорію.
  // rest (Інше) має містити повний список оригінальних категорій.
  const utilityProviders = allCounterparties;

  // Знаходимо ID категорії Комуналка для хойстінгу
  const priorityCategoryId = useMemo(() => {
    return categories.find((c) => c.name.toLowerCase().includes("комунал"))?.id;
  }, [categories]);

  // Список ID для автоматичного розкриття (ТІЛЬКИ сама категорія Комунальні послуги)
  const expandedIds = useMemo(() => {
    if (priorityCategoryId) {
      return [priorityCategoryId];
    }
    return [];
  }, [priorityCategoryId]);

  // --- 4. WATCHERS ---
  const currentType = useWatch({ control, name: "type" });
  const currentCP = useWatch({ control, name: "counterparty_id" });
  const formValues = useWatch({ control }); // Стежимо за всіма полями для isDirty

  // --- 5. 🔥 IS DIRTY CALCULATION ---
  const isDirty = useMemo(() => {
    // A) EDIT MODE
    if (meterToEdit) {
      return (
        formValues.name !== meterToEdit.name ||
        formValues.type !== meterToEdit.type ||
        String(formValues.tariff) !== String(meterToEdit.tariff) ||
        formValues.personal_account !== (meterToEdit.personal_account || "") ||
        formValues.counterparty_id !== (meterToEdit.counterparty_id || "") ||
        assetId !== (meterToEdit.asset_id || "") ||
        !!newAsset
      );
    }

    // B) CREATE MODE
    return (
      formValues.name !== "" ||
      formValues.tariff !== "" ||
      formValues.personal_account !== "" ||
      formValues.counterparty_id !== "" ||
      assetId !== "" ||
      !!newAsset
    );
  }, [formValues, assetId, newAsset, meterToEdit]);

  // --- 6. HANDLERS ---
  const handleSetAssetId = (id: string) => {
    setAssetIdOverride(id);
    setNewAssetState(null);
  };

  const handleSetNewAsset = (asset: CreateAssetOnFlyInput | null) => {
    setNewAssetState(asset);
    setAssetIdOverride("");
  };

  const onSubmit = (data: MeterFormValues) => {
    if (!currentCP) {
      toast.error(t("stats_utility:utility.toast_select_provider"));
      return;
    }

    const payload = {
      ...data,
      tariff: Number(data.tariff),
      currency: "UAH",
      asset_id: newAsset ? null : assetId || null,
      new_asset: newAsset || null,
      counterparty_id: currentCP,
    };

    const options = { onSuccess: () => onCloseModal?.() };

    if (isEdit) {
      update({ id: meterToEdit.id, data: payload }, options);
    } else {
      create(payload, options);
    }
  };

  return {
    form: {
      register,
      handleSubmit,
      setValue,
      trigger,
      errors,
      isSubmitting,
      isSubmitted,
      currentType,
      currentCP,
    },
    assets: {
      assetId,
      setAssetId: handleSetAssetId,
      newAsset,
      setNewAsset: handleSetNewAsset,
    },
    data: {
      utilityProviders,
      expandedIds,
      priorityCategoryId,
      isEdit,
    },
    actions: {
      onSubmit,
    },
    isDirty, // 🔥 Експорт статусу
  };
};
