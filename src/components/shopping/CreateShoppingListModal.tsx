import React, { useState } from "react";
import styled from "styled-components";
import { HiPlus } from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/Button";
import { NoteOptions } from "./NoteOptions";
import { DEFAULT_NOTE_COLOR } from "../../utils/constants";

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
  onCreate: (title: string, color: string, visibility: string, hiddenFrom: string) => void;
  onClose: () => void;
}

export const CreateShoppingListModal = ({ onCreate, onClose }: CreateShoppingListModalProps) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [color, setColor] = useState(DEFAULT_NOTE_COLOR);
  const [visibility, setVisibility] = useState<"public" | "private" | "hidden">("public");
  const [hiddenFrom, setHiddenFrom] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onCreate(title.trim(), color, visibility, hiddenFrom);
      onClose();
    }
  };

  return (
    <StyledModal $color={color}>
      <ModalHeader>
        <ModalTitle>{t("shopping_wishlist:shopping.new_list", "Створити список")}</ModalTitle>
      </ModalHeader>

      <Input 
        autoFocus
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
            setVisibility(vis as any);
            setHiddenFrom(hidden);
          }}
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variation="secondary" onClick={onClose}>{t("common:common.cancel")}</Button>
          <Button variation="primary" onClick={handleSubmit} disabled={!title.trim()}>
            {t("common:common.create")}
          </Button>
        </div>
      </Footer>
    </StyledModal>
  );
};
