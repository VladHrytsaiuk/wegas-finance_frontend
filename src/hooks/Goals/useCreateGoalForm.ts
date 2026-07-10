import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { getAccountsApi } from "../../services/apiAccounts";
import { getUsersApi, getMeApi } from "../../services/apiUsers";
import { useCreateGoal } from "./useCreateGoal";
import type { Goal, Account, User } from "../../types";
import { useModal } from "../../components/ui/Modal";
import { compressImage } from "../../utils/compressor";
import { getUploadedFileUrl } from "../../utils/helpers";

export const useCreateGoalForm = (
  isOpen: boolean,
  onClose: () => void,
  editingGoal?: Goal | null,
) => {
  const { t } = useTranslation();
  const { isDirty, setIsDirty } = useModal();

  // --- WIZARD STATE ---
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const totalSteps = 3;

  // --- FORM STATE (Using lazy initializers for stability) ---
  const [name, setNameState] = useState(() => editingGoal?.name || "");
  const [amount, setAmount] = useState(() => 
    editingGoal ? (editingGoal.target_amount / 100).toFixed(2) : ""
  );
  const [currency, setCurrency] = useState(() => editingGoal?.currency || "UAH");
  
  const [deadline, setDeadline] = useState<Date | undefined>(() => {
    if (!editingGoal?.date_deadline) return undefined;
    let ts = Number(editingGoal.date_deadline);
    if (isNaN(ts) || ts <= 0) return undefined;
    if (ts < 10000000000) ts *= 1000;
    return new Date(ts);
  });
  
  const [color, setColor] = useState<string>(() => editingGoal?.color || "#10b981");
  const [icon, setIcon] = useState<string>(() => editingGoal?.icon || "HiStar");

  const handleColorChange = (colorId: string) => {
    setColor(colorId);
  };

  const handleIconChange = (iconId: string) => {
    if (iconId) setIcon(iconId);
  };

  const [isPhotoRemoved, setIsPhotoRemoved] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState(() => 
    getUploadedFileUrl(editingGoal?.photo_url) || ""
  );
  const [isCompressing, setIsCompressing] = useState(false);

  const [externalLink, setExternalLink] = useState(() => editingGoal?.external_link || "");
  const [description, setDescription] = useState(() => editingGoal?.description || "");

  const [visibility, setVisibility] = useState<"public" | "private">(() => 
    editingGoal?.visibility || "public"
  );
  const [hiddenFrom, setHiddenFrom] = useState<string[]>(() => 
    editingGoal?.hidden_from ? editingGoal.hidden_from.split(",") : []
  );

  const [linkMode, setLinkMode] = useState<"none" | "new" | "existing">(() => 
    editingGoal ? "none" : "new"
  );
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [newAccountName, setNewAccountName] = useState("");

  const { submit, isLoading } = useCreateGoal(onClose, editingGoal);

  // --- DATA LOADING ---
  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["accounts"],
    queryFn: getAccountsApi,
    enabled: isOpen,
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: getUsersApi,
    enabled: isOpen,
  });

  const { data: currentUser } = useQuery<User>({
    queryKey: ["me"],
    queryFn: getMeApi,
    enabled: isOpen,
  });

  const availableAccounts = accounts.filter(
    (acc) =>
      (acc.type === "piggy_bank" || acc.type === "cash") &&
      (!acc.goal_id || acc.goal_id === editingGoal?.id),
  );

  const membersToHideFrom = users.filter((u) => u.id !== currentUser?.id);

  // Dirty Check
  useEffect(() => {
    const checkIsDirty = () => {
      if (editingGoal) {
        const currentHiddenStr = hiddenFrom.join(",");
        return (
          name !== editingGoal.name ||
          amount !== (editingGoal.target_amount / 100).toFixed(2) ||
          description !== (editingGoal.description || "") ||
          visibility !== (editingGoal.visibility || "public") ||
          currentHiddenStr !== (editingGoal.hidden_from || "") ||
          photoFile !== null ||
          isPhotoRemoved
        );
      } else {
        return name.trim() !== "" || amount !== "";
      }
    };
    setIsDirty(checkIsDirty());
  }, [name, amount, description, visibility, hiddenFrom, photoFile, isPhotoRemoved, editingGoal, setIsDirty]);

  const setName = (value: string) => {
    setNameState(value);
    if (!editingGoal && linkMode === "new") {
      setNewAccountName(value);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const originalFile = e.target.files[0];
      setIsCompressing(true);
      try {
        const compressed = await compressImage(originalFile);
        setPhotoFile(compressed);
        setIsPhotoRemoved(false);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoPreview(reader.result as string);
          setIsCompressing(false);
        };
        reader.readAsDataURL(compressed);
      } catch (error) {
        console.error("Помилка стиснення:", error);
        setIsCompressing(false);
      }
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview("");
    setIsPhotoRemoved(true);
  };

  const toggleHiddenUser = (userId: string) => {
    setHiddenFrom((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!name.trim()) newErrors.name = t("common:validation.required");
      if (!amount || Number(amount) <= 0) newErrors.amount = t("common:validation.invalid_amount");
      if (deadline) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (deadline < today) {
          newErrors.deadline = t("common:formValidation.error_date_required");
        }
      }
    } else if (step === 2) {
      if (!linkMode) newErrors.linkMode = t("common:validation.required");
      if (!visibility) newErrors.visibility = t("common:validation.required");
      if (linkMode === "new" && !newAccountName.trim()) {
        newErrors.newAccountName = t("common:validation.required");
      }
      if (linkMode === "existing" && !selectedAccountId) {
        newErrors.selectedAccountId = t("common:formValidation.error_select_account");
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleCloseAttempt = () => {
    if (isDirty) {
      setShowConfirm(true);
    } else {
      setIsDirty(false);
      onClose();
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;
    submit({
      name,
      target_amount: Number(amount),
      currency,
      date_deadline: deadline ? deadline.toISOString() : "",
      color,
      icon,
      photo_file: photoFile,
      photo_url: photoFile ? "" : photoPreview,
      remove_photo: isPhotoRemoved && !photoFile,
      external_link: externalLink,
      description,
      visibility,
      hidden_from: hiddenFrom.join(","),
      link_mode: linkMode,
      existing_account_id: selectedAccountId,
      new_account_name: newAccountName,
    });
  };

  return {
    wizard: {
      currentStep,
      totalSteps,
      nextStep,
      prevStep,
      errors,
      setErrors,
      showConfirm,
      setShowConfirm,
      handleCloseAttempt,
    },
    formState: {
      name,
      setName,
      amount,
      setAmount,
      currency,
      setCurrency,
      deadline,
      setDeadline,
      color,
      setColor: handleColorChange,
      icon,
      setIcon: handleIconChange,
      photoPreview,
      handleFileChange,
      handleRemovePhoto,
      externalLink,
      setExternalLink,
      description,
      setDescription,
      visibility,
      setVisibility,
      hiddenFrom,
      toggleHiddenUser,
      linkMode,
      setLinkMode,
      selectedAccountId,
      setSelectedAccountId,
      newAccountName,
      setNewAccountName,
      isCompressing,
    },
    data: {
      availableAccounts,
      isLoading,
      users,
      currentUser,
      membersToHideFrom,
    },
    handleSubmit: handleSubmitForm,
    t,
  };
};
