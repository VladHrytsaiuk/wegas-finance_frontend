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
  initialData: any;
  onUpdate: (
    id: string,
    name: string,
    color: string,
    icon: string,
    visibility: "public" | "private" | "hidden",
    hiddenFrom: string,
  ) => void;
}

export default function EditGroupModal({
  onCloseModal,
  initialData,
  onUpdate,
}: Props) {
  const { t } = useTranslation();
  const { setIsDirty, close } = useModal();

  const { state, actions, handlers } = useWishlistGroupForm(initialData);

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
    onUpdate(
      payload.id,
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
        <S.Title>{t("shopping_wishlist:wishlist.edit_group", "Редагувати папку")}</S.Title>
      </S.Header>
      <S.Content>
        <S.Form onSubmit={handleSubmit} id="edit-group-form">
          <S.FieldGroup>
            <S.Label>{t("shopping_wishlist:wishlist.group_name", "Назва папки")}</S.Label>
            <Input
              autoFocus
              required
              value={state.name}
              onChange={(e) => actions.setName(e.target.value)}
            />
          </S.FieldGroup>

          <S.FieldGroup>
            <S.Label>{t("common:common.privacy", "Хто бачить?")}</S.Label>
            <BaseSelect
              triggerLabel={
                state.visibility === "private"
                  ? t("shopping_wishlist:shopping.private", "Тільки я")
                  : t("shopping_wishlist:shopping.public", "Сім'я (всі)")
              }
            >
              <S.SelectOption
                $isSelected={state.visibility === "public"}
                onClick={() => {
                  actions.setVisibility("public");
                  actions.setHiddenFromIds([]);
                }}
              >
                {t("shopping_wishlist:shopping.public", "Сім'я (всі)")}
              </S.SelectOption>
              <S.SelectOption
                $isSelected={state.visibility === "private"}
                onClick={() => {
                  actions.setVisibility("private");
                  actions.setHiddenFromIds([]);
                }}
              >
                {t("shopping_wishlist:shopping.private", "Тільки я")}
              </S.SelectOption>
            </BaseSelect>
          </S.FieldGroup>

          {state.visibility === "public" && membersToHideFrom.length > 0 && (
            <S.FieldGroup>
              <S.Label>{t("common:common.hide_from", "Приховати від")}</S.Label>
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
              {t("shopping_wishlist:wishlist.appearance", "Оформлення")}
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
          {t("common:common.cancel")}
        </Button>
        <Button
          type="submit"
          variation="primary"
          disabled={!state.name.trim()}
          form="edit-group-form"
        >
          {t("common:common.save")}
        </Button>
      </S.FooterActions>
    </S.ModalContainer>
  );
}
