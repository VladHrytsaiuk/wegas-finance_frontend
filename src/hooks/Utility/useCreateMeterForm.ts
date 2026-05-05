import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import { useUtilityMeters } from "./useUtility"; // Ваш існуючий хук
import { getCounterpartiesApi } from "../../services/apiCounterparties";

interface UseCreateMeterFormProps {
  onCloseModal?: () => void;
  meterToEdit?: any;
}

export const useCreateMeterForm = ({
  onCloseModal,
  meterToEdit,
}: UseCreateMeterFormProps) => {
  const { create, update } = useUtilityMeters();
  const isEdit = !!meterToEdit;

  // --- 1. LOCAL STATE FOR ASSETS ---
  const [assetId, setAssetId] = useState(meterToEdit?.asset_id || "");
  const [newAsset, setNewAssetState] = useState<any>(null);

  // --- 2. FORM SETUP ---
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isSubmitting },
  } = useForm({
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
      setAssetId(meterToEdit.asset_id || "");
    }
  }, [meterToEdit, reset]);

  // --- 3. DATA FETCHING ---
  const { data: allCounterparties = [] } = useQuery({
    queryKey: ["counterparties"],
    queryFn: getCounterpartiesApi,
  });

  const utilityProviders = allCounterparties.filter((cp: any) => {
    const catName = cp.category?.name || "";
    return catName.includes("Комунальн") || catName === "Інтернет";
  });

  // --- 4. WATCHERS ---
  const currentType = watch("type");
  const currentCP = watch("counterparty_id");
  const formValues = watch(); // Стежимо за всіма полями для isDirty

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
    setAssetId(id);
    setNewAssetState(null);
  };

  const handleSetNewAsset = (asset: any) => {
    setNewAssetState(asset);
    setAssetId("");
  };

  const onSubmit = (data: any) => {
    if (!currentCP) {
      toast.error("Оберіть постачальника послуг!");
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
      isSubmitting,
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
      isEdit,
    },
    actions: {
      onSubmit,
    },
    isDirty, // 🔥 Експорт статусу
  };
};
