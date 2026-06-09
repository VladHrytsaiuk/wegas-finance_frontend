import { useTranslation } from "react-i18next";
import { HiPlus, HiCheck } from "react-icons/hi2";

// Custom Hook & Styles
import { useTagSelect } from "../../hooks/Tags/useTagSelect";
import * as S from "./TagSelect.styles";
import { BaseSelect } from "../ui/Select/BaseSelect";

interface TagSelectProps {
  tags: any[];
  value: string[];
  onChange: (ids: string[]) => void;
  onCreate: (name: string) => void;
  isCreating?: boolean;
}

export default function TagSelect(props: TagSelectProps) {
  const { t } = useTranslation();

  const {
    state: { search, filteredTags, exactMatch, selectedTags },
    actions,
    refs,
  } = useTagSelect(props);

  const triggerLabel =
    selectedTags.length > 0 ? (
      <div style={{ display: "flex", gap: "4px", overflow: "hidden" }}>
        {selectedTags.map((t) => (
          <S.TagBadge key={t.id} $color={t.color}>
            {t.name}
          </S.TagBadge>
        ))}
      </div>
    ) : null;

  return (
    <BaseSelect
      triggerLabel={triggerLabel}
      placeholder={t("settings:tagSelect.placeholder_default")}
      onClear={props.value.length > 0 ? actions.handleClear : undefined}
      searchValue={search}
      onSearchChange={actions.setSearch}
      isMulti={true}
    >
      <S.List>
        {filteredTags.map((tag) => {
          const isSelected = props.value.includes(tag.id);
          return (
            <S.TagItem
              key={tag.id}
              type="button"
              tabIndex={-1}
              $selected={isSelected}
              onClick={(e) => {
                e.preventDefault();
                actions.handleToggle(tag.id);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  actions.handleToggle(tag.id);
                }
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: tag.color || "#ccc",
                  }}
                />
                {tag.name}
              </div>
              {isSelected && (
                <HiCheck style={{ color: "var(--color-brand-600)" }} />
              )}
            </S.TagItem>
          );
        })}

        {search && !exactMatch && (
          <S.CreateActionBtn
            type="button"
            onClick={actions.handleCreate}
            disabled={props.isCreating}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                actions.handleCreate();
              }
            }}
          >
            <HiPlus />
            {props.isCreating
              ? t("settings:tagSelect.create_button_pending")
              : t("settings:tagSelect.create_button_with_name", { name: search })}
          </S.CreateActionBtn>
        )}

        {!search && props.tags.length === 0 && (
          <div
            style={{
              padding: "1rem",
              textAlign: "center",
              color: "gray",
              fontSize: "0.9rem",
            }}
          >
            {t("settings:tagSelect.status_empty")}
          </div>
        )}
      </S.List>

      <S.FooterRow>
        {props.value.length > 0 && (
          <S.FooterBtn
            $variant="secondary"
            type="button"
            onClick={() => props.onChange([])}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                props.onChange([]);
              }
            }}
          >
            {t("legacy:filters.reset")}
          </S.FooterBtn>
        )}
        <S.FooterBtn
          ref={refs.doneBtnRef}
          $variant="primary"
          type="button"
          onClick={() => actions.setIsOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              actions.setIsOpen(false);
            }
          }}
        >
          {t("legacy:filters.done")}
        </S.FooterBtn>
      </S.FooterRow>
    </BaseSelect>
  );
}
