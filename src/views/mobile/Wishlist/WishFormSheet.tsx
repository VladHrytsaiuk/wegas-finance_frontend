import { useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { HiCheck, HiOutlinePhoto, HiOutlineTrash } from "react-icons/hi2";
import styled from "styled-components";

import type { WishlistGroup, WishlistItem } from "../../../types";
import { compressImage } from "../../../utils/compressor";
import { getUploadedFileUrl } from "../../../utils/helpers";
import { Group, Meta, Row } from "../../../mobile/ui/Group";
import { Segmented } from "../../../mobile/ui/Segmented";
import { PrimaryButton, Sheet } from "../../../mobile/ui/Sheet";
import { PRIORITIES } from "./wishlist";
import { useWishlistActions } from "./useWishlistActions";

// Створення й зміна бажання: назва, посилання, ціна й валюта, група, пріоритет
// і фото. Статус і видимість наявного бажання не чіпаємо (стара форма скидала їх).

const CURRENCIES = ["UAH", "USD", "EUR"] as const;

const Field = styled.input<{ $align?: "left" | "right" }>`
  flex: 1;
  width: ${(p) => (p.$align === "left" ? "100%" : "40vw")};
  max-width: ${(p) => (p.$align === "left" ? "none" : "200px")};
  min-width: 0;
  border: none;
  background: none;
  outline: none;
  font: inherit;
  font-size: 17px;
  color: var(--m-label);
  text-align: ${(p) => p.$align ?? "right"};

  &::placeholder {
    color: var(--m-label-3);
  }
`;

const Preview = styled.img`
  display: block;
  width: 100%;
  max-height: 220px;
  object-fit: cover;
  border-radius: var(--m-radius-group);
  background: var(--m-fill);
`;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: WishlistGroup[];
  item?: WishlistItem;
  defaultGroupId?: string;
}

export function WishFormSheet({ open, onOpenChange, groups, item, defaultGroupId }: Props) {
  const { createItem, updateItem } = useWishlistActions();
  const photoInput = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(item?.name ?? "");
  const [url, setUrl] = useState(item?.url ?? "");
  const [price, setPrice] = useState(item?.price ? String(item.price / 100) : "");
  const [currency, setCurrency] = useState(item?.currency || "UAH");
  const [priority, setPriority] = useState(item?.priority || 1);
  const [groupId, setGroupId] = useState(item?.group_id || defaultGroupId || "");
  const [groupPicker, setGroupPicker] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);
  const [compressing, setCompressing] = useState(false);

  const preview = useMemo(
    () =>
      photoFile
        ? URL.createObjectURL(photoFile)
        : !photoRemoved && item?.photo_url
          ? getUploadedFileUrl(item.photo_url)
          : null,
    [photoFile, photoRemoved, item?.photo_url],
  );
  const group = groups.find((g) => g.id === groupId);
  const priceNumber = Number(price.replace(",", "."));
  const pending = createItem.isPending || updateItem.isPending;
  const canSave =
    name.trim().length > 0 &&
    (!price.trim() || (Number.isFinite(priceNumber) && priceNumber >= 0)) &&
    !compressing &&
    !pending;

  const pickPhoto = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Тільки зображення");
      return;
    }
    setCompressing(true);
    try {
      setPhotoFile(await compressImage(file));
      setPhotoRemoved(false);
    } catch {
      toast.error("Не вдалося обробити фото");
    } finally {
      setCompressing(false);
    }
  };

  const save = async () => {
    if (!canSave) return;
    const body = {
      name: name.trim(),
      url: url.trim(),
      price: price.trim() ? Math.round(priceNumber * 100) : null,
      currency,
      priority,
      group_id: groupId || null,
      photoFile,
    } as Partial<WishlistItem> & { photoFile: File | null };
    if (item) {
      await updateItem.mutateAsync({
        id: item.id,
        ...body,
        removePhoto: photoRemoved && !photoFile,
      });
    } else {
      await createItem.mutateAsync({ ...body, status: "planning", visibility: "public" });
    }
    onOpenChange(false);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={item ? "Бажання" : "Нове бажання"}
      footer={
        <PrimaryButton type="button" disabled={!canSave} onClick={save}>
          {item ? "Зберегти" : "Додати"}
        </PrimaryButton>
      }
    >
      {preview && <Preview src={preview} alt="" />}
      <Group>
        <Row
          title={
            <Field
              $align="left"
              type="text"
              aria-label="Назва бажання"
              placeholder="Що хочете?"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus={!item}
            />
          }
        />
        <Row
          title="Посилання"
          trailing={
            <Field
              type="url"
              inputMode="url"
              aria-label="Посилання"
              placeholder="https://…"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          }
        />
      </Group>

      <Group>
        <Row
          title="Ціна"
          trailing={
            <Field
              type="text"
              inputMode="decimal"
              aria-label="Ціна"
              placeholder="0,00"
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/[^\d.,]/g, ""))}
            />
          }
        />
      </Group>
      <Segmented
        label="Валюта"
        value={currency}
        onChange={setCurrency}
        options={CURRENCIES.map((c) => ({ value: c, label: c }))}
      />

      <Segmented
        label="Пріоритет"
        value={String(priority)}
        onChange={(v) => setPriority(Number(v))}
        options={[...PRIORITIES].reverse().map((p) => ({ value: String(p.value), label: p.label }))}
      />

      <Group>
        <Row
          title="Група"
          trailing={<Meta>{group?.name ?? "Без групи"}</Meta>}
          chevron
          onClick={() => setGroupPicker(true)}
        />
        <Row
          onClick={() => photoInput.current?.click()}
          leading={<HiOutlinePhoto size={22} color="var(--m-accent)" />}
          title={compressing ? "Обробка фото…" : preview ? "Змінити фото" : "Додати фото"}
          inset={50}
        />
        {preview && (
          <Row
            onClick={() => {
              setPhotoFile(null);
              setPhotoRemoved(true);
            }}
            leading={<HiOutlineTrash size={22} color="#ff3b30" />}
            title={<span style={{ color: "#ff3b30" }}>Прибрати фото</span>}
            inset={50}
          />
        )}
      </Group>
      <input
        ref={photoInput}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          void pickPhoto(file);
        }}
      />

      <Sheet
        nested
        open={groupPicker}
        onOpenChange={setGroupPicker}
        title="Група"
        hideCancel
      >
        <Group>
          <Row
            title="Без групи"
            trailing={!groupId ? <HiCheck size={18} color="var(--m-accent)" /> : undefined}
            onClick={() => {
              setGroupId("");
              setGroupPicker(false);
            }}
          />
          {groups.map((g) => (
            <Row
              key={g.id}
              title={g.name}
              trailing={g.id === groupId ? <HiCheck size={18} color="var(--m-accent)" /> : undefined}
              onClick={() => {
                setGroupId(g.id);
                setGroupPicker(false);
              }}
            />
          ))}
        </Group>
      </Sheet>
    </Sheet>
  );
}
