import { useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

import { getAssetById, deleteAsset } from "../../services/apiAssets";
import { getTransactionsApi } from "../../services/apiTransactions";
import { getCategoriesApi } from "../../services/apiCategories";
import { useHeader } from "../../context/HeaderContext";
import { useSettings } from "../../context/SettingsContext";
import type { Asset } from "../../types";

// 🔥 Імпортуємо твої чисті функції утиліт (підправ шлях до файлу)
import {
  formatMoney,
  formatDate as formatDateUtil,
  getUploadedFileUrl,
} from "../../utils/helpers";

export const useAssetDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { setPageTitle } = useHeader();
  const { currency: baseCurrency, language } = useSettings();
  const queryClient = useQueryClient();

  // --- API Queries ---
  const { data: asset, isLoading: isAssetLoading } = useQuery({
    queryKey: ["asset", id],
    queryFn: () => getAssetById(id!),
    enabled: !!id,
  });

  const { data: txData, isLoading: isTxLoading } = useQuery({
    queryKey: ["transactions", { asset_id: id }],
    queryFn: () => getTransactionsApi({ asset_id: id, limit: 100 }),
    enabled: !!id,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategoriesApi,
  });

  // --- Mutations ---
  const deleteMutation = useMutation({
    mutationFn: deleteAsset,
    onSuccess: () => {
      toast.success(t("assets:assetDetails.alert_delete_success"));
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      navigate("/assets");
    },
    onError: () => toast.error(t("assets:assetDetails.alert_delete_error")),
  });

  // --- Effects ---
  useEffect(() => {
    if (asset) {
      setPageTitle(t("accounts:accountDetailsPage.subtitle"), asset.name);
    }
  }, [asset, setPageTitle, t]);

  // --- Calculations ---
  const stats = useMemo(() => {
    if (!asset || !txData?.data) return { purchase: 0, maintenance: 0, tco: 0 };

    const transactions = txData.data;
    const purchasePrice = asset.price;

    const maintenance = transactions
      .filter(
        (t: any) => t.type === "expense" && t.date > asset.purchase_date + 1000,
      )
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const incomeFromAsset = transactions
      .filter((t: any) => t.type === "income")
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    return {
      purchase: purchasePrice,
      maintenance,
      tco: purchasePrice + maintenance - incomeFromAsset,
    };
  }, [asset, txData]);

  const calculateWarranty = (start: number, end: number) => {
    if (!end || !start) return null;
    const now = Date.now();
    const totalDuration = end - start;
    const elapsed = now - start;

    let percent = totalDuration > 0 ? (elapsed / totalDuration) * 100 : 0;
    percent = Math.max(0, Math.min(100, percent));

    const isExpired = now > end;
    const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

    let statusColor = "green";
    if (isExpired) statusColor = "red";
    else if (percent > 85) statusColor = "orange";

    return { percent, isExpired, daysLeft: Math.max(0, daysLeft), statusColor };
  };

  // --- Helpers ---

  // Використовуємо твою утиліту для грошей, передаючи їй мову з контексту
  const formatPrice = (coins: number, currency: string) => {
    return formatMoney(coins, currency, language, false);
  };

  // Використовуємо твою утиліту для дати (date-fns) для одноманітності
  const formatDate = (ts: number) => {
    if (!ts) return "—";
    return formatDateUtil(ts, language);
  };

  const getAssetImages = (): string[] => {
    if (!asset) return [];

    const pathSet = new Set<string>();

    if (asset.photo) {
      pathSet.add(asset.photo);
    }

    if (asset.photos && asset.photos.length > 0) {
      asset.photos.forEach((p: any) => {
        if (p.path) pathSet.add(p.path);
      });
    }

    const uniquePaths = Array.from(pathSet);

    return uniquePaths.map((p) => getUploadedFileUrl(p) as string);
  };

  const images = getAssetImages();
  const mainPhotoUrl = images.length > 0 ? images[0] : null;

  return {
    state: {
      asset: asset as Asset,
      transactions: txData?.data || [],
      categories,
      isLoading: isAssetLoading || isTxLoading,
      isDeleting: deleteMutation.isPending,
      stats,
      warrantyInfo: asset
        ? calculateWarranty(asset.purchase_date, asset.warranty_end)
        : null,
      baseCurrency,
      language,
      images,
      mainPhotoUrl,
    },
    actions: {
      handleDelete: (id: number) => deleteMutation.mutate(id),
      navigate,
    },
    helpers: {
      formatPrice,
      formatDate,
    },
    t,
  };
};
