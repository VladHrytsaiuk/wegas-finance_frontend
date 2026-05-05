import { useEffect, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { HiCloudArrowUp, HiXMark } from "react-icons/hi2";

import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { BaseSelect } from "../ui/Select/BaseSelect";
import type { WishlistGroup } from "../../types";
import { useModal } from "../ui/Modal";
import * as S from "./WishlistModals.styles";
import { useWishlistItemForm } from "../../hooks/Wishlist/useWishlistForms";
import Spinner from "../ui/Spinner";
import { getUploadedFileUrl } from "../../utils/helpers";

interface Props {
  onCloseModal?: () => void;
  groups: WishlistGroup[];
  initialData: any;
  onSave: (data: any) => void;
}

export default function EditWishModal({
  onCloseModal,
  groups,
  initialData,
  onSave,
}: Props) {
  const { t } = useTranslation();
  const { setIsDirty, close } = useModal();

  const { state, actions, handlers, refs } = useWishlistItemForm(initialData);

  useEffect(() => {
    setIsDirty(state.isDirty);
  }, [state.isDirty, setIsDirty]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!state.name.trim()) return;

    onSave(handlers.getPayload());
    setIsDirty(false);
    close();
  };

  return (
    <S.ModalContainer style={S.ModalContainerOverrides}>
      <S.Header>
        <S.Title>{t("shopping_wishlist:wishlist.edit_item", "Редагувати")}</S.Title>
      </S.Header>

      <S.Content>
        <S.Form onSubmit={handleSubmit} id="edit-wish-form">
          <S.ImageUploadContainer
            onClick={() => {
              // Блокуємо клік, якщо йде стиснення
              if (!state.isCompressing) refs.fileInputRef.current?.click();
            }}
          >
            {/* 🔥 Показуємо спінер, якщо йде стиснення 🔥 */}
            {state.isCompressing ? (
              <S.UploadPlaceholder>
                <Spinner size="3rem" /> {/* Розмір можеш підібрати сам */}
                <span style={{ marginTop: "8px" }}>
                  {t("common:common.loading", "Завантаження...")}
                </span>
              </S.UploadPlaceholder>
            ) : state.photoPreview ? (
              // Якщо фото є і не стискається
              <>
                <S.PreviewImage
                  src={getUploadedFileUrl(state.photoPreview)}
                  alt="Preview"
                />{" "}
                <S.RemovePhotoButton>
                  <Button
                    type="button"
                    variation="secondary"
                    onClick={handlers.handleRemovePhoto}
                    size="small"
                  >
                    <HiXMark size={14} />
                  </Button>
                </S.RemovePhotoButton>
              </>
            ) : (
              // Якщо фото немає
              <S.UploadPlaceholder>
                <HiCloudArrowUp />
                <span>{t("shopping_wishlist:wishlist.click_to_upload", "Фотографія")}</span>
              </S.UploadPlaceholder>
            )}
            <input
              type="file"
              ref={refs.fileInputRef}
              style={{ display: "none" }}
              accept="image/*"
              onChange={handlers.handleFileSelect}
            />
          </S.ImageUploadContainer>

          <S.FieldGroup>
            <S.Label>{t("shopping_wishlist:wishlist.item_name", "Назва")}</S.Label>
            <Input
              autoFocus
              required
              value={state.name}
              onChange={(e) => actions.setName(e.target.value)}
            />
          </S.FieldGroup>

          <S.Row>
            <S.FieldGroup>
              <S.Label>{t("shopping_wishlist:wishlist.price", "Ціна")}</S.Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={state.price}
                onChange={(e) => actions.setPrice(e.target.value)}
              />
            </S.FieldGroup>
            <S.FieldGroup>
              <S.Label>{t("common:common.currency", "Валюта")}</S.Label>
              <BaseSelect triggerLabel={state.currency}>
                {["UAH", "USD", "EUR"].map((c) => (
                  <S.SelectOption
                    key={c}
                    $isSelected={state.currency === c}
                    onClick={() => actions.setCurrency(c)}
                  >
                    {c}
                  </S.SelectOption>
                ))}
              </BaseSelect>
            </S.FieldGroup>
          </S.Row>

          <S.FieldGroup>
            <S.Label>{t("shopping_wishlist:wishlist.link", "URL")}</S.Label>
            <Input
              type="url"
              value={state.url}
              onChange={(e) => actions.setUrl(e.target.value)}
            />
          </S.FieldGroup>

          <S.HalfRow>
            <S.FieldGroup>
              <S.Label>{t("shopping_wishlist:wishlist.group", "Папка")}</S.Label>
              <BaseSelect
                triggerLabel={
                  state.groupId
                    ? groups.find((g) => g.id === state.groupId)?.name
                    : t("shopping_wishlist:wishlist.select_group_none", "Без папки")
                }
              >
                <S.SelectOption
                  $isSelected={state.groupId === ""}
                  onClick={() => actions.setGroupId("")}
                >
                  {t("shopping_wishlist:wishlist.select_group_none", "Без папки")}
                </S.SelectOption>
                {groups.map((g) => (
                  <S.SelectOption
                    key={g.id}
                    $isSelected={state.groupId === g.id}
                    onClick={() => actions.setGroupId(g.id)}
                  >
                    {g.name}
                  </S.SelectOption>
                ))}
              </BaseSelect>
            </S.FieldGroup>

            <S.FieldGroup>
              <S.Label>{t("shopping_wishlist:wishlist.priority", "Пріоритет")}</S.Label>
              <BaseSelect
                triggerLabel={
                  state.priority === 3
                    ? "🔥 " + t("shopping_wishlist:wishlist.priority_high")
                    : state.priority === 2
                      ? "⚡ " + t("shopping_wishlist:wishlist.priority_medium")
                      : "☕ " + t("shopping_wishlist:wishlist.priority_low")
                }
              >
                <S.SelectOption
                  $isSelected={state.priority === 1}
                  onClick={() => actions.setPriority(1)}
                >
                  ☕ {t("shopping_wishlist:wishlist.priority_low")}
                </S.SelectOption>
                <S.SelectOption
                  $isSelected={state.priority === 2}
                  onClick={() => actions.setPriority(2)}
                >
                  ⚡ {t("shopping_wishlist:wishlist.priority_medium")}
                </S.SelectOption>
                <S.SelectOption
                  $isSelected={state.priority === 3}
                  onClick={() => actions.setPriority(3)}
                >
                  🔥 {t("shopping_wishlist:wishlist.priority_high")}
                </S.SelectOption>
              </BaseSelect>
            </S.FieldGroup>
          </S.HalfRow>
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
          form="edit-wish-form"
        >
          {t("common:common.save")}
        </Button>
      </S.FooterActions>
    </S.ModalContainer>
  );
}
