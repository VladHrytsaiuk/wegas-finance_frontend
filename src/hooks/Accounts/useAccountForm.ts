import { useState, useMemo, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import {
  getAccountApi,
  createAccountApi,
  updateAccountApi,
} from "../../services/apiAccounts";
import { getStorageTypesApi } from "../../services/apiStorageTypes";
import { getGoalsApi } from "../../services/apiGoals";
import { BANK_SKINS } from "../../components/accounts/bankSkins";
import { isModKeyPressed } from "../../utils/platform";

interface AccountFormProps {
  defaultValues?: any;
  onClose?: () => void;
  onCloseModal?: () => void;
}

export const useAccountForm = ({
  defaultValues,
  onClose,
  onCloseModal,
}: AccountFormProps) => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isEditing = !!defaultValues;

  const formRef = useRef<HTMLFormElement>(null);
  const skinBtnRef = useRef<HTMLButtonElement>(null);
  const initialFocusRef = useRef<HTMLButtonElement>(null);

  // --- 1. Form States ---
  const [type, setType] = useState(defaultValues?.type || "card");
  const [name, setName] = useState(defaultValues?.name || "");
  const [balance, setBalance] = useState(
    defaultValues ? (defaultValues.balance / 100).toString() : "",
  );
  const [currency, setCurrency] = useState(defaultValues?.currency || "UAH");
  const [cardNumber, setCardNumber] = useState(defaultValues?.card_number || "");
  const [paymentSystem, setPaymentSystem] = useState(
    defaultValues?.payment_system || "",
  );
  const [color, setColor] = useState(defaultValues?.color || "#6366f1");
  const [skinKey, setSkinKey] = useState(
    defaultValues?.skin_key || "monobank-black",
  );
  const [ownerId, setOwnerId] = useState(defaultValues?.user_id || "");
  const [storageTypeId, setStorageTypeId] = useState(
    defaultValues?.storage_type_id || "",
  );
  const [goalId, setGoalId] = useState(defaultValues?.goal_id || "");

  const [pendingType, setPendingType] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // --- 2. Queries ---
  const { data: storageTypes = [] } = useQuery({
    queryKey: ["storage-types"],
    queryFn: getStorageTypesApi,
  });

  const { data: goals = [] } = useQuery({
    queryKey: ["goals"],
    queryFn: getGoalsApi,
  });

  // --- 3. Mutations ---
  const createMutation = useMutation({
    mutationFn: createAccountApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success(t("accounts:accountForm.alert_create_success"));
      onCloseModal?.() || onClose?.();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: updateAccountApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["account", id] });
      toast.success(t("accounts:accountForm.alert_update_success"));
      onCloseModal?.() || onClose?.();
    },
    onError: (err: any) => toast.error(err.message),
  });

  // --- 4. Handlers ---
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = t("common:validation.required");
    if (!balance.trim()) newErrors.balance = t("common:validation.required");
    if (type === "card" && cardNumber.length < 4)
      newErrors.cardNumber = t("accounts:accountForm.error_invalid_card");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      type,
      name,
      balance: Math.round(parseFloat(balance) * 100),
      currency,
      card_number: type === "card" ? cardNumber : "",
      payment_system: type === "card" ? paymentSystem : "",
      color: type !== "card" ? color : "",
      skin_key: type === "card" ? skinKey : "",
      user_id: ownerId || null,
      storage_type_id: type === "savings" ? storageTypeId : null,
      goal_id: type === "savings" ? goalId : null,
    };

    if (isEditing) {
      updateMutation.mutate({ id: defaultValues.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const confirmTypeChange = () => {
    if (pendingType) {
      setType(pendingType);
      setGoalId("");
      setPendingType(null);
    }
  };

  const handleCreateStorageType = async (name: string) => {
    // Logic for creating a custom storage type if needed
  };

  // --- 5. Hotkeys ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmd = isModKeyPressed(e);
      if (isCmd && e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        formRef.current?.requestSubmit();
      }
      if (isCmd && (e.key === "i" || e.key === "I")) {
        e.preventDefault();
        e.stopPropagation();
        skinBtnRef.current?.click();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isDirty = useMemo(() => {
    if (!defaultValues) {
      return (
        name !== "" ||
        balance !== "" ||
        type !== "card" ||
        currency !== "UAH" ||
        cardNumber !== "" ||
        ownerId !== ""
      );
    }
    return (
      name !== defaultValues.name ||
      Math.round(parseFloat(balance) * 100) !== defaultValues.balance ||
      type !== defaultValues.type ||
      currency !== defaultValues.currency ||
      cardNumber !== (defaultValues.card_number || "") ||
      ownerId !== (defaultValues.user_id || "") ||
      goalId !== (defaultValues.goal_id || "") ||
      storageTypeId !== (defaultValues.storage_type_id || "") ||
      skinKey !== (defaultValues.skin_key || "monobank-black")
    );
  }, [
    name,
    balance,
    type,
    currency,
    cardNumber,
    ownerId,
    goalId,
    storageTypeId,
    skinKey,
    defaultValues,
  ]);

  // Derived Values for UI
  const activeBankTab = useMemo(() => {
    const currentSkin = BANK_SKINS[skinKey];
    return currentSkin ? currentSkin.bankId : "monobank";
  }, [skinKey]);

  return {
    state: {
      type,
      name,
      balance,
      currency,
      cardNumber,
      paymentSystem,
      color,
      skinKey,
      ownerId,
      storageTypeId,
      goalId,
      pendingType,
      errors,
      storageTypes,
      goals,
      isEditing,
      activeBankTab,
      isDirty,
    },
    actions: {
      setType,
      setName,
      setBalance,
      setCurrency,
      setCardNumber,
      setPaymentSystem,
      setColor,
      setSkinKey,
      setOwnerId,
      setStorageTypeId,
      setGoalId,
      setPendingType,
      confirmTypeChange,
      handleCreateStorageType,
      handleSubmit,
      clearError: (field: string) =>
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        }),
      setActiveBankTab: (tab: string) => {
        // Find first skin for this bank
        const firstSkin = Object.entries(BANK_SKINS).find(
          ([_, s]) => s.bankId === tab,
        );
        if (firstSkin) setSkinKey(firstSkin[0]);
      },
    },
    refs: {
      formRef,
      skinBtnRef,
      initialFocusRef,
    },
    isLoading: createMutation.isPending || updateMutation.isPending,
    t,
  };
};
