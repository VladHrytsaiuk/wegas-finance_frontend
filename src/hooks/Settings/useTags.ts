import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { getTagsApi, createTagApi, deleteTagApi } from "../../services/apiTags";
import type { FilterOption } from "../../components/shared/TableToolbar/types";

export const useTags = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // --- State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");

  // --- Data Fetching ---
  const { data: tags = [], isLoading } = useQuery({
    queryKey: ["tags"],
    queryFn: getTagsApi,
  });

  // --- Mutations ---
  const { mutate: create, isPending: isCreating } = useMutation({
    mutationFn: createTagApi,
    onSuccess: () => {
      toast.success(t("settings:tagsPage.alert_create_success"));
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
    onError: () => toast.error(t("settings:tagsPage.alert_create_error")),
  });

  const { mutate: remove, isPending: isDeleting } = useMutation({
    mutationFn: deleteTagApi,
    onSuccess: () => {
      toast.success(t("settings:tagsPage.alert_delete_success"));
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
    onError: () => toast.error(t("settings:tagsPage.alert_delete_error")),
  });

  // --- Filtering & Sorting Logic ---
  const filteredTags = useMemo(() => {
    if (!tags) return [];

    let result = tags.filter((tag: any) =>
      tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortBy === "name-asc") {
      result.sort((a: any, b: any) => a.name.localeCompare(b.name));
    } else if (sortBy === "name-desc") {
      result.sort((a: any, b: any) => b.name.localeCompare(a.name));
    }

    return result;
  }, [tags, searchQuery, sortBy]);

  // --- Configs ---
  const sortOptions: FilterOption[] = [
    { value: "default", label: t("settings:tagsPage.sort_default") },
    { value: "name-asc", label: t("settings:tagsPage.sort_name_asc") },
    { value: "name-desc", label: t("settings:tagsPage.sort_name_desc") },
  ];

  const handleClearAll = () => {
    setSearchQuery("");
    setSortBy("default");
  };

  return {
    state: {
      tags: filteredTags,
      isLoading,
      isCreating,
      isDeleting,
      searchQuery,
      sortBy,
    },
    actions: {
      create,
      remove,
      setSearchQuery,
      setSortBy,
      handleClearAll,
    },
    config: {
      sortOptions,
    },
    t,
  };
};
