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

  // --- СТЕЙТИ ---
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("UAH");
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [color, setColor] = useState("#10b981");
  const [icon, setIcon] = useState("HiFlag");

  const [isPhotoRemoved, setIsPhotoRemoved] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");

  // 🔥 ДОДАЄМО СТАН ЗАВАНТАЖЕННЯ 🔥
  const [isCompressing, setIsCompressing] = useState(false);

  const [externalLink, setExternalLink] = useState("");
  const [description, setDescription] = useState("");

  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [hiddenFrom, setHiddenFrom] = useState<string[]>([]);

  const [linkMode, setLinkMode] = useState<"none" | "new" | "existing">("none");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [newAccountName, setNewAccountName] = useState("");

  const { submit, isLoading } = useCreateGoal(onClose, editingGoal);
  const { setIsDirty } = useModal();

  // --- ЗАВАНТАЖЕННЯ ДАНИХ ---
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

  // --- ЗАПОВНЕННЯ ФОРМИ ---
  useEffect(() => {
    if (editingGoal) {
      setName(editingGoal.name);
      setAmount((editingGoal.target_amount / 100).toFixed(2));
      setCurrency(editingGoal.currency);
      setColor(editingGoal.color);
      setIcon(editingGoal.icon);
      setExternalLink(editingGoal.external_link || "");
      setDescription(editingGoal.description || "");

      setVisibility(editingGoal.visibility || "public");

      setHiddenFrom(
        editingGoal.hidden_from ? editingGoal.hidden_from.split(",") : [],
      );

      if (editingGoal.date_deadline) {
        let ts = Number(editingGoal.date_deadline);
        if (!isNaN(ts) && ts > 0) {
          if (ts < 10000000000) ts *= 1000;
          setDeadline(new Date(ts));
        } else {
          setDeadline(undefined);
        }
      } else {
        setDeadline(undefined);
      }

      setPhotoPreview(getUploadedFileUrl(editingGoal.photo_url) || "");

      setLinkMode("none");
      setIsPhotoRemoved(false);
    } else {
      // Reset
      setName("");
      setAmount("");
      setCurrency("UAH");
      setDeadline(undefined);
      setColor("#10b981");
      setIcon("HiFlag");
      setPhotoFile(null);
      setPhotoPreview("");
      setExternalLink("");
      setDescription("");
      setVisibility("public");
      setHiddenFrom([]);
      setLinkMode("new");
      setNewAccountName("");
      setIsPhotoRemoved(false);
    }
  }, [editingGoal, isOpen]);

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
  }, [
    name,
    amount,
    description,
    visibility,
    hiddenFrom,
    photoFile,
    isPhotoRemoved,
    editingGoal,
    setIsDirty,
  ]);

  useEffect(() => {
    if (!editingGoal && linkMode === "new") {
      setNewAccountName(name);
    }
  }, [name, linkMode, editingGoal]);

  // 🔥 ОНОВЛЕНИЙ ОБРОБНИК ФАЙЛУ З АНІМАЦІЄЮ 🔥
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const originalFile = e.target.files[0];

      setIsCompressing(true); // Вмикаємо спінер

      try {
        const compressed = await compressImage(originalFile);
        setPhotoFile(compressed);
        setIsPhotoRemoved(false);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoPreview(reader.result as string);
          setIsCompressing(false); // Вимикаємо спінер
        };
        reader.readAsDataURL(compressed);
      } catch (error) {
        console.error("Помилка стиснення:", error);
        setIsCompressing(false); // Вимикаємо у разі помилки
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
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      setColor,
      icon,
      setIcon,
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
      isCompressing, // 🔥 Передаємо стан у компонент
    },
    data: { availableAccounts, isLoading, users, currentUser },
    handleSubmit,
    t,
  };
};
