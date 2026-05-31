import {
  HiOutlineArrowTrendingUp,
  HiOutlineArrowTrendingDown,
  HiTag,
} from "react-icons/hi2";

// UI Components
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { ColorPicker, IconPicker } from "../ui/ColorIconPicker";
import { BaseSelect } from "../ui/Select/BaseSelect";

// Logic & Styles
import {
  useCategoryForm,
  type Category,
} from "../../hooks/Categories/useCategoryForm";
import * as S from "./CategoryForm.styles";

interface CategoryFormProps {
  initialData?: Category;
  categories: Category[];
  onSubmit: (data: any, options?: any) => void;
  isLoading: boolean;
  buttonLabel?: string;
}

export function CategoryForm(props: CategoryFormProps) {
  const {
    formState: { name, type, icon, color, parentId, parentSearch },
    setters: {
      setName,
      setType,
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
  } = useCategoryForm(props);

  const parentTriggerLabel = selectedParent ? (
    <S.TriggerLabel>
      <S.TriggerIcon $color={selectedParent.color}>
        <HiTag />
      </S.TriggerIcon>
      <S.TriggerText>{selectedParent.name}</S.TriggerText>
    </S.TriggerLabel>
  ) : null;

  return (
    <S.FormContainer onSubmit={handleSubmit}>
      {/* 1. TYPE SELECTOR (Compact) */}
      <S.FormGroup>
        <S.Label>{t("categories:categoryForm.label_type")}</S.Label>
        <S.TypeGrid>
          <S.TypeCard
            $active={type === "expense"}
            $color="#ef4444"
            onClick={() => setType("expense")}
            type="button"
          >
            <HiOutlineArrowTrendingDown />
            <span>{t("categories:categoryForm.type_expense")}</span>
          </S.TypeCard>
          <S.TypeCard
            $active={type === "income"}
            $color="#22c55e"
            onClick={() => setType("income")}
            type="button"
          >
            <HiOutlineArrowTrendingUp />
            <span>{t("categories:categoryForm.type_income")}</span>
          </S.TypeCard>
        </S.TypeGrid>
      </S.FormGroup>

      {/* 2. NAME + ICON + COLOR (Combined Row) */}
      <S.CompactInputRow>
        <S.FormGroup style={{ flex: 1 }}>
          <S.Label>{t("categories:categoryForm.label_name")}</S.Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("categories:categoryForm.placeholder_name")}
            required
          />
        </S.FormGroup>

        <S.FormGroup style={{ flex: "0 0 auto" }}>
          <S.Label>{t("goals_debts:goals.label_icon")}</S.Label>
          <IconPicker
            icon={icon}
            onIconChange={setIcon}
            color={color}
            square
          />
        </S.FormGroup>

        <S.FormGroup style={{ flex: "0 0 auto" }}>
          <S.Label>{t("goals_debts:goals.label_color")}</S.Label>
          <ColorPicker color={color} onColorChange={setColor} square />
        </S.FormGroup>
      </S.CompactInputRow>

      {/* 3. PARENT CATEGORY (Full Width) */}
      <S.FormGroup>
        <S.Label>{t("categories:categoryForm.label_parent")}</S.Label>
        <BaseSelect
          triggerLabel={parentTriggerLabel}
          placeholder={t("categories:categoryForm.placeholder_parent_default")}
          onClear={parentId ? () => setParentId("") : undefined}
        >
          <S.SearchWrapper>
            <Input
              autoFocus
              placeholder={t("categories:categoryForm.placeholder_search")}
              value={parentSearch}
              onChange={(e) => setParentSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              style={{ fontSize: "0.9rem", padding: "0.4rem 0.6rem" }}
            />
          </S.SearchWrapper>

          <S.ScrollableList>
            {filteredRoots.length > 0 ? (
              filteredRoots.map((cat) => (
                <S.ListItem
                  key={cat.id}
                  onClick={() => handleParentSelect(cat.id)}
                >
                  <HiTag size={14} style={{ color: cat.color }} />
                  {cat.name}
                </S.ListItem>
              ))
            ) : (
              <S.EmptyState>
                {t("categories:categoryForm.search_not_found")}
              </S.EmptyState>
            )}
          </S.ScrollableList>
        </BaseSelect>
      </S.FormGroup>

      {/* FOOTER */}
      <S.Footer>
        <Button type="button" variation="secondary" onClick={close}>
          {t("categories:categoryForm.button_cancel")}
        </Button>
        <Button type="submit" disabled={props.isLoading}>
          {props.buttonLabel || t("categories:categoryForm.button_save_default")}
        </Button>
      </S.Footer>
    </S.FormContainer>
  );
}
