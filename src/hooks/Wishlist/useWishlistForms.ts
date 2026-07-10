// useWishlistForms.ts
import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { compressImage } from "../../utils/compressor";
import { DEFAULT_WISHLIST_GROUP_COLOR } from "../../utils/constants";
import { getUploadedFileUrl } from "../../utils/helpers";
import type { WishlistGroup, WishlistItem } from "../../types";

export type WishlistItemFormData = Partial<WishlistItem> & {
  id?: string;
  photoFile?: File | null;
  removePhoto?: boolean;
};

export type WishlistGroupFormData = {
  id?: string;
  name: string;
  color: string;
  icon: string;
  visibility: WishlistGroup["visibility"];
  hiddenFromStr: string;
};

// --- ХУК ДЛЯ БАЖАНЬ (ITEMS) ---
export const useWishlistItemForm = (
  initialData?: Partial<WishlistItem>,
  defaultGroupId?: string,
) => {
  const { t } = useTranslation();

  const [name, setName] = useState(initialData?.name || "");
  const [price, setPrice] = useState(
    initialData?.price ? String(initialData.price / 100) : "",
  );
  const [currency, setCurrency] = useState(initialData?.currency || "UAH");
  const [url, setUrl] = useState(initialData?.url || "");
  const [priority, setPriority] = useState(initialData?.priority || 1);
  const [groupId, setGroupId] = useState(
    initialData?.group_id || defaultGroupId || "",
  );
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    getUploadedFileUrl(initialData?.photo_url) || null,
  );
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);

  // 🔥 ДОДАЄМО СТАН ЗАВАНТАЖЕННЯ 🔥
  const [isCompressing, setIsCompressing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDirty = initialData
    ? name !== initialData.name ||
      price !== (initialData.price ? String(initialData.price / 100) : "") ||
      url !== (initialData.url || "") ||
      priority !== (initialData.priority || 1) ||
      groupId !== (initialData.group_id || "") ||
      currency !== (initialData.currency || "UAH") ||
      photoFile !== null ||
      removePhoto
    : !!(name || price || url || photoPreview);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(
        t("shopping_wishlist:wishlist.error_image_only", "Тільки зображення"),
      );
      return;
    }

    // 🔥 ПОЧИНАЄМО АНІМАЦІЮ 🔥
    setIsCompressing(true);

    try {
      const compressed = await compressImage(file);
      setPhotoFile(compressed);
      setRemovePhoto(false);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        // 🔥 ЗАКІНЧУЄМО АНІМАЦІЮ 🔥
        setIsCompressing(false);
      };
      reader.readAsDataURL(compressed);
    } catch (error) {
      console.error("Error compressing image:", error);
      toast.error(t("common:common.error_occurred", "Помилка обробки фото"));
      setIsCompressing(false); // В разі помилки теж зупиняємо
    }
  };

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoFile(null);
    setPhotoPreview(null);
    if (initialData?.photo_url) setRemovePhoto(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getPayload = (): WishlistItemFormData => ({
    id: initialData?.id,
    name: name.trim(),
    price: price ? Math.round(parseFloat(price) * 100) : null,
    currency,
    url: url.trim(),
    priority,
    group_id: groupId || null,
    status: "planning",
    visibility: "public",
    photoFile,
    removePhoto,
  });

  return {
    state: {
      name,
      price,
      currency,
      url,
      priority,
      groupId,
      photoPreview,
      isDirty,
      isCompressing, // 🔥 Експортуємо стан
    },
    actions: {
      setName,
      setPrice,
      setCurrency,
      setUrl,
      setPriority,
      setGroupId,
    },
    handlers: { handleFileSelect, handleRemovePhoto, getPayload },
    fileInputRef,
  };
};

// --- ХУК ДЛЯ ПАПОК (GROUPS) ---
export const useWishlistGroupForm = (initialData?: Partial<WishlistGroup>) => {
  const [name, setName] = useState(initialData?.name || "");
  const [color, setColor] = useState(
    initialData?.color || DEFAULT_WISHLIST_GROUP_COLOR,
  );
  const [icon, setIcon] = useState(initialData?.icon || "HiFolder");
  const [visibility, setVisibility] = useState(
    initialData?.visibility || "public",
  );

  const [hiddenFromIds, setHiddenFromIds] = useState<string[]>(
    initialData?.hidden_from ? initialData.hidden_from.split(",") : [],
  );

  const isDirty = initialData
    ? name !== initialData.name ||
      color !== initialData.color ||
      icon !== initialData.icon ||
      visibility !== (initialData.visibility || "public") ||
      hiddenFromIds.join(",") !== (initialData.hidden_from || "")
    : !!name ||
      icon !== "HiFolder" ||
      color !== DEFAULT_WISHLIST_GROUP_COLOR ||
      visibility !== "public" ||
      hiddenFromIds.length > 0;

  const toggleHiddenUser = (userId: string) => {
    setHiddenFromIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const getPayload = (): WishlistGroupFormData => ({
    id: initialData?.id,
    name: name.trim(),
    color,
    icon,
    visibility,
    hiddenFromStr: hiddenFromIds.join(","),
  });

  return {
    state: { name, color, icon, visibility, hiddenFromIds, isDirty },
    actions: { setName, setColor, setIcon, setVisibility, setHiddenFromIds },
    handlers: { toggleHiddenUser, getPayload },
  };
};
