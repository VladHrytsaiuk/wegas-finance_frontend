import { useMemo } from "react";
import { HiPlus } from "react-icons/hi2";

// Components & Utils
import { SmartIcon } from "../../utils/IconMap";
import { CounterpartyTree } from "./CounterpartyTree";
import Modal from "../ui/Modal";
import CounterpartyForm from "./form";
import { useCounterpartySelect } from "../../hooks/Counterparties/useCounterpartySelect";
import { BaseSelect } from "../ui/Select/BaseSelect";

// Styles
import * as S from "./CounterpartySelect.styles";

interface CounterpartySelectProps {
  counterparties?: any[];
  value: string;
  onChange: (id: string) => void;
  hasError?: boolean;
  type?: "person" | "shop" | "other";
  initialExpanded?: string[];
  priorityCategoryId?: string;
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
    state: { searchQuery },
    setters: { setSearchQuery },
    refs: { hiddenModalTriggerRef },
    data: { treeData, selectedCP, displayIconName, defaultExpandedIds: hookDefaultExpandedIds, actions },
    handlers: { handleSelect, handleClear, launchCreateModal },
    t,
  } = useCounterpartySelect(props);

  // --- ЛОГІКА РОЗКРИТТЯ ---
  const expandedIds = useMemo(() => {
    if (searchQuery) {
      return getAllRecursiveIds(treeData);
    }
    return hookDefaultExpandedIds;
  }, [searchQuery, treeData, hookDefaultExpandedIds]);

  const triggerLabel = selectedCP ? (
    <S.TriggerContent>
      <S.IconWrapper
        $color={selectedCP.color}
        style={
          selectedCP.logo
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
        <SmartIcon
          logo={selectedCP.logo}
          iconName={displayIconName}
          size={18}
          color={selectedCP.color}
        />
      </S.IconWrapper>

      <S.LabelText>{selectedCP.name}</S.LabelText>
    </S.TriggerContent>
  ) : null;

  return (
    <Modal>
      <S.HiddenTrigger>
        <Modal.Open opens="quick-create-cp-select">
          <button ref={hiddenModalTriggerRef} type="button">
            HIDDEN TRIGGER
          </button>
        </Modal.Open>
      </S.HiddenTrigger>

      <BaseSelect
        triggerLabel={triggerLabel}
        placeholder={t("counterparties:counterpartySelect.placeholder_default")}
        onClear={props.value ? handleClear : undefined}
        hasError={props.hasError}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        menuWidth="350px"
      >
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
      </BaseSelect>

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
