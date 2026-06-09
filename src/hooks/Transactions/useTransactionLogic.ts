import { useState, useEffect, useMemo, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { format, setHours, setMinutes } from "date-fns";
import { type ReactZoomPanPinchRef } from "react-zoom-pan-pinch";

import { useTransactionForm } from "./useTransactionForm";
import {
  createTransactionApi,
  updateTransactionApi,
  uploadReceiptApi,
  deleteReceiptApi,
  deleteTransactionPhotoApi,
} from "../../services/apiTransactions";
import { compressImage } from "../../utils/compressor";
import { isModifierPressed } from "../../utils/platform";

interface UseTransactionLogicProps {
  transactionToEdit?: any;
  initialType?: string;
  initialAccountId?: string;
  initialCounterpartyId?: string;
  initialAmount?: number;
  initialNote?: string;
  onCloseModal?: () => void;
  onSuccess?: (data?: any) => void;
}

interface FormErrors {
  accountId?: string;
  targetAccountId?: string;
  categoryId?: string;
  amount?: string;
  targetAmount?: string;
  date?: string;
  counterpartyId?: string;
}

export const useTransactionLogic = ({
  transactionToEdit,
  initialType,
  initialAccountId,
  initialCounterpartyId,
  initialAmount,
  initialNote,
  onCloseModal,
  onSuccess,
}: UseTransactionLogicProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);

  const { form, actions } = useTransactionForm({
    transactionToEdit,
    initialType,
    initialAccountId,
    initialCounterpartyId,
    initialAmount,
    initialNote,
  });

  // --- 🔥 МИТТЄВА ІНІЦІАЛІЗАЦІЯ ЛОКАЛЬНИХ СТЕЙТІВ ---
  const [timeStr, setTimeStr] = useState(() => {
    if (transactionToEdit && transactionToEdit.date) {
      const d = new Date(transactionToEdit.date);
      if (!isNaN(d.getTime())) return format(d, "HH:mm");
    }
    return format(new Date(), "HH:mm");
  });

  const [localAmount, setLocalAmount] = useState(() => {
    if (transactionToEdit && transactionToEdit.amount)
      return (Math.abs(transactionToEdit.amount) / 100).toFixed(2);
    if (initialAmount) return (initialAmount / 100).toFixed(2);
    return "";
  });

  const [localTargetAmount, setLocalTargetAmount] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const [showDetails, setShowDetails] = useState(
    () =>
      transactionToEdit?.items?.length > 0 &&
      transactionToEdit?.type === "expense",
  );

  const [conflictState, setConflictState] = useState<{
    total: number;
    itemsSum: number;
    diff: number;
  } | null>(null);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  const isEditSession = Boolean(transactionToEdit);
  const isDirty = form.isDirty || filesToUpload.length > 0;

  // --- HOTKEYS ---
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isMod = isModifierPressed(e);

      if (isMod) {
        if (e.code === "Equal") {
          e.preventDefault();
          transformRef.current?.zoomIn();
          return;
        }
        if (e.code === "Minus") {
          e.preventDefault();
          transformRef.current?.zoomOut();
          return;
        }
        if (e.code === "Digit0") {
          e.preventDefault();
          transformRef.current?.resetTransform();
          return;
        }
      }

      if (isMod && e.code === "KeyD") {
        e.preventDefault();
        if (showDetails) {
          const hasData = form.items.some(
            (item) =>
              (item.name && item.name.trim() !== "") ||
              Number(item.price_per_unit) > 0 ||
              Number(item.total_amount) > 0,
          );
          if (hasData) {
            setIsClearModalOpen(true);
            return;
          }
          actions.setItems([]);
          setShowDetails(false);
        } else {
          setShowDetails(true);
          if (form.items.length === 0) setTimeout(() => actions.addItem(), 0);
        }
        return;
      }

      if (isMod && e.code === "KeyA") {
        const target = e.target as HTMLElement;
        if (
          target.tagName === "TEXTAREA" ||
          (target.tagName === "INPUT" && target.getAttribute("type") === "text")
        )
          return;
        e.preventDefault();
        if (!showDetails) {
          setShowDetails(true);
          setTimeout(() => actions.addItem(), 0);
        } else {
          actions.addItem();
        }
        return;
      }

      if (isMod && e.code === "KeyI") {
        e.preventDefault();
        fileInputRef.current?.click();
        return;
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [showDetails, form.items, actions]);

  // --- Logic Helpers ---
  const invalidationConfig = () => {
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    queryClient.invalidateQueries({ queryKey: ["accounts"] });
    queryClient.invalidateQueries({ queryKey: ["account"] });
    queryClient.invalidateQueries({ queryKey: ["goal"] });
    queryClient.invalidateQueries({ queryKey: ["goals"] });
    queryClient.invalidateQueries({ queryKey: ["stats"] });
    queryClient.invalidateQueries({ queryKey: ["counterparties"] });
    if (isEditSession && transactionToEdit) {
      queryClient.invalidateQueries({
        queryKey: ["transaction", transactionToEdit.id],
      });
    }
  };

  const getReceiptUrl = (path: string | undefined) => {
    if (!path) return null;
    return path.startsWith("http")
      ? path
      : path.startsWith("/")
        ? path
        : `/${path}`;
  };

  const handleConfirmClearItems = () => {
    actions.setItems([]);
    setShowDetails(false);
    setIsClearModalOpen(false);
  };

  // --- API Mutations ---
  const { mutateAsync: createTxAsync } = useMutation({
    mutationFn: createTransactionApi,
  });
  const { mutateAsync: updateTxAsync } = useMutation({
    mutationFn: updateTransactionApi,
  });
  const { mutateAsync: uploadReceiptAsync, isPending: isUploading } =
    useMutation({
      mutationFn: uploadReceiptApi,
      onError: () => toast.error(t("transactions:transactionForm.alert_error_default")),
    });
  const { mutateAsync: deleteSinglePhotoAsync, isPending: isDeletingSingle } =
    useMutation({
      mutationFn: deleteTransactionPhotoApi,
      onError: () => toast.error(t("transactions:transactionForm.alert_error_default")),
    });
  const { mutate: deleteReceipt, isPending: isDeletingAll } = useMutation({
    mutationFn: deleteReceiptApi,
    onSuccess: () => {
      toast.success(t("transactions:transactionForm.receipt_deleted"));
      invalidationConfig();
    },
    onError: () => toast.error(t("transactions:transactionForm.alert_error_default")),
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!form.accountId) {
      newErrors.accountId = t("common:validation.required");
      isValid = false;
    }

    const amountVal = parseFloat(localAmount);
    if (!localAmount || isNaN(amountVal) || amountVal <= 0) {
      newErrors.amount = t("common:validation.invalid_amount");
      isValid = false;
    }

    if (!form.date) {
      newErrors.date = t("common:validation.required");
      isValid = false;
    }

    const isDebt = [
      "loan_give",
      "loan_repay",
      "debt_take",
      "debt_repay",
    ].includes(form.type);

    if (form.type === "transfer") {
      if (!form.targetAccountId) {
        newErrors.targetAccountId = t("common:validation.required");
        isValid = false;
      } else if (form.accountId === form.targetAccountId) {
        newErrors.targetAccountId = t("common:validation.same_account");
        isValid = false;
      }
    } else if (isDebt) {
      if (!form.counterpartyId) {
        newErrors.counterpartyId = t("common:validation.required");
        isValid = false;
      }
    } else {
      if (!form.categoryId) {
        newErrors.categoryId = t("common:validation.required");
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const buildPayload = (itemsToUse: any[], amountToUse?: number) => {
    const dateObj = new Date(form.date);
    const [hours, minutes] = timeStr.split(":").map(Number);
    const fullTimestamp = setHours(
      setMinutes(dateObj, minutes),
      hours,
    ).getTime();

    const finalAmount =
      amountToUse !== undefined
        ? amountToUse
        : Math.round(Math.abs(parseFloat(localAmount || "0")) * 100);
    let finalTargetAmount = undefined;

    if (form.type === "transfer" && localTargetAmount) {
      finalTargetAmount = Math.round(
        Math.abs(parseFloat(localTargetAmount)) * 100,
      );
    }

    let finalMileage: number | undefined = undefined;
    if (form.isAssetPanelOpen && (form.assetId || form.newAsset)) {
      if (form.mileage && String(form.mileage).trim() !== "") {
        const m = parseInt(String(form.mileage), 10);
        if (!isNaN(m)) finalMileage = m;
      }
    }

    return {
      type: form.type,
      account_id: form.accountId,
      target_account_id:
        form.type === "transfer" ? form.targetAccountId : undefined,
      category_id: form.categoryId || undefined,
      counterparty_id: form.counterpartyId || undefined,
      amount: finalAmount,
      target_amount: finalTargetAmount,
      date: fullTimestamp,
      note: form.note,
      items: itemsToUse.map((item: any) => ({
        ...item,
        category_id: item.categoryId || item.category_id || null,
      })),
      tag_ids: form.tagIds,
      asset_id: form.isAssetPanelOpen ? form.assetId || undefined : undefined,
      new_asset: form.isAssetPanelOpen ? form.newAsset || undefined : undefined,
      mileage: finalMileage,
    };
  };

  const executeMutation = async (payload: any) => {
    setIsSubmitting(true);
    let responseData = null;

    try {
      if (isEditSession && transactionToEdit) {
        const res = await updateTxAsync({
          ...payload,
          id: transactionToEdit.id,
        });
        responseData = res;
        toast.success(t("transactions:transactionForm.alert_update_success"));
      } else {
        let dataToSend = payload;
        const hasFiles =
          filesToUpload.length > 0 ||
          (form.newAsset?.warrantyFiles?.length || 0) > 0;

        if (hasFiles) {
          const formData = new FormData();
          const jsonPayload = {
            ...payload,
            new_asset: form.newAsset ? { ...form.newAsset } : null,
          };
          if (jsonPayload.new_asset) delete jsonPayload.new_asset.warrantyFiles;
          formData.append("json", JSON.stringify(jsonPayload));
          form.newAsset?.warrantyFiles?.forEach((f: File) =>
            formData.append("files", f),
          );
          filesToUpload.forEach((f) => formData.append("files", f));
          dataToSend = formData;
        }

        const res = await createTxAsync(dataToSend);
        responseData = res;
        toast.success(t("transactions:transactionForm.alert_create_success"));
      }

      invalidationConfig();
      if (onSuccess) onSuccess(responseData);
      onCloseModal?.();

      if (!isEditSession) {
        actions.resetForm();
        setFilesToUpload([]);
        setLocalAmount("");
        actions.setAmountStr("");
      }
    } catch (error: any) {
      toast.error(error.message || t("transactions:transactionForm.alert_error_default"));
    } finally {
      setIsSubmitting(false);
      setConflictState(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error(t("transactions:transactionForm.alert_fix_errors"));
      return;
    }

    const currentItems = form.items || [];
    const isExpense = form.type === "expense";

    if (showDetails && isExpense && currentItems.length > 0) {
      const totalTx = Math.round(
        Math.abs(parseFloat(localAmount || "0")) * 100,
      );
      const totalItems = currentItems.reduce(
        (sum, item) => sum + (Number(item.total_amount) || 0),
        0,
      );
      const diff = totalTx - totalItems;

      if (Math.abs(diff) > 1) {
        setConflictState({ total: totalTx, itemsSum: totalItems, diff });
        return;
      }
      executeMutation(buildPayload(currentItems));
    } else {
      executeMutation(buildPayload([]));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setIsCompressing(true);
      try {
        const newFiles = Array.from(e.target.files);
        const compressedFiles = await Promise.all(
          newFiles.map((file) => compressImage(file)),
        );

        if (isEditSession && transactionToEdit) {
          for (const file of compressedFiles) {
            await uploadReceiptAsync({ id: transactionToEdit.id, file });
            toast.success(t("transactions:transactionForm.photo_added_success"));
          }
          queryClient.invalidateQueries({
            queryKey: ["transaction", transactionToEdit.id],
          });
        } else {
          setFilesToUpload((prev) => {
            setPreviewIndex(prev.length);
            return [...prev, ...compressedFiles];
          });
        }
      } catch (err) {
        console.error("Upload error:", err);
        toast.error(t("common:common.error_occurred", "Помилка обробки фотографій"));
      } finally {
        setIsCompressing(false);
        e.target.value = "";
      }
    }
  };

  const allPreviewUrls = useMemo(() => {
    const urls: string[] = [];
    if (transactionToEdit) {
      transactionToEdit.photos?.forEach((p: any) => {
        const url = getReceiptUrl(p.path);
        if (url) urls.push(url);
      });
      if (!transactionToEdit.photos && transactionToEdit.receipt_img) {
        const url = getReceiptUrl(transactionToEdit.receipt_img);
        if (url) urls.push(url);
      }
    }
    filesToUpload.forEach((file) => urls.push(URL.createObjectURL(file)));
    return urls;
  }, [transactionToEdit, filesToUpload]);

  const resolveConflict = {
    addRemainder: () => {
      if (!conflictState) return;
      const newItems = [
        ...form.items,
        {
          name: t("transactions:transactionForm.item_remainder_name"),
          quantity: 1,
          price_per_unit: conflictState.diff,
          total_amount: conflictState.diff,
          categoryId: form.categoryId,
          comment: t("transactions:transactionForm.remainder_auto_note"),
        },
      ];
      executeMutation(buildPayload(newItems));
    },
    updateTotal: () => {
      if (!conflictState) return;
      executeMutation(buildPayload(form.items, conflictState.itemsSum));
    },
    ignore: () => executeMutation(buildPayload(form.items)),
  };

  return {
    state: {
      form,
      localAmount,
      localTargetAmount,
      timeStr,
      errors,
      showDetails,
      conflictState,
      isSubmitting,
      isUploading,
      isCompressing,
      isDeleting: isDeletingAll || isDeletingSingle,
      allPreviewUrls,
      previewIndex,
      isEditSession,
      isViewerOpen,
      isClearModalOpen,
      isDirty,
    },
    actions: {
      ...actions,
      setLocalAmount: (v: string) => {
        setLocalAmount(v);
        actions.setAmountStr(v);
        if (errors.amount) setErrors((e) => ({ ...e, amount: undefined }));
      },
      setLocalTargetAmount: (v: string) => {
        setLocalTargetAmount(v);
        if (errors.targetAmount)
          setErrors((e) => ({ ...e, targetAmount: undefined }));
      },
      setTimeStr,
      setShowDetails,
      setConflictState,
      setPreviewIndex,
      clearError: (field: keyof FormErrors) =>
        setErrors((prev) => ({ ...prev, [field]: undefined })),
      setIsViewerOpen,
      setIsClearModalOpen,
    },
    handlers: {
      handleSubmit,
      handleFileUpload,
      resolveConflict,
      handleConfirmClearItems,
      deleteReceipt: () => deleteReceipt(transactionToEdit?.id),
      deleteCurrentPhoto: async () => {
        const existingCount =
          transactionToEdit?.photos?.length ||
          (transactionToEdit?.receipt_img ? 1 : 0) ||
          0;
        if (previewIndex < existingCount) {
          if (transactionToEdit?.photos?.length > 0) {
            await deleteSinglePhotoAsync(
              transactionToEdit.photos[previewIndex].id,
            );
            queryClient.invalidateQueries({
              queryKey: ["transaction", transactionToEdit.id],
            });
          } else {
            deleteReceipt(transactionToEdit.id);
          }
        } else {
          setFilesToUpload((prev) =>
            prev.filter((_, i) => i !== previewIndex - existingCount),
          );
          setPreviewIndex((prev) => Math.max(0, prev - 1));
        }
      },
      deleteAllPhotos: () => {
        setFilesToUpload([]);
        if (isEditSession) deleteReceipt(transactionToEdit.id);
        setPreviewIndex(0);
      },
    },
    refs: { fileInputRef, transformRef },
  };
};
