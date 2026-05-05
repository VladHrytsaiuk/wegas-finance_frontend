import { useState, useRef, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BANK_SKINS } from "../../components/accounts/bankSkins";
import { getGoalsApi } from "../../services/apiGoals";
import {
  getStorageTypesApi,
  createStorageTypeApi,
} from "../../services/apiStorageTypes";

interface UseAccountFormProps {
  onSubmit: (data: any, options?: any) => void;
  defaultValues?: any;
  onClose?: () => void;
}

interface FormErrors {
  name?: string;
  balance?: string;
  cardNumber?: string;
  storageType?: string;
}

export const useAccountForm = ({
  onSubmit,
  defaultValues,
  onClose,
}: UseAccountFormProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Refs
  const formRef = useRef<HTMLFormElement>(null);
  const initialFocusRef = useRef<HTMLButtonElement>(null);
  const skinBtnRef = useRef<HTMLButtonElement>(null);
  const isInitialized = useRef(false); // 🔥 Додано для відстеження ініціалізації

  // --- Form State ---
  const [type, setType] = useState("card");
  const [pendingType, setPendingType] = useState<string | null>(null);

  const [bank, setBank] = useState("monobank");
  const [skinKey, setSkinKey] = useState("monobank-black");
  const [activeBankTab, setActiveBankTab] = useState("monobank");

  const [name, setName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [paymentSystem, setPaymentSystem] = useState("");

  const [balance, setBalance] = useState("");
  const [currency, setCurrency] = useState("UAH");
  const [color, setColor] = useState("#10b981");
  const [ownerId, setOwnerId] = useState("");

  const [storageTypeId, setStorageTypeId] = useState<string>("");
  const [goalId, setGoalId] = useState<string>("");

  const [errors, setErrors] = useState<FormErrors>({});

  // Snapshot
  const [initialSnapshot, setInitialSnapshot] = useState<string>("");

  // --- API Queries ---
  const { data: storageTypes = [] } = useQuery({
    queryKey: ["storageTypes"],
    queryFn: getStorageTypesApi,
    staleTime: 5 * 60 * 1000,
  });

  const { data: goals = [] } = useQuery({
    queryKey: ["goals"],
    queryFn: getGoalsApi,
  });

  const createTypeMutation = useMutation({
    mutationFn: createStorageTypeApi,
    onSuccess: (newType: any) => {
      queryClient.invalidateQueries({ queryKey: ["storageTypes"] });
      setStorageTypeId(newType.id);
    },
  });

  // --- Initialization Logic ---
  useEffect(() => {
    if (defaultValues) {
      // EDIT MODE: Тут ми точно знаємо значення
      const mappedType =
        defaultValues.type === "piggy_bank" ? "savings" : defaultValues.type;

      setName(defaultValues.name);
      setType(mappedType);
      setCurrency(defaultValues.currency);
      setBalance((defaultValues.initial_balance / 100).toString());
      setColor(defaultValues.color || "#10b981");
      setOwnerId(defaultValues.user_id || "");
      setCardNumber(defaultValues.card_number || "");
      setPaymentSystem(defaultValues.payment_system || "");
      setGoalId(defaultValues.goal_id || "");

      if (defaultValues.storage_type_id) {
        setStorageTypeId(defaultValues.storage_type_id);
      }

      let restoredSkinKey = "monobank-black";
      let restoredBank = "monobank";
      if (defaultValues.type === "card") {
        if (defaultValues.bank_name && defaultValues.card_design) {
          restoredSkinKey = `${defaultValues.bank_name}-${defaultValues.card_design}`;
        } else if (defaultValues.icon && BANK_SKINS[defaultValues.icon]) {
          restoredSkinKey = defaultValues.icon;
        }
        if (BANK_SKINS[restoredSkinKey]) {
          restoredBank = BANK_SKINS[restoredSkinKey].bankId;
        }
      }
      setSkinKey(restoredSkinKey);
      setBank(restoredBank);
      setActiveBankTab(restoredBank);

      // Створюємо зліпок
      const uiState = {
        name: defaultValues.name,
        type: mappedType,
        balance: (defaultValues.initial_balance / 100).toString(),
        currency: defaultValues.currency,
        cardNumber: defaultValues.card_number || "",
        paymentSystem: defaultValues.payment_system || "",
        color: mappedType === "card" ? "" : defaultValues.color || "#10b981",
        ownerId: defaultValues.user_id || "",
        storageTypeId: defaultValues.storage_type_id || "",
        goalId: defaultValues.goal_id || "",
        skinKey: mappedType === "card" ? restoredSkinKey : "",
      };
      setInitialSnapshot(JSON.stringify(uiState));
      isInitialized.current = true;
    } else {
      // CREATE MODE:
      // Ми НЕ створюємо зліпок тут вручну.
      // Ми даємо компоненту відрендеритись з дефолтними useState,
      // а потім useEffect нижче зафіксує цей стан як "чистий".
    }
    setErrors({});
  }, [JSON.stringify(defaultValues)]);

  // 🔥 Fix for Create Mode & Auto-Select
  // Цей ефект запускається, коли завантажились типи скарбничок або просто при старті
  useEffect(() => {
    // Якщо це режим редагування - виходимо, там snapshot вже є
    if (defaultValues) return;

    // Авто-вибір типу скарбнички
    let currentStorageTypeId = storageTypeId;
    if (type === "savings" && storageTypes.length > 0 && !storageTypeId) {
      currentStorageTypeId = storageTypes[0].id;
      setStorageTypeId(currentStorageTypeId);
    }

    // 🔥 ЯКЩО зліпок ще не створений (Create Mode), створюємо його з ПОТОЧНИХ значень
    // Це гарантує, що форма буде "чистою" при відкритті
    if (!isInitialized.current || !initialSnapshot) {
      const currentUiState = {
        name,
        type,
        balance,
        currency,
        cardNumber: type === "card" ? cardNumber : "",
        paymentSystem: type === "card" ? paymentSystem : "",
        color: type === "card" ? "" : color,
        ownerId,
        storageTypeId: currentStorageTypeId, // Використовуємо актуальне
        goalId,
        skinKey: type === "card" ? skinKey : "",
      };

      // Якщо типи скарбничок ще вантажаться, не фіксуємо snapshot для savings
      if (
        type === "savings" &&
        !currentStorageTypeId &&
        storageTypes.length === 0
      ) {
        return;
      }

      setInitialSnapshot(JSON.stringify(currentUiState));

      // Позначаємо, що ініціалізація пройшла, якщо у нас є всі критичні дані
      if (type !== "savings" || (type === "savings" && currentStorageTypeId)) {
        isInitialized.current = true;
      }
    }
  }, [
    type,
    storageTypes,
    defaultValues,
    storageTypeId,
    name,
    balance,
    currency,
    cardNumber,
    paymentSystem,
    color,
    ownerId,
    goalId,
    skinKey,
    initialSnapshot,
  ]);

  // 🔥 Is Dirty Calculation
  const isDirty = useMemo(() => {
    if (!initialSnapshot) return false;

    const initial = JSON.parse(initialSnapshot);

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
      storageTypeId: type === "savings" ? storageTypeId : "",
      goalId: type === "savings" ? goalId : "",
      skinKey: type === "card" ? skinKey : "",
    };

    // 1. ЛОГІКА ДЛЯ РЕДАГУВАННЯ (Edit Mode)
    // Якщо ми редагуємо існуючий рахунок, то зміна типу — це серйозна зміна.
    // Тому тут перевіряємо повну невідповідність.
    if (defaultValues?.id) {
      return JSON.stringify(currentUiState) !== initialSnapshot;
    }

    // 2. ЛОГІКА ДЛЯ СТВОРЕННЯ (Create Mode)
    // Якщо ми створюємо новий рахунок, перемикання вкладок (type, color, skinKey, storageTypeId)
    // НЕ повинно тригерити isDirty, поки користувач не ввів реальні дані.

    const hasDataChanged =
      name.trim() !== initial.name || // Ввели назву
      balance.toString() !== initial.balance || // Ввели баланс
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
    storageTypeId,
    goalId,
    skinKey,
    initialSnapshot,
    defaultValues,
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
        setBank(skin.bankId);
      }
    }
  };

  // Shortcuts logic ... (без змін)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmd = e.metaKey || e.ctrlKey;
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

  // ... (Решта функцій без змін: handleSubmit, validateForm і т.д.)
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;
    if (!name.trim()) {
      newErrors.name = t("formValidation.error_asset_name");
      isValid = false;
    }
    if (balance !== "" && isNaN(Number(balance))) {
      newErrors.balance = t("formValidation.error_enter_amount");
      isValid = false;
    }
    if (type === "card" && cardNumber && cardNumber.length !== 4) {
      newErrors.cardNumber = t("accountForm.error_card_digits");
      isValid = false;
    }
    if (type === "savings" && !storageTypeId) {
      newErrors.storageType = t("accountForm.error_select_type");
      isValid = false;
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
      storage_type_id: type === "savings" ? storageTypeId : null,
      goal_id: type === "savings" ? goalId || null : null,
      color: type === "card" ? "#000000" : color,
      bank_name: type === "card" ? selectedSkin?.bankId : undefined,
      card_type: type === "card" ? selectedSkin?.designId : undefined,
      card_number: cardNumber,
      payment_system: paymentSystem,
      user_id: ownerId || undefined,
      id: defaultValues?.id,
    };
    onSubmit(formData, { onSuccess: onClose });
  };

  const clearError = (field: keyof FormErrors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return {
    refs: { formRef, initialFocusRef, skinBtnRef },
    state: {
      type,
      pendingType,
      bank,
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
      storageTypeId,
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
      handleCreateStorageType,
      clearError,
      handleSubmit,
    },
  };
};
