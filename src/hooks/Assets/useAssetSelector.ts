import { useState, useRef, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { addYears } from "date-fns";
import { getAssets } from "../../services/apiAssets";
import { useDropdownPosition } from "../useDropdownPosition";
import { focusNextElement } from "../../utils/focusUtils";
import { type CreateAssetOnFlyInput } from "../../services/apiTransactions";

interface UseAssetSelectorProps {
  assetId: string;
  setAssetId: (id: string) => void;
  newAsset: CreateAssetOnFlyInput | null;
  setNewAsset: (asset: CreateAssetOnFlyInput | null) => void;
  transactionDate?: number;
}

export const useAssetSelector = ({
  assetId,
  setAssetId,
  newAsset,
  setNewAsset,
  transactionDate,
}: UseAssetSelectorProps) => {
  // Data State
  const { data: assets = [] } = useQuery({
    queryKey: ["assets"],
    queryFn: getAssets,
  });

  // UI State
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const triggerBtnRef = useRef<HTMLDivElement>(null);

  // Custom Hooks
  const { triggerRef, menuRef, style } = useDropdownPosition(
    isOpen,
    () => setIsOpen(false),
    "left",
    "auto",
  );

  // --- Calculations ---
  const selectedAssetName = useMemo(() => {
    return assets?.find((a: any) => String(a.id) === String(assetId))?.name;
  }, [assets, assetId]);

  const filteredAssets = useMemo(() => {
    if (!search) return assets;
    return assets.filter((a: any) =>
      a.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [assets, search]);

  // --- Effects ---
  // Initial Warranty Date logic
  useEffect(() => {
    if (newAsset && transactionDate) {
      const purchaseDate = new Date(transactionDate);
      const defaultWarranty = addYears(purchaseDate, 1).getTime();
      setNewAsset({ ...newAsset, warranty_end: defaultWarranty });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionDate]);

  // Focus Search on Open
  useEffect(() => {
    if (isOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
  }, [isOpen]);

  // --- Handlers ---
  const handleSelectAsset = (id: string) => {
    setNewAsset(null);
    setAssetId(id);
    setIsOpen(false);
    triggerBtnRef.current?.focus();
  };

  const handleStartCreate = () => {
    // If exact match found and no search text, don't create
    if (!search && filteredAssets.length > 0) return;

    setAssetId("");
    if (!newAsset) {
      const purchaseDate = new Date(transactionDate || Date.now());
      const defaultWarranty = addYears(purchaseDate, 1).getTime();
      setNewAsset({
        name: search || "",
        type: "electronics",
        serial_number: "",
        warranty_end: defaultWarranty,
        note: "",
        warrantyFiles: [],
      });
    }
    setSearch("");
    setIsEditing(true);
    setIsOpen(false);
  };

  const handleFinishEditing = (shouldSave: boolean) => {
    if (!shouldSave) {
      setNewAsset(null);
      setAssetId("");
    }
    setIsEditing(false);

    // Return focus to appropriate place
    setTimeout(() => {
      if (!shouldSave) triggerBtnRef.current?.focus();
      // Якщо зберегли - фокус вже оброблено в компоненті форми або тут можна додати логіку
    }, 0);
  };

  const handleMenuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      triggerBtnRef.current?.focus();
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      setIsOpen(false);
      // Move focus forward from trigger
      if (triggerBtnRef.current) {
        triggerBtnRef.current.focus();
        setTimeout(() => focusNextElement(triggerBtnRef.current), 0);
      }
      return;
    }

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      const focusableSelectors = "input, button";
      const menuElement = menuRef.current as HTMLElement;
      if (!menuElement) return;

      const allFocusable = Array.from(
        menuElement.querySelectorAll(focusableSelectors),
      ) as HTMLElement[];
      if (allFocusable.length === 0) return;

      const activeEl = document.activeElement as HTMLElement;
      const currentIndex = allFocusable.indexOf(activeEl);

      if (e.key === "ArrowDown") {
        e.preventDefault();
        // Skip first input if it's search and we are going down
        if (activeEl === searchInputRef.current && allFocusable.length > 1) {
          (allFocusable[1] as HTMLElement).focus();
          return;
        }
        const nextIndex =
          currentIndex + 1 < allFocusable.length ? currentIndex + 1 : 0;
        allFocusable[nextIndex]?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (currentIndex === 1) {
          searchInputRef.current?.focus();
          return;
        }
        const nextIndex =
          currentIndex - 1 >= 0 ? currentIndex - 1 : allFocusable.length - 1;
        allFocusable[nextIndex]?.focus();
      }
    }
  };

  return {
    state: {
      assets,
      isOpen,
      search,
      isEditing,
      selectedAssetName,
      filteredAssets,
      style,
    },
    actions: {
      setIsOpen,
      setSearch,
      setIsEditing,
      handleSelectAsset,
      handleStartCreate,
      handleFinishEditing,
      handleMenuKeyDown,
    },
    refs: {
      triggerRef,
      menuRef,
      triggerBtnRef,
      searchInputRef,
    },
  };
};
