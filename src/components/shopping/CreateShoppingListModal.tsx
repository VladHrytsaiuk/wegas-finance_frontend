import React, { useState } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/Button";
import { NoteOptions } from "./NoteOptions";
import { DEFAULT_NOTE_COLOR } from "../../utils/constants";
import type { ShoppingVisibility } from "../../hooks/Shopping/useShoppingPage";

const StyledModal = styled.div<{ $color: string }>`
  padding: 1.5rem;
  background-color: ${props => props.$color};
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 400px;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-main);
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background-color: var(--color-bg-surface);
  color: var(--color-text-main);
  font-size: 1rem;
  outline: none;

  &:focus {
    border-color: var(--color-brand-500);
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

interface CreateShoppingListModalProps {
  onCreate: (
    title: string,
    color: string,
    visibility: ShoppingVisibility,
    hiddenFrom: string,
  ) => void | Promise<unknown>;
  onClose: () => void;
}

export const CreateShoppingListModal = ({ onCreate, onClose }: CreateShoppingListModalProps) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [color, setColor] = useState(DEFAULT_NOTE_COLOR);
  const [visibility, setVisibility] = useState<"public" | "private" | "hidden">("public");
  const [hiddenFrom, setHiddenFrom] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && !isCreating) {
      setIsCreating(true);
      try {
        const openedNew = await onCreate(title.trim(), color, visibility, hiddenFrom);
        if (!openedNew) {
          onClose();
        }
      } catch {
        setIsCreating(false);
      }
    }
  };

  return (
    <StyledModal $color={color}>
      <ModalHeader>
        <ModalTitle>{t("shopping_wishlist:shopping.new_list", "Створити список")}</ModalTitle>
      </ModalHeader>

      <Input 
        autoFocus
        disabled={isCreating}
        placeholder={t("shopping_wishlist:shopping.new_list_placeholder", "Назва списку...")}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <Footer>
        <NoteOptions
          color={color}
          visibility={visibility}
          hiddenFrom={hiddenFrom}
          onChangeColor={setColor}
          onChangeVisibility={(vis, hidden) => {
            setVisibility(vis);
            setHiddenFrom(hidden);
          }}
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variation="secondary" onClick={onClose} disabled={isCreating}>{t("common:common.cancel")}</Button>
          <Button variation="primary" onClick={handleSubmit} disabled={!title.trim() || isCreating}>
            {isCreating ? t("common:common.creating", "Створення...") : t("common:common.create")}
          </Button>
        </div>
      </Footer>
    </StyledModal>
  );
};
