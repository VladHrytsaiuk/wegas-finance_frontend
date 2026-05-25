import { useEffect, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { HiGlobeAlt, HiLockClosed, HiEye, HiXMark } from "react-icons/hi2";

import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { ColorIconPicker } from "../ui/ColorIconPicker";
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
        <S.Title>{t("shopping_wishlist:wishlist.create_group")}</S.Title>
      </S.Header>
      <S.Content>
        <S.Form onSubmit={handleSubmit} id="create-group-form">
          {/* ROW 1: Basic Info */}
          <S.BasicInfoRow>
            <S.FieldGroup>
              <S.Label>{t("shopping_wishlist:wishlist.group_name")}</S.Label>
              <Input
                autoFocus
                required
                placeholder={t("shopping_wishlist:wishlist.group_name_placeholder", "e.g. Tech")}
                value={state.name}
                onChange={(e) => actions.setName(e.target.value)}
              />
            </S.FieldGroup>

            <S.FieldGroup>
              <S.Label>{t("shopping_wishlist:wishlist.appearance")}</S.Label>
              <S.InlineGroup>
                <ColorIconPicker
                  color={state.color}
                  onColorChange={actions.setColor}
                  icon={state.icon}
                  onIconChange={actions.setIcon}
                />
              </S.InlineGroup>
            </S.FieldGroup>
          </S.BasicInfoRow>

          {/* ROW 2: Visibility Toggles */}
          <S.SectionHeader>
            <HiGlobeAlt size={14} />
            {t("shopping_wishlist:wishlist.filter_visibility")}
          </S.SectionHeader>

          <S.ToggleGrid>
            <S.ToggleButton
              $isActive={state.visibility === "public"}
              onClick={() => {
                actions.setVisibility("public");
                actions.setHiddenFromIds([]);
              }}
            >
              <HiGlobeAlt size={20} />
              {t("shopping_wishlist:shopping.public")}
            </S.ToggleButton>

            <S.ToggleButton
              $isActive={state.visibility === "private"}
              onClick={() => {
                actions.setVisibility("private");
                actions.setHiddenFromIds([]);
              }}
            >
              <HiLockClosed size={20} />
              {t("shopping_wishlist:shopping.private")}
            </S.ToggleButton>
          </S.ToggleGrid>

          {/* ROW 3: Hide from Selection */}
          {state.visibility === "public" && membersToHideFrom.length > 0 && (
            <S.HideFromContainer>
              <S.HideFromLabel>
                <HiEye size={16} />
                {t("common:common.hide_from")}:
              </S.HideFromLabel>

              <S.TagContainer>
                {membersToHideFrom.map((m) => (
                  <S.UserPill
                    key={m.id}
                    $isSelected={state.hiddenFromIds.includes(m.id)}
                    onClick={() => handlers.toggleHiddenUser(m.id)}
                  >
                    {m.name}
                    {state.hiddenFromIds.includes(m.id) && " ✓"}
                  </S.UserPill>
                ))}
              </S.TagContainer>
            </S.HideFromContainer>
          )}
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
          form="create-group-form"
        >
          {t("common:common.create")}
        </Button>
      </S.FooterActions>
    </S.ModalContainer>
  );
}
