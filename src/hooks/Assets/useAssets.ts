import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { getAssets, deleteAsset } from "../../services/apiAssets";
import { useHeader } from "../../context/HeaderContext";
import type { Asset } from "../../types";

export const useAssets = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setPageTitle, resetPageTitle } = useHeader();

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
    new Intl.NumberFormat(t("common:common.locale", "uk-UA"), {
      style: "currency",
      currency,
    }).format(coins / 100);

  const formatDate = (ts: number) =>
    ts ? new Date(ts).toLocaleDateString(t("common:common.locale", "uk-UA")) : "-";

  const isWarrantyExpired = (date: number) => Date.now() > date;

  // Нормалізація шляхів до фото для ReceiptViewer
  const getAssetImages = (item: Asset): string[] => {
    let images: string[] = [];

    if (item.photos && item.photos.length > 0) {
      images = item.photos.map((p: any) => p.path);
    } else if (item.photo) {
      images = [item.photo];
    }

    return images;
  };

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
    },
    t,
  };
};
