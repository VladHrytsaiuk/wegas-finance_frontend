import { createPortal } from "react-dom";
import { useMemo } from "react";
import { HiMagnifyingGlass, HiXMark, HiPlus } from "react-icons/hi2";

// Components & Utils
import { SmartIcon } from "../../utils/IconMap";
import { CounterpartyTree } from "./CounterpartyTree";
import Modal from "../ui/Modal";
import CounterpartyForm from "./form";
import { useCounterpartySelect } from "../../hooks/Counterparties/useCounterpartySelect";

// Styles
import * as S from "./CounterpartySelect.styles";

interface CounterpartySelectProps {
  counterparties?: any[];
  value: string;
  onChange: (id: string) => void;
  hasError?: boolean;
  type?: "person" | "shop" | "other";
  initialExpanded?: string[];
  priorityCategoryId?: string; // 🔥 Додано
}

// --- HELPER FUNCTION ---
const getAllRecursiveIds = (nodes: any[]): string[] => {
  return nodes.reduce((acc, node) => {
    acc.push(String(node.id));
    if (node.children && node.children.length > 0) {
      acc.push(...getAllRecursiveIds(node.children));
    }
    return acc;
  }, [] as string[]);
};

export default function CounterpartySelect(props: CounterpartySelectProps) {
  const {
    state: { isOpen, searchQuery, imgError },
    setters: { setSearchQuery, setImgError },
    refs: {
      triggerRef,
      menuRef,
      searchInputRef,
      triggerBtnRef,
      hiddenModalTriggerRef,
    },
    data: {
      treeData,
      selectedCP,
      displayIconName,
      defaultExpandedIds: hookDefaultExpandedIds,
      style,
      actions,
    },
    handlers: {
      handleSelect,
      handleClear,
      launchCreateModal,
      handleTriggerKeyDown,
      handleInputKeyDown,
      handleMenuKeyDown,
      toggleOpen,
    },
    t,
  } = useCounterpartySelect(props);

  const getLogoUrl = (filename: string) => {
    if (!filename) return "";
    if (filename.startsWith("http")) return filename;
    return `/brands/${filename}`;
  };

  // --- ЛОГІКА РОЗКРИТТЯ ---
  const expandedIds = useMemo(() => {
    if (searchQuery) {
      return getAllRecursiveIds(treeData);
    }
    return hookDefaultExpandedIds;
  }, [searchQuery, treeData, hookDefaultExpandedIds]);

  return (
    <Modal>
      <S.HiddenTrigger>
        <Modal.Open opens="quick-create-cp-select">
          <button ref={hiddenModalTriggerRef} type="button">
            HIDDEN TRIGGER
          </button>
        </Modal.Open>
      </S.HiddenTrigger>

      <S.Wrapper ref={triggerRef as any}>
        <S.Trigger
          ref={triggerBtnRef}
          tabIndex={0}
          $isOpen={isOpen}
          $hasError={props.hasError}
          onClick={(e) => {
            e.preventDefault();
            toggleOpen();
          }}
          onKeyDown={handleTriggerKeyDown}
        >
          {selectedCP ? (
            <S.TriggerContent>
              <S.IconWrapper
                $color={selectedCP.color}
                style={
                  selectedCP.logo && !imgError
                    ? {
                        backgroundColor: "transparent",
                        padding: 0,
                        border: "1px solid rgba(0,0,0,0.1)",
                        overflow: "hidden",
                        width: "24px",
                        height: "24px",
                        flexShrink: 0,
                      }
                    : { width: "24px", height: "24px", flexShrink: 0 }
                }
              >
                {selectedCP.logo && !imgError ? (
                  <img
                    src={getLogoUrl(selectedCP.logo)}
                    alt={selectedCP.name}
                    onError={() => setImgError(true)}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <SmartIcon
                    iconName={displayIconName}
                    size={18}
                    color={selectedCP.color}
                  />
                )}
              </S.IconWrapper>

              <S.LabelText>{selectedCP.name}</S.LabelText>
            </S.TriggerContent>
          ) : (
            <S.Placeholder>
              {t("counterparties:counterpartySelect.placeholder_default")}
            </S.Placeholder>
          )}

          <S.IconsGroup>
            {selectedCP && (
              <S.ClearButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                type="button"
              >
                <HiXMark size={16} />
              </S.ClearButton>
            )}
            <S.ChevronIcon size={16} $isOpen={isOpen} />
          </S.IconsGroup>
        </S.Trigger>

        {isOpen &&
          createPortal(
            <S.PortalMenu
              ref={menuRef}
              onKeyDown={handleMenuKeyDown}
              style={{
                position: style.position,
                top: style.top,
                bottom: style.bottom,
                left: style.left,
                right: style.right,
                transformOrigin: style.transformOrigin,
                width: "350px",
                maxHeight: "506.234px",
                zIndex: 10050,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <S.SearchWrapper>
                <S.SearchInputContainer>
                  <S.SearchIconWrapper>
                    <HiMagnifyingGlass />
                  </S.SearchIconWrapper>
                  <S.SearchInput
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      props.type === "person"
                        ? t("counterparties:counterpartySelect.search_person")
                        : t("counterparties:counterpartySelect.search_placeholder")
                    }
                    onKeyDown={handleInputKeyDown}
                    autoComplete="off"
                  />
                </S.SearchInputContainer>
              </S.SearchWrapper>

              <S.ScrollArea>
                <CounterpartyTree
                  key={`${props.type || "all"}-${searchQuery}`}
                  nodes={treeData}
                  selectedId={props.value}
                  onSelect={(item: any) => {
                    if (item && item.id) handleSelect(String(item.id));
                  }}
                  defaultExpandedIds={expandedIds}
                />

                {treeData.length === 0 && (
                  <S.NotFoundMessage>
                    {t("counterparties:counterpartySelect.status_not_found")}
                  </S.NotFoundMessage>
                )}

                {searchQuery && (
                  <S.CreateActionBtn
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      launchCreateModal();
                    }}
                  >
                    <HiPlus />
                    {t("counterparties:counterpartySelect.create_new")} "{searchQuery}"
                  </S.CreateActionBtn>
                )}
              </S.ScrollArea>
            </S.PortalMenu>,
            document.body,
          )}
      </S.Wrapper>

      <Modal.Window name="quick-create-cp-select">
        <S.ModalContent
          onKeyDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <CounterpartyForm
            defaultValues={{
              name: searchQuery,
              type: props.type || "other",
            }}
            onSubmit={(data) => {
              actions.createCp.mutateAsync(data).then((res) => {
                props.onChange(res.id);
                setSearchQuery("");
              });
            }}
            isLoading={actions.createCp.isPending}
          />
        </S.ModalContent>
      </Modal.Window>
    </Modal>
  );
}
