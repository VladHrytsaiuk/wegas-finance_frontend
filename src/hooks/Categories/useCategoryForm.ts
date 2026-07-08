import { useState, useMemo, FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useModal } from "../../components/ui/Modal";

// Types
export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  icon: string;
  parent_id?: string | null;
}

export interface CategoryFormData {
  name: string;
  type: "income" | "expense";
  icon: string;
  color: string;
  parent_id: string | null;
}

export interface FormSubmitOptions {
  onSuccess?: () => void;
}

interface UseCategoryFormProps {
  initialData?: Category;
  categories: Category[];
  onSubmit: (data: CategoryFormData, options?: FormSubmitOptions) => void;
}

const normalizeIconName = (iconName: string | undefined): string => {
  if (!iconName) return "HiTag";
  if (iconName.startsWith("Hi")) return iconName;
  // Convert kebab-case to PascalCase with Hi prefix if needed
  const pascal = iconName
    .replace(/-([a-z])/g, (g) => g[1].toUpperCase())
    .replace(/^[a-z]/, (g) => g.toUpperCase());
  return `Hi${pascal}`;
};

const getInitialCategoryFormState = (initialData?: Category) => ({
  name: initialData?.name || "",
  type: initialData?.type || "expense",
  icon: normalizeIconName(initialData?.icon),
  color: initialData?.color || "#10b981",
  parentId: initialData?.parent_id || "",
});

export function useCategoryForm({
  initialData,
  categories,
  onSubmit,
}: UseCategoryFormProps) {
  const { close } = useModal();
  const { t } = useTranslation();
  const initialState = getInitialCategoryFormState(initialData);

  // Form State
  const [name, setName] = useState(initialState.name);
  const [type, setType] = useState<"income" | "expense">(initialState.type);
  const [icon, setIcon] = useState(initialState.icon);
  const [color, setColor] = useState(initialState.color);
  const [parentId, setParentId] = useState(initialState.parentId);

  // Search State
  const [parentSearch, setParentSearch] = useState("");

  // Filtering Logic
  const rootCategories = useMemo(() => {
    return categories.filter((c) => !c.parent_id && c.id !== initialData?.id);
  }, [categories, initialData]);

  const filteredRoots = useMemo(() => {
    return rootCategories.filter(
      (c) =>
        c.type === type &&
        c.name.toLowerCase().includes(parentSearch.toLowerCase())
    );
  }, [rootCategories, type, parentSearch]);

  const selectedParent = categories.find((c) => c.id === parentId);

  // Handlers
  const handleTypeChange = (newType: "income" | "expense") => {
    setType(newType);
    setParentId(""); // Reset parent on type switch
    if (newType === "income") setColor("#22c55e");
    else setColor("#f97316");
  };

  const handleParentSelect = (id: string) => {
    setParentId(id);
    // TODO: Refactor BaseSelect to accept a ref or onClose prop instead of this hack
    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit(
      {
        name: name.trim(),
        type,
        icon,
        color,
        parent_id: parentId || null,
      },
      { onSuccess: () => close() }
    );
  };

  return {
    formState: { name, type, icon, color, parentId, parentSearch },
    setters: {
      setName,
      setType: handleTypeChange,
      setIcon,
      setColor,
      setParentId,
      setParentSearch,
    },
    logic: {
      filteredRoots,
      selectedParent,
      handleSubmit,
      handleParentSelect,
      close,
    },
    t,
  };
}
