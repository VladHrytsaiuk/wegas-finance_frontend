import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { getAssets, deleteAsset } from "../../services/apiAssets";
import { useHeader } from "../../context/HeaderContext";
import type { Asset } from "../../types";

export const useAssets = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setPageTitle, resetPageTitle } = useHeader();

  const currentLocale = i18n.language === "uk" ? "uk-UA" : "en-US";

  // --- Lifecycle & Title ---
  useEffect(() => {
    setPageTitle(t("assets:assetsPage.title"), t("assets:assetsPage.subtitle"));
    return () => resetPageTitle();
  }, [setPageTitle, resetPageTitle, t]);

  // --- Data Fetching ---
  const { data: assets, isLoading } = useQuery({
    queryKey: ["assets"],
    queryFn: getAssets,
  });

  // --- Mutations ---
  const deleteMutation = useMutation({
    mutationFn: deleteAsset,
    onSuccess: () => {
      toast.success(t("assets:assetsPage.alert_delete_success"));
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
    onError: () => {
      toast.error(t("assets:assetsPage.alert_delete_error"));
    },
  });

  // --- Handlers ---
  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleNavigateToDetails = (id: number) => {
    navigate(`/assets/${id}`);
  };

  // --- Helpers ---
  const formatPrice = (coins: number, currency: string) =>
    new Intl.NumberFormat(currentLocale, {
      style: "currency",
      currency,
    }).format(coins / 100);

  const formatDate = (ts: number) =>
    ts ? new Date(ts).toLocaleDateString(currentLocale) : "-";

  const isWarrantyExpired = (date: number) => Date.now() > date;

  // Нормалізація шляхів до фото для ReceiptViewer
  const getAssetImages = (item: Asset): string[] => {
    let images: string[] = [];

    if (item.photos && item.photos.length > 0) {
      images = item.photos.map((p: { path: string }) => p.path);
    } else if (item.photo) {
      images = [item.photo];
    }

    return images;
  };

  // 🔥 NEW: Хелпер для перекладу типів активів
  const getAssetTypeLabel = useCallback(
    (type: string) => {
      switch (type) {
        case "electronics":
          return t("assets:assetForm.type_electronics");
        case "furniture":
          return t("assets:assetForm.type_furniture");
        case "car":
          return t("assets:assetForm.type_car");
        case "real_estate":
          return t("assets:assetForm.type_real_estate");
        case "other":
          return t("assets:assetForm.type_other");
        default:
          return type;
      }
    },
    [t],
  );

  return {
    state: {
      assets,
      isLoading,
      isDeleting: deleteMutation.isPending,
    },
    actions: {
      handleDelete,
      handleNavigateToDetails,
    },
    helpers: {
      formatPrice,
      formatDate,
      isWarrantyExpired,
      getAssetImages,
      getAssetTypeLabel,
    },
    t,
  };
};
