import { createPortal } from "react-dom";
import {
  HiPlus,
  HiCheck,
  HiChevronDown,
  HiXMark,
  HiMagnifyingGlass,
} from "react-icons/hi2";
import { useTranslation } from "react-i18next";

// Custom Hook & Styles
import { useTagSelect } from "../../hooks/Tags/useTagSelect";
import * as S from "./TagSelect.styles";
import { focusNextElement } from "../../utils/focusUtils";

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
    state: { isOpen, search, style, filteredTags, exactMatch, selectedTags },
    actions,
    refs,
  } = useTagSelect(props);

  return (
    <S.Wrapper ref={refs.triggerRef}>
      {/* TRIGGER BUTTON */}
      <S.Trigger
        ref={refs.triggerBtnRef}
        type="button"
        $isOpen={isOpen}
        onClick={() => actions.setIsOpen(!isOpen)}
        onKeyDown={actions.handleTriggerKeyDown}
        tabIndex={0}
      >
        <S.ContentWrapper>
          {selectedTags.length > 0 ? (
            <div style={{ display: "flex", gap: "4px", overflow: "hidden" }}>
              {selectedTags.map((t) => (
                <S.TagBadge key={t.id} $color={t.color}>
                  {t.name}
                </S.TagBadge>
              ))}
            </div>
          ) : (
            <S.Placeholder>{t("settings:tagSelect.placeholder_default")}</S.Placeholder>
          )}
        </S.ContentWrapper>

        <S.IconWrapper>
          {selectedTags.length > 0 && (
            <S.ClearButton
              onClick={actions.handleClear}
              type="button"
              tabIndex={-1}
              title={t("legacy:filters.reset")}
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

      {/* PORTAL DROPDOWN */}
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
              maxHeight: "350px",
              overflow: "hidden",
            }}
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
                  placeholder={t("settings:tagSelect.search_placeholder")}
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

            {/* FOOTER */}
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
                    if (refs.triggerBtnRef.current) {
                      refs.triggerBtnRef.current.focus();
                      setTimeout(
                        () => focusNextElement(refs.triggerBtnRef.current),
                        0
                      );
                    }
                  }
                }}
              >
                {t("legacy:filters.done")}
              </S.FooterBtn>
            </S.FooterRow>
          </S.PortalMenu>,
          document.body
        )}
    </S.Wrapper>
  );
}
