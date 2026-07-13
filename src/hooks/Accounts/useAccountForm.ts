import { useState, useRef, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BANK_SKINS } from "../../components/accounts/bankSkins";
import { getGoalsApi, type Goal } from "../../services/apiGoals";
import {
  getStorageTypesApi,
  createStorageTypeApi,
  type StorageType,
} from "../../services/apiStorageTypes";
import { isModifierPressed } from "../../utils/platform";
import type { Account } from "../../services/apiAccounts";

interface UseAccountFormProps {
  onSubmit: (
    data: AccountFormSubmitData,
    options?: { onSuccess?: () => void },
  ) => void;
  defaultValues?: Partial<Account> & {
    payment_system?: string;
    card_design?: string;
  };
  onClose?: () => void;
  onCloseModal?: () => void;
}

export interface AccountFormSubmitData {
  id?: string;
  name: string;
  type: "card" | "cash" | "piggy_bank";
  currency: string;
  initial_balance: number;
  storage_type_id: string | null;
  goal_id: string | null;
  color: string;
  bank_name?: string;
  card_type?: string;
  card_number: string;
  payment_system: string;
  user_id?: string;
}

interface FormErrors {
  name?: string;
  balance?: string;
  cardNumber?: string;
  storageType?: string;
}

type AccountFormMode = "card" | "cash" | "savings";

type InitialFormState = {
  type: AccountFormMode;
  ownerId: string;
  name: string;
  currency: string;
  balance: string;
  color: string;
  cardNumber: string;
  paymentSystem: string;
  goalId: string;
  storageTypeId: string;
  skinKey: string;
  activeBankTab: string;
};

function buildInitialFormState(
  defaultValues?: Partial<Account> & {
    payment_system?: string;
    card_design?: string;
  },
): InitialFormState {
  if (!defaultValues) {
    return {
      type: "card",
      ownerId: "",
      name: "",
      currency: "UAH",
      balance: "",
      color: "#10b981",
      cardNumber: "",
      paymentSystem: "",
      goalId: "",
      storageTypeId: "",
      skinKey: "monobank-black",
      activeBankTab: "monobank",
    };
  }

  const type =
    defaultValues.type === "piggy_bank" ? "savings" : defaultValues.type ?? "card";
  let skinKey = "monobank-black";
  let activeBankTab = "monobank";

  if (defaultValues.type === "card") {
    const design = defaultValues.card_type || defaultValues.card_design;

    if (defaultValues.bank_name && design) {
      skinKey = `${defaultValues.bank_name}-${design}`;
    } else if (defaultValues.icon && BANK_SKINS[defaultValues.icon]) {
      skinKey = defaultValues.icon;
    }

    if (BANK_SKINS[skinKey]) {
      activeBankTab = BANK_SKINS[skinKey].bankId;
    }
  }

  return {
    type,
    ownerId: defaultValues.user_id || "",
    name: defaultValues.name || "",
    currency: defaultValues.currency || "UAH",
    balance:
      defaultValues.initial_balance !== undefined
        ? (defaultValues.initial_balance / 100).toString()
        : "",
    color: defaultValues.color || "#10b981",
    cardNumber: defaultValues.card_number || "",
    paymentSystem: defaultValues.payment_system || "",
    goalId: defaultValues.goal_id || "",
    storageTypeId: defaultValues.storage_type_id || "",
    skinKey,
    activeBankTab,
  };
}

