// src/hooks/Assets/useAssetForm.ts

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  createAsset,
  updateAsset,
  uploadAssetPhoto,
  deleteAssetPhoto,
  uploadAssetDocument, // 🔥 Додано
  deleteAssetDocument, // 🔥 Додано
} from "../../services/apiAssets";
import type { Asset, AssetDocument } from "../../types";
import { compressImage } from "../../utils/compressor";

const toDateInput = (ts?: number) =>
  ts ? new Date(ts).toISOString().split("T")[0] : "";

const toTimestamp = (dateStr?: string) =>
  dateStr ? new Date(dateStr).getTime() : 0;

interface UseAssetFormProps {
  assetToEdit?: Asset;
  onCloseModal?: () => void;
}

export const useAssetForm = ({
  assetToEdit,
  onCloseModal,
}: UseAssetFormProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // --- Стейт для ФОТО ---
  const [files, setFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<any[]>([]);
  const [photosToDelete, setPhotosToDelete] = useState<string[]>([]);

  // --- 🔥 Стейт для ДОКУМЕНТІВ ---
  const [docs, setDocs] = useState<File[]>([]); // Нові документи для завантаження
  const [existingDocs, setExistingDocs] = useState<AssetDocument[]>([]); // Існуючі з БД
  const [docsToDelete, setDocsToDelete] = useState<string[]>([]); // ID документів на видалення

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    trigger,
    formState: { errors, isDirty: isFormDirty },
  } = useForm({
    defaultValues: {
      name: "",
      serial_number: "",
      type: "electronics",
      price: "",
      currency: "UAH",
      purchase_date: new Date().toISOString().split("T")[0],
      warranty_end: "",
      note: "",
      vin_code: "",
      mileage: "",
      initial_mileage: "",
      insurance_expiry: "",
      last_service_date: "",
      address: "",
      area: "",
      cadastral_num: "",
    },
  });

  useEffect(() => {
    if (assetToEdit) {
      reset({
        name: assetToEdit.name,
        serial_number: assetToEdit.serial_number || "",
        type: assetToEdit.type,
        price: (assetToEdit.price / 100).toString(),
        currency: assetToEdit.currency,
        purchase_date: toDateInput(assetToEdit.purchase_date),
        warranty_end: toDateInput(assetToEdit.warranty_end),
        note: assetToEdit.note || "",
        vin_code: assetToEdit.vin_code || "",
        mileage: assetToEdit.mileage?.toString() || "",
        initial_mileage: assetToEdit.initial_mileage?.toString() || "",
        insurance_expiry: toDateInput(assetToEdit.insurance_expiry),
        last_service_date: toDateInput(assetToEdit.last_service_date),
        address: assetToEdit.address || "",
        area: assetToEdit.area?.toString() || "",
        cadastral_num: assetToEdit.cadastral_num || "",
      });

      // Підвантажуємо фотографії
      const loadedPhotos: any[] = [];
      if (assetToEdit.photos && assetToEdit.photos.length > 0) {
        loadedPhotos.push(...assetToEdit.photos);
      }
      const mainPhotoPath = assetToEdit.photo;
      if (mainPhotoPath) {
        const isAlreadyInGallery = loadedPhotos.some(
          (p) => p.path === mainPhotoPath,
        );
        if (!isAlreadyInGallery) {
          loadedPhotos.unshift({ path: mainPhotoPath });
        }
      }
      setExistingFiles(loadedPhotos);
      setPhotosToDelete([]);

      // 🔥 Підвантажуємо існуючі документи
      setExistingDocs(assetToEdit.documents || []);
      setDocsToDelete([]);
    }
  }, [assetToEdit, reset]);

  // Форма "брудна", якщо змінили інпути, додали/видалили фото або документи
  const isDirty =
    isFormDirty ||
    files.length > 0 ||
    photosToDelete.length > 0 ||
    docs.length > 0 ||
    docsToDelete.length > 0;

  const prepareData = (values: any) => {
    return {
      ...values,
      price: Number(values.price) * 100,
      purchase_date: toTimestamp(values.purchase_date),
      warranty_end: toTimestamp(values.warranty_end),
      mileage: values.mileage ? Number(values.mileage) : 0,
      initial_mileage: values.initial_mileage
        ? Number(values.initial_mileage)
        : 0,
      insurance_expiry: toTimestamp(values.insurance_expiry),
      last_service_date: toTimestamp(values.last_service_date),
      area: values.area ? Number(values.area) : 0,
    };
  };

  // --- Мутації ---
  const createMutation = useMutation({
    mutationFn: async (values: any) => createAsset(prepareData(values)),
    onError: () => toast.error(t("assets:assetForm.error_create")),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: any }) =>
      updateAsset(id, prepareData(values)),
    onError: () => toast.error(t("assets:assetForm.error_update")),
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: uploadAssetPhoto,
    onError: () =>
      toast.error(t("assets:assetForm.error_upload", "Помилка завантаження фото")),
  });

  const deletePhotoMutation = useMutation({
    mutationFn: async ({ id, path }: { id: string; path: string }) =>
      deleteAssetPhoto(id, path),
    onError: () =>
      toast.error(t("common:common.error_occurred", "Помилка видалення фото")),
  });

  // 🔥 Нові мутації для документів
  const uploadDocMutation = useMutation({
    mutationFn: uploadAssetDocument,
    onError: () =>
      toast.error(
        t("assets:assetForm.error_upload_doc", "Помилка завантаження документа"),
      ),
  });

  const deleteDocMutation = useMutation({
    mutationFn: async ({ id, docId }: { id: string; docId: string }) =>
      deleteAssetDocument(id, docId),
    onError: () =>
      toast.error(t("common:common.error_occurred", "Помилка видалення документа")),
  });

  // --- Хендлери для ФОТО ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsCompressing(true);
      try {
        const selectedFiles = Array.from(e.target.files);
        const compressedFiles = await Promise.all(
          selectedFiles.map((file) => compressImage(file)),
        );
        setFiles((prev) => [...prev, ...compressedFiles]);
      } catch (error) {
        console.error("Помилка стиснення:", error);
        toast.error(t("common:common.error_occurred", "Помилка обробки фотографій"));
      } finally {
        setIsCompressing(false);
        e.target.value = "";
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const removeExistingFile = (index: number) => {
    const fileToRemove = existingFiles[index];
    setExistingFiles((prev) => prev.filter((_, idx) => idx !== index));
    if (fileToRemove.path) {
      setPhotosToDelete((prev) => [...prev, fileToRemove.path]);
    }
  };

  // --- 🔥 Хендлери для ДОКУМЕНТІВ ---
  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Документи (PDF, DOC) ми не стискаємо, просто додаємо в стейт
      const selectedDocs = Array.from(e.target.files);
      setDocs((prev) => [...prev, ...selectedDocs]);
      e.target.value = ""; // Скидаємо інпут
    }
  };

  const removeDoc = (index: number) => {
    setDocs((prev) => prev.filter((_, idx) => idx !== index));
  };

  const removeExistingDoc = (index: number) => {
    const docToRemove = existingDocs[index];
    setExistingDocs((prev) => prev.filter((_, idx) => idx !== index));
    if (docToRemove.id) {
      // Для документів на беку ми видаляємо по ID, а не по шляху
      setDocsToDelete((prev) => [...prev, docToRemove.id]);
    }
  };

  // --- Сабміт форми ---
  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      let assetId = assetToEdit?.id;

      // 1. Оновлюємо або створюємо сам актив
      if (assetToEdit) {
        await updateMutation.mutateAsync({ id: assetId!, values: data });
      } else {
        const newAsset = await createMutation.mutateAsync(data);
        assetId = newAsset?.id;
      }

      if (assetId) {
        // --- ФОТОГРАФІЇ ---
        if (photosToDelete.length > 0) {
          await Promise.all(
            photosToDelete.map((path) =>
              deletePhotoMutation.mutateAsync({ id: assetId!, path }),
            ),
          );
        }
        if (files.length > 0) {
          await Promise.all(
            files.map((file) =>
              uploadPhotoMutation.mutateAsync({ id: assetId!, file }),
            ),
          );
        }

        // --- 🔥 ДОКУМЕНТИ ---
        if (docsToDelete.length > 0) {
          await Promise.all(
            docsToDelete.map((docId) =>
              deleteDocMutation.mutateAsync({ id: assetId!, docId }),
            ),
          );
        }
        if (docs.length > 0) {
          await Promise.all(
            docs.map((file) =>
              uploadDocMutation.mutateAsync({ id: assetId!, file }),
            ),
          );
        }
      }

      toast.success(
        assetToEdit
          ? t("assets:assetForm.alert_update_success")
          : t("assets:assetForm.alert_create_success"),
      );

      // Інвалідуємо кеш, щоб оновити дані всюди
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      if (assetToEdit) {
        queryClient.invalidateQueries({ queryKey: ["asset", assetToEdit.id] });
      }

      // Скидання стейтів
      reset();
      setFiles([]);
      setPhotosToDelete([]);
      setDocs([]);
      setDocsToDelete([]);
      onCloseModal?.();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form: {
      register,
      control,
      handleSubmit,
      errors,
      isSubmitting,
      watch,
      trigger,
    },
    // Управління фотографіями
    files: {
      list: files,
      existing: existingFiles,
      onChange: handleFileChange,
      onRemove: removeFile,
      onRemoveExisting: removeExistingFile,
      isCompressing,
    },
    // 🔥 Управління документами
    documents: {
      list: docs,
      existing: existingDocs,
      onChange: handleDocChange,
      onRemove: removeDoc,
      onRemoveExisting: removeExistingDoc,
    },
    actions: {
      onSubmit,
    },
    isDirty,
    t,
  };
};
