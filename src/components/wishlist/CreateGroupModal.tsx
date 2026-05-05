import { useEffect, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { ColorIconPicker } from "../ui/ColorIconPicker";
import { BaseSelect } from "../ui/Select/BaseSelect";
import { useModal } from "../ui/Modal";
import { getFamilyMembers, getMeApi } from "../../services/apiUsers";
import * as S from "./WishlistModals.styles";
import { useWishlistGroupForm } from "../../hooks/Wishlist/useWishlistForms";

interface Props {
  onCloseModal?: () => void;
  onCreate: (
    name: string,
    color: string,
    icon: string,
    visibility: "public" | "private" | "hidden",
    hiddenFrom: string,
  ) => void;
}

export default function CreateGroupModal({ onCloseModal, onCreate }: Props) {
  const { t } = useTranslation();
  const { setIsDirty, close } = useModal();

  const { state, actions, handlers } = useWishlistGroupForm();

  const { data: familyMembers } = useQuery({
    queryKey: ["familyMembers"],
    queryFn: getFamilyMembers,
  });
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: getMeApi });
  const membersToHideFrom = familyMembers?.filter((m) => m.id !== me?.id) || [];

  useEffect(() => {
    setIsDirty(state.isDirty);
  }, [state.isDirty, setIsDirty]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!state.name.trim()) return;

    const payload = handlers.getPayload();
    onCreate(
      payload.name,
      payload.color,
      payload.icon,
      payload.visibility as any,
      payload.hiddenFromStr,
    );
    setIsDirty(false);
    close();
  };

  return (
    <S.ModalContainer style={S.ModalContainerOverrides}>
      <S.Header>
        <S.Title>{t("wishlist.create_group", "Створити папку")}</S.Title>
      </S.Header>
      <S.Content>
        <S.Form onSubmit={handleSubmit} id="create-group-form">
          <S.FieldGroup>
            <S.Label>{t("wishlist.group_name", "Назва папки")}</S.Label>
            <Input
              autoFocus
              required
              placeholder="Наприклад: Техніка"
              value={state.name}
              onChange={(e) => actions.setName(e.target.value)}
            />
          </S.FieldGroup>

          <S.FieldGroup>
            <S.Label>{t("common.privacy", "Хто бачить?")}</S.Label>
            <BaseSelect
              triggerLabel={
                state.visibility === "private"
                  ? t("shopping.private", "Тільки я")
                  : t("shopping.public", "Сім'я (всі)")
              }
            >
              <S.SelectOption
                $isSelected={state.visibility === "public"}
                onClick={() => {
                  actions.setVisibility("public");
                  actions.setHiddenFromIds([]);
                }}
              >
                {t("shopping.public", "Сім'я (всі)")}
              </S.SelectOption>
              <S.SelectOption
                $isSelected={state.visibility === "private"}
                onClick={() => {
                  actions.setVisibility("private");
                  actions.setHiddenFromIds([]);
                }}
              >
                {t("shopping.private", "Тільки я")}
              </S.SelectOption>
            </BaseSelect>
          </S.FieldGroup>

          {state.visibility === "public" && membersToHideFrom.length > 0 && (
            <S.FieldGroup>
              <S.Label>
                {t("common.hide_from", "Приховати від (опціонально)")}
              </S.Label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {membersToHideFrom.map((m) => (
                  <S.SelectOption
                    key={m.id}
                    $isSelected={state.hiddenFromIds.includes(m.id)}
                    onClick={() => handlers.toggleHiddenUser(m.id)}
                    style={{
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                      padding: "4px 10px",
                      backgroundColor: state.hiddenFromIds.includes(m.id)
                        ? "var(--color-brand-50)"
                        : "transparent",
                    }}
                  >
                    {m.name} {state.hiddenFromIds.includes(m.id) && " ✓"}
                  </S.SelectOption>
                ))}
              </div>
            </S.FieldGroup>
          )}

          <S.Section>
            <S.SectionTitle>
              {t("wishlist.appearance", "Оформлення")}
            </S.SectionTitle>
            <ColorIconPicker
              color={state.color}
              onColorChange={actions.setColor}
              icon={state.icon}
              onIconChange={actions.setIcon}
            />
          </S.Section>
        </S.Form>
      </S.Content>

      <S.FooterActions>
        <Button type="button" variation="secondary" onClick={onCloseModal}>
          {t("common.cancel")}
        </Button>
        <Button
          type="submit"
          variation="primary"
          disabled={!state.name.trim()}
          form="create-group-form"
        >
          {t("common.create")}
        </Button>
      </S.FooterActions>
    </S.ModalContainer>
  );
}