export const useAccountForm = ({
  onSubmit,
  defaultValues,
  onClose,
  onCloseModal,
}: UseAccountFormProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const initialState = useMemo(
    () => buildInitialFormState(defaultValues),
    [defaultValues],
  );

  // Refs
  const formRef = useRef<HTMLFormElement>(null);
  const initialFocusRef = useRef<HTMLButtonElement>(null);
  const skinBtnRef = useRef<HTMLButtonElement>(null);

  // --- Form State ---
  const [type, setType] = useState<AccountFormMode>(initialState.type);
  const [pendingType, setPendingType] = useState<string | null>(null);
  const [skinKey, setSkinKey] = useState(initialState.skinKey);
  const [activeBankTab, setActiveBankTab] = useState(initialState.activeBankTab);

  const [name, setName] = useState(initialState.name);
  const [cardNumber, setCardNumber] = useState(initialState.cardNumber);
  const [paymentSystem, setPaymentSystem] = useState(initialState.paymentSystem);

  const [balance, setBalance] = useState(initialState.balance);
  const [currency, setCurrency] = useState(initialState.currency);
  const [color, setColor] = useState(initialState.color);
  const [ownerId, setOwnerId] = useState(initialState.ownerId);

  const [storageTypeId, setStorageTypeId] = useState<string>(
    initialState.storageTypeId,
  );
  const [goalId, setGoalId] = useState<string>(initialState.goalId);

  const [errors, setErrors] = useState<FormErrors>({});

  // --- API Queries ---
  const { data: storageTypes = [] } = useQuery({
    queryKey: ["storageTypes"],
    queryFn: getStorageTypesApi as () => Promise<StorageType[]>,
    staleTime: 5 * 60 * 1000,
  });

  const { data: goals = [] } = useQuery({
    queryKey: ["goals"],
    queryFn: getGoalsApi as () => Promise<Goal[]>,
  });

  const createTypeMutation = useMutation({
    mutationFn: createStorageTypeApi as (data: {
      name: string;
      slug: string;
      icon: string;
      is_system: boolean;
    }) => Promise<StorageType>,
    onSuccess: (newType) => {
      queryClient.invalidateQueries({ queryKey: ["storageTypes"] });
      setStorageTypeId(newType.id);
    },
  });

  const effectiveStorageTypeId =
    type === "savings" && !storageTypeId && !defaultValues && storageTypes.length > 0
      ? storageTypes[0].id
      : storageTypeId;

  // 🔥 Is Dirty Calculation
  const isDirty = useMemo(() => {
    const initial = initialState;

    // Формуємо поточний стан (повний)
    const currentUiState = {
      name,
      type,
      balance: balance.toString(),
      currency,
      cardNumber: type === "card" ? cardNumber : "",
      paymentSystem: type === "card" ? paymentSystem : "",
      color: type === "card" ? "" : color,
      ownerId,
      storageTypeId: type === "savings" ? effectiveStorageTypeId : "",
      goalId: type === "savings" ? goalId : "",
      skinKey: type === "card" ? skinKey : "",
    };

    // 1. ЛОГІКА ДЛЯ РЕДАГУВАННЯ (Edit Mode)
    // Якщо ми редагуємо існуючий рахунок, то зміна типу — це серйозна зміна.
    // Тому тут перевіряємо повну невідповідність.
    if (defaultValues?.id) {
      return JSON.stringify(currentUiState) !== JSON.stringify({
        name: initial.name,
        type: initial.type,
        balance: initial.balance,
        currency: initial.currency,
        cardNumber: initial.cardNumber,
        paymentSystem: initial.paymentSystem,
        color: initial.type === "card" ? "" : initial.color,
        ownerId: initial.ownerId,
        storageTypeId: initial.type === "savings" ? initial.storageTypeId : "",
        goalId: initial.type === "savings" ? initial.goalId : "",
        skinKey: initial.type === "card" ? initial.skinKey : "",
      });
    }

    // 2. ЛОГІКА ДЛЯ СТВОРЕННЯ (Create Mode)
    // Якщо ми створюємо новий рахунок, перемикання вкладок (type, color, skinKey, storageTypeId)
    // НЕ повинно тригерити isDirty, поки користувач не ввів реальні дані.

    const hasDataChanged =
      name.trim() !== initial.name || // Ввели назву
      balance !== initial.balance || // Ввели баланс
      currency !== initial.currency || // Змінили валюту
      ownerId !== initial.ownerId || // Змінили власника
      (type === "card" && cardNumber.length > 0) || // Ввели номер картки
      (type === "savings" && goalId !== ""); // Вибрали ціль

    return hasDataChanged;
  }, [
    name,
    type,
    balance,
    currency,
    cardNumber,
    paymentSystem,
    color,
    ownerId,
    effectiveStorageTypeId,
    goalId,
    skinKey,
    initialState,
    defaultValues?.id,
  ]);

  // Focus
  useEffect(() => {
    const timer = setTimeout(() => {
      initialFocusRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Sync Tabs
  // useEffect(() => {
  //   if (type === "card") {
  //     const currentSkin = BANK_SKINS[skinKey];
  //     if (currentSkin && currentSkin.bankId !== activeBankTab) {
  //       setActiveBankTab(currentSkin.bankId);
  //       setBank(currentSkin.bankId);
  //     }
  //   }
  // }, [skinKey, type, activeBankTab]);

  // 🔥 Новий хендлер для зміни скіна
  const handleSkinChange = (newSkinKey: string) => {
    setSkinKey(newSkinKey); // Оновлюємо сам скін

    // Якщо це картка, одразу підтягуємо і відповідну вкладку банку
    if (type === "card") {
      const skin = BANK_SKINS[newSkinKey];
      if (skin) {
        setActiveBankTab(skin.bankId);
      }
    }
  };

  // Shortcuts logic ... (без змін)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isModifierPressed(e) && e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        formRef.current?.requestSubmit();
      }
      if (isModifierPressed(e) && e.code === "KeyI") {
        e.preventDefault();
        e.stopPropagation();
        skinBtnRef.current?.click();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ... (Решта функцій без змін: handleSubmit, validateForm і т.д.)
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;
    if (!name.trim()) {
      newErrors.name = t("common:formValidation.error_asset_name");
      isValid = false;
    }
    if (balance !== "" && isNaN(Number(balance))) {
      newErrors.balance = t("common:formValidation.error_enter_amount");
      isValid = false;
    }
    if (type === "card" && cardNumber && cardNumber.length !== 4) {
      newErrors.cardNumber = t("accounts:accountForm.error_card_digits");
      isValid = false;
    }
    if (type === "savings" && !storageTypeId) {
      if (!effectiveStorageTypeId) {
        newErrors.storageType = t("accounts:accountForm.error_select_type");
        isValid = false;
      }
    }
    setErrors(newErrors);
    return isValid;
  };

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = { ...errors };
    let isValid = true;
    
    if (step === 1) {
      delete newErrors.name;
      delete newErrors.cardNumber;
      delete newErrors.storageType;
    }
    
    if (step === 2) {
      if (!name.trim()) {
        newErrors.name = t("common:formValidation.error_asset_name");
        isValid = false;
      }
      if (type === "savings" && !storageTypeId && !effectiveStorageTypeId) {
        newErrors.storageType = t("accounts:accountForm.error_select_type");
        isValid = false;
      }
    }

    if (step === 3) {
      if (balance !== "" && isNaN(Number(balance))) {
        newErrors.balance = t("common:formValidation.error_enter_amount");
        isValid = false;
      }
      if (type === "card" && cardNumber && cardNumber.length !== 4) {
        newErrors.cardNumber = t("accounts:accountForm.error_card_digits");
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleCreateStorageType = (typeName: string) => {
    createTypeMutation.mutate({
      name: typeName,
      slug: typeName.toLowerCase().replace(/\s+/g, "_"),
      icon: "HiArchiveBox",
      is_system: false,
    });
  };

  const confirmTypeChange = () => {
    if (pendingType) {
      setType(pendingType);
      setPendingType(null);
      setErrors({});
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    const selectedSkin = BANK_SKINS[skinKey];
    const backendType = type === "savings" ? "piggy_bank" : type;

    const formData = {
      name,
      type: backendType,
      currency,
      initial_balance: Math.round(Number(balance) * 100),
      storage_type_id: type === "savings" ? effectiveStorageTypeId : null,
      goal_id: type === "savings" ? goalId || null : null,
      color: type === "card" ? "#000000" : color,
      bank_name: type === "card" ? selectedSkin?.bankId : undefined,
      card_type: type === "card" ? selectedSkin?.designId : undefined,
      card_number: cardNumber,
      payment_system: paymentSystem,
      user_id: ownerId || undefined,
      id: defaultValues?.id,
    };
    onSubmit(formData, { onSuccess: onClose ?? onCloseModal });
  };

  const clearError = (field: keyof FormErrors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return {
    formRef,
    initialFocusRef,
    skinBtnRef,
    state: {
      type,
      pendingType,
      skinKey,
      name,
      cardNumber,
      paymentSystem,
      balance,
      currency,
      color,
      ownerId,
      activeBankTab,
      errors,
      isEditing: !!defaultValues?.id,
      storageTypeId: effectiveStorageTypeId,
      storageTypes,
      goalId,
      goals,
      isDirty,
    },
    actions: {
      setType,
      setPendingType,
      confirmTypeChange,
      setSkinKey: handleSkinChange,
      setName,
      setCardNumber,
      setPaymentSystem,
      setBalance,
      setCurrency,
      setColor,
      setOwnerId,
      setActiveBankTab,
      setStorageTypeId,
      setGoalId,
      errors,
      setErrors,
      validateForm,
      validateStep,
      handleCreateStorageType,
      clearError,
      handleSubmit,
    },
  };
};
