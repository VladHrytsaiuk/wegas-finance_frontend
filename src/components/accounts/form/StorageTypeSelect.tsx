import { HiPlus, HiCheck, HiArchiveBox } from "react-icons/hi2";
import { useTranslation } from "react-i18next";

// Hooks & Styles
import { useStorageTypeSelect } from "../../../hooks/Accounts/useStorageTypeSelect";
import * as S from "./StorageTypeSelect.styles";
import { BaseSelect } from "../../ui/Select/BaseSelect";
import type { StorageType } from "../../../services/apiStorageTypes";

interface StorageTypeSelectProps {
  types: StorageType[];
  value: string | null;
  onChange: (id: string) => void;
  onCreate: (name: string) => void;
  isLoading?: boolean;
  hasError?: boolean;
}

export default function StorageTypeSelect(props: StorageTypeSelectProps) {
  const { t } = useTranslation();

  const {
    state: { search, filteredTypes, exactMatch, selectedType },
    actions,
  } = useStorageTypeSelect(props);

  const triggerLabel = selectedType ? (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <HiArchiveBox style={{ opacity: 0.6 }} />
      <span>{selectedType.name}</span>
    </div>
  ) : null;

  return (
    <BaseSelect
      triggerLabel={triggerLabel}
      placeholder={t(
        "accounts:accountForm.select_type_placeholder",
        "Оберіть тип...",
      )}
      onClear={props.value ? actions.handleClear : undefined}
      searchValue={search}
      onSearchChange={actions.setSearch}
      hasError={props.hasError}
    >
      <S.List>
        {filteredTypes.map((type) => (
          <S.OptionItem
            key={type.id}
            type="button"
            $selected={type.id === props.value}
            onClick={() => actions.handleSelect(type.id)}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <HiArchiveBox style={{ opacity: 0.5 }} />
              {type.name}
            </div>
            {type.id === props.value && (
              <HiCheck style={{ color: "var(--color-brand-600)" }} />
            )}
          </S.OptionItem>
        ))}

        {/* CREATE BUTTON */}
        {search && !exactMatch && (
          <S.CreateActionBtn type="button" onClick={actions.handleCreate}>
            <HiPlus />
            {t("settings:tagSelect.create_button_with_name", { name: search })}
          </S.CreateActionBtn>
        )}

        {!search && props.types.length === 0 && (
          <div
            style={{
              padding: "1rem",
              textAlign: "center",
              color: "gray",
              fontSize: "0.9rem",
            }}
          >
            {t("common:common.no_options")}
          </div>
        )}
      </S.List>
    </BaseSelect>
  );
}
