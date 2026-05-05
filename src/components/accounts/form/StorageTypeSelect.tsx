import { createPortal } from "react-dom";
import {
  HiPlus,
  HiCheck,
  HiChevronDown,
  HiXMark,
  HiMagnifyingGlass,
  HiArchiveBox,
} from "react-icons/hi2";
import { useTranslation } from "react-i18next";

// Hooks & Styles
import { useStorageTypeSelect } from "../../../hooks/Accounts/useStorageTypeSelect";
import * as S from "./StorageTypeSelect.styles";

interface StorageTypeSelectProps {
  types: any[];
  value: string | null;
  onChange: (id: string) => void;
  onCreate: (name: string) => void;
  isLoading?: boolean;
}

export default function StorageTypeSelect(props: StorageTypeSelectProps) {
  const { t } = useTranslation();

  const {
    state: { isOpen, search, style, filteredTypes, exactMatch, selectedType },
    actions,
    refs,
  } = useStorageTypeSelect(props);

  return (
    <S.Wrapper ref={refs.triggerRef}>
      {/* TRIGGER */}
      {/* 🔥 ВИПРАВЛЕНО: Це тепер div, тому прибираємо type="button", додаємо role */}
      <S.Trigger
        role="button" // Щоб поводився як кнопка
        tabIndex={0} // Щоб працював фокус
        ref={refs.triggerBtnRef as any} // Каст ref, бо тепер це div
        $isOpen={isOpen}
        // 🔥 Додаємо stopPropagation, щоб клік не йшов вище
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          actions.setIsOpen(!isOpen);
        }}
        onKeyDown={actions.handleTriggerKeyDown}
      >
        <S.ContentWrapper>
          {selectedType ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <HiArchiveBox style={{ opacity: 0.6 }} />
              <span>{selectedType.name}</span>
            </div>
          ) : (
            <S.Placeholder>
              {t("accountForm.select_type_placeholder", "Оберіть тип...")}
            </S.Placeholder>
          )}
        </S.ContentWrapper>

        <S.IconWrapper>
          {selectedType && (
            <S.ClearButton
              onClick={actions.handleClear}
              type="button"
              // 🔥 Додаємо stopPropagation і сюди
              onMouseDown={(e) => e.stopPropagation()}
            >
              <HiXMark size={16} />
            </S.ClearButton>
          )}
          <HiChevronDown
            size={16}
            style={{
              transform: isOpen ? "rotate(180deg)" : "rotate(0)",
              transition: "transform 0.2s",
            }}
          />
        </S.IconWrapper>
      </S.Trigger>

      {/* DROPDOWN PORTAL */}
      {isOpen &&
        createPortal(
          <S.PortalMenu
            ref={refs.menuRef}
            onKeyDown={actions.handleMenuKeyDown}
            style={{
              top: style.top,
              left: style.left,
              width:
                typeof style.width === "number"
                  ? `${style.width}px`
                  : style.width || "100%",
              minWidth: "250px",
              maxHeight: "300px",
              overflow: "hidden",
            }}
            // Зупиняємо спливання кліків з меню
            onClick={(e) => e.stopPropagation()}
          >
            {/* SEARCH */}
            <S.SearchWrapper>
              <S.SearchInputContainer>
                <HiMagnifyingGlass
                  style={{
                    position: "absolute",
                    left: "8px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#9ca3af",
                  }}
                />
                <S.SearchInput
                  ref={refs.searchInputRef}
                  value={search}
                  onChange={(e) => actions.setSearch(e.target.value)}
                  placeholder={t("ui.search_placeholder_default")}
                  autoComplete="off"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (!exactMatch) actions.handleCreate();
                    }
                  }}
                />
              </S.SearchInputContainer>
            </S.SearchWrapper>

            {/* LIST */}
            <S.List>
              {filteredTypes.map((type) => (
                // 🔥 ВИПРАВЛЕНО: S.OptionItem замість неіснуючого S.TagItem
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
                  {t("tagSelect.create_button_with_name", { name: search })}
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
                  {t("common.no_options")}
                </div>
              )}
            </S.List>
          </S.PortalMenu>,
          document.body,
        )}
    </S.Wrapper>
  );
}
