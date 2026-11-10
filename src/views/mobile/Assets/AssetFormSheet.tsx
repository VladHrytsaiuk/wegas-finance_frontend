import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { HiOutlineDocumentText, HiOutlinePhoto, HiXMark } from "react-icons/hi2";
import { format } from "date-fns";
import styled from "styled-components";

import type { Asset } from "../../../types";
import {
  createAsset,
  deleteAsset,
  deleteAssetDocument,
  deleteAssetPhoto,
  updateAsset,
  uploadAssetDocument,
  uploadAssetPhoto,
} from "../../../services/apiAssets";
import { compressImage } from "../../../utils/compressor";
import { getUploadedFileUrl } from "../../../utils/helpers";
import { ConfirmSheet } from "../../../mobile/ui/ConfirmSheet";
import { Group, Meta, Row, Section } from "../../../mobile/ui/Group";
import { Segmented } from "../../../mobile/ui/Segmented";
import { PrimaryButton, Sheet } from "../../../mobile/ui/Sheet";
import {
  ASSET_TYPES,
  assetPhotos,
  fromDateInput,
  isCar,
  isRealEstate,
  isThing,
  toDateInput,
} from "./assets";

// Створення й зміна активу: тип, назва, ціна, дата покупки, гарантія й серійний
// номер (лише для речей), поля авто чи нерухомості, примітка, фото й документи.

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

const TextArea = styled.textarea`
  width: 100%;
  min-height: 72px;
  padding: 12px 16px;
  border: none;
  border-radius: var(--m-radius-group);
  background: var(--m-surface);
  outline: none;
  resize: none;
  font: inherit;
  font-size: 16px;
  color: var(--m-label);
  box-sizing: border-box;

  &::placeholder {
    color: var(--m-label-3);
  }
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Chip = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 14px;
  border: none;
  border-radius: 18px;
  font: inherit;
  font-size: 15px;
  cursor: pointer;
  color: ${(p) => (p.$active ? "var(--m-on-accent)" : "var(--m-label)")};
  background: ${(p) => (p.$active ? "var(--m-accent)" : "var(--m-surface)")};
`;

const Thumbs = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
`;

const Thumb = styled.div`
  position: relative;
  flex: 0 0 auto;
  width: 72px;
  height: 72px;
  border-radius: 12px;
  overflow: hidden;
  background: var(--m-fill);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  button {
    position: absolute;
    top: 4px;
    right: 4px;
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
    border: none;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.55);
    color: #fff;
    cursor: pointer;
  }
`;

const RemoveButton = styled.button`
  display: grid;
  place-items: center;
  padding: 4px;
  border: none;
  background: none;
  color: #ff3b30;
  cursor: pointer;
`;

const num = (value: string) => Number(value.replace(",", "."));

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset?: Asset;
}

export function AssetFormSheet({ open, onOpenChange, asset }: Props) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const photoInput = useRef<HTMLInputElement>(null);
  const docInput = useRef<HTMLInputElement>(null);

  const [type, setType] = useState(asset?.type || "electronics");
  const [name, setName] = useState(asset?.name ?? "");
  const [serial, setSerial] = useState(asset?.serial_number ?? "");
  const [price, setPrice] = useState(asset ? String(asset.price / 100) : "");
  const [currency, setCurrency] = useState(asset?.currency || "UAH");
  const [purchaseDate, setPurchaseDate] = useState(
    asset ? toDateInput(asset.purchase_date) : format(new Date(), "yyyy-MM-dd"),
  );
  const [warrantyEnd, setWarrantyEnd] = useState(toDateInput(asset?.warranty_end));
  const [note, setNote] = useState(asset?.note ?? "");
  const [vin, setVin] = useState(asset?.vin_code ?? "");
  const [mileage, setMileage] = useState(asset?.mileage ? String(asset.mileage) : "");
  const [insurance, setInsurance] = useState(toDateInput(asset?.insurance_expiry));
  const [service, setService] = useState(toDateInput(asset?.last_service_date));
  const [address, setAddress] = useState(asset?.address ?? "");
  const [area, setArea] = useState(asset?.area ? String(asset.area) : "");
  const [cadastral, setCadastral] = useState(asset?.cadastral_num ?? "");

  const [photos, setPhotos] = useState<File[]>([]);
  const [removedPhotos, setRemovedPhotos] = useState<string[]>([]);
  const [docs, setDocs] = useState<File[]>([]);
  const [removedDocs, setRemovedDocs] = useState<string[]>([]);
  const [compressing, setCompressing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const existingPhotos = (asset ? assetPhotos(asset) : []).filter(
    (p) => !removedPhotos.includes(p.path),
  );
  const existingDocs = (asset?.documents ?? []).filter((d) => !removedDocs.includes(d.id));
  const newPhotoUrls = useMemo(() => photos.map((f) => URL.createObjectURL(f)), [photos]);

  const priceNumber = num(price);
  const valid =
    name.trim() &&
    price.trim() !== "" &&
    Number.isFinite(priceNumber) &&
    priceNumber >= 0 &&
    !!purchaseDate &&
    !compressing &&
    !saving;

  const pickPhotos = async (files: File[]) => {
    const images = files.filter((f) => f.type.startsWith("image/"));
    if (!images.length) return;
    setCompressing(true);
    try {
      const compressed = await Promise.all(images.map((f) => compressImage(f)));
      setPhotos((prev) => [...prev, ...compressed]);
    } catch {
      toast.error("Не вдалося обробити фото");
    } finally {
      setCompressing(false);
    }
  };

  const save = async () => {
    if (!valid) return;
    setSaving(true);
    try {
      const body: Partial<Asset> = {
        name: name.trim(),
        type,
        price: Math.round(priceNumber * 100),
        currency,
        purchase_date: fromDateInput(purchaseDate),
        note: note.trim(),
        serial_number: isThing(type) ? serial.trim() : "",
        warranty_end: isThing(type) ? fromDateInput(warrantyEnd) : 0,
        ...(isCar(type)
          ? {
              vin_code: vin.trim(),
              mileage: mileage ? Math.round(num(mileage)) : 0,
              insurance_expiry: fromDateInput(insurance),
              last_service_date: fromDateInput(service),
            }
          : {}),
        ...(isRealEstate(type)
          ? { address: address.trim(), area: area ? num(area) : 0, cadastral_num: cadastral.trim() }
          : {}),
      };
      let id = asset?.id;
      if (asset) {
        // Поля, яких форма не показує, лишаються як були.
        await updateAsset(asset.id, { ...asset, ...body });
      } else {
        id = (await createAsset(body))?.id;
      }
      if (id) {
        await Promise.all(removedPhotos.map((path) => deleteAssetPhoto(id!, path)));
        await Promise.all(photos.map((file) => uploadAssetPhoto({ id: id!, file })));
        await Promise.all(removedDocs.map((docId) => deleteAssetDocument(id!, docId)));
        await Promise.all(docs.map((file) => uploadAssetDocument({ id: id!, file })));
      }
      await queryClient.invalidateQueries({ queryKey: ["assets"] });
      if (id) await queryClient.invalidateQueries({ queryKey: ["asset", id] });
      onOpenChange(false);
      if (!asset && id) navigate(`/assets/${id}`);
    } catch {
      toast.error("Не вдалося зберегти актив");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!asset) return;
    try {
      await deleteAsset(asset.id);
      await queryClient.invalidateQueries({ queryKey: ["assets"] });
      onOpenChange(false);
      navigate("/assets", { replace: true });
    } catch {
      toast.error("Не вдалося видалити актив");
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={asset ? "Актив" : "Новий актив"}
      footer={
        <PrimaryButton type="button" disabled={!valid} onClick={save}>
          {asset ? "Зберегти" : "Додати"}
        </PrimaryButton>
      }
    >
      <Section caption="Тип">
        <ChipRow role="group" aria-label="Тип активу">
          {ASSET_TYPES.map(({ value, label }) => (
            <Chip
              key={value}
              type="button"
              $active={type === value}
              aria-pressed={type === value}
              onClick={() => setType(value)}
            >
              {label}
            </Chip>
          ))}
        </ChipRow>
      </Section>

      <Group>
        <Row
          title={
            <Field
              $align="left"
              type="text"
              aria-label="Назва активу"
              placeholder="Назва"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus={!asset}
            />
          }
        />
        {isThing(type) && (
          <Row
            title="Серійний номер"
            trailing={
              <Field
                type="text"
                aria-label="Серійний номер"
                placeholder="S/N"
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
              />
            }
          />
        )}
      </Group>

      <Group>
        <Row
          title="Ціна покупки"
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
        <Row
          title="Дата покупки"
          trailing={
            <Field
              type="date"
              aria-label="Дата покупки"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
            />
          }
        />
        {isThing(type) && (
          <Row
            title="Гарантія до"
            trailing={
              <Field
                type="date"
                aria-label="Гарантія до"
                value={warrantyEnd}
                onChange={(e) => setWarrantyEnd(e.target.value)}
              />
            }
          />
        )}
      </Group>
      <Segmented
        label="Валюта"
        value={currency}
        onChange={setCurrency}
        options={CURRENCIES.map((c) => ({ value: c, label: c }))}
      />

      {isCar(type) && (
        <Section caption="Транспорт">
          <Group>
            <Row
              title="Пробіг, км"
              trailing={
                <Field
                  type="text"
                  inputMode="numeric"
                  aria-label="Пробіг"
                  placeholder="0"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value.replace(/\D/g, ""))}
                />
              }
            />
            <Row
              title="VIN-код"
              trailing={
                <Field
                  type="text"
                  aria-label="VIN-код"
                  value={vin}
                  onChange={(e) => setVin(e.target.value)}
                />
              }
            />
            <Row
              title="Страховка до"
              trailing={
                <Field
                  type="date"
                  aria-label="Страховка до"
                  value={insurance}
                  onChange={(e) => setInsurance(e.target.value)}
                />
              }
            />
            <Row
              title="Останнє ТО"
              trailing={
                <Field
                  type="date"
                  aria-label="Останнє ТО"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                />
              }
            />
          </Group>
        </Section>
      )}

      {isRealEstate(type) && (
        <Section caption="Нерухомість">
          <Group>
            <Row
              title="Адреса"
              trailing={
                <Field
                  type="text"
                  aria-label="Адреса"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              }
            />
            <Row
              title="Площа, м²"
              trailing={
                <Field
                  type="text"
                  inputMode="decimal"
                  aria-label="Площа"
                  value={area}
                  onChange={(e) => setArea(e.target.value.replace(/[^\d.,]/g, ""))}
                />
              }
            />
            <Row
              title="Кадастровий №"
              trailing={
                <Field
                  type="text"
                  aria-label="Кадастровий номер"
                  value={cadastral}
                  onChange={(e) => setCadastral(e.target.value)}
                />
              }
            />
          </Group>
        </Section>
      )}

      <TextArea
        aria-label="Примітка"
        placeholder="Примітка"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      {(existingPhotos.length > 0 || newPhotoUrls.length > 0) && (
        <Thumbs>
          {existingPhotos.map((p) => (
            <Thumb key={p.path}>
              <img src={getUploadedFileUrl(p.path)} alt="" />
              <button
                type="button"
                aria-label="Прибрати фото"
                onClick={() => setRemovedPhotos((prev) => [...prev, p.path])}
              >
                <HiXMark size={14} />
              </button>
            </Thumb>
          ))}
          {newPhotoUrls.map((url, index) => (
            <Thumb key={url}>
              <img src={url} alt="" />
              <button
                type="button"
                aria-label="Прибрати фото"
                onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== index))}
              >
                <HiXMark size={14} />
              </button>
            </Thumb>
          ))}
        </Thumbs>
      )}
      <Group>
        <Row
          onClick={() => photoInput.current?.click()}
          leading={<HiOutlinePhoto size={22} color="var(--m-accent)" />}
          title={compressing ? "Обробка фото…" : "Додати фото"}
          inset={50}
        />
        {existingDocs.map((doc) => (
          <Row
            key={doc.id}
            leading={<HiOutlineDocumentText size={22} color="var(--m-label-2)" />}
            title={doc.name}
            trailing={
              <RemoveButton
                type="button"
                aria-label={`Прибрати документ ${doc.name}`}
                onClick={() => setRemovedDocs((prev) => [...prev, doc.id])}
              >
                <HiXMark size={18} />
              </RemoveButton>
            }
            inset={50}
          />
        ))}
        {docs.map((file, index) => (
          <Row
            key={`${file.name}-${index}`}
            leading={<HiOutlineDocumentText size={22} color="var(--m-label-2)" />}
            title={file.name}
            trailing={
              <RemoveButton
                type="button"
                aria-label={`Прибрати документ ${file.name}`}
                onClick={() => setDocs((prev) => prev.filter((_, i) => i !== index))}
              >
                <HiXMark size={18} />
              </RemoveButton>
            }
            inset={50}
          />
        ))}
        <Row
          onClick={() => docInput.current?.click()}
          leading={<HiOutlineDocumentText size={22} color="var(--m-accent)" />}
          title="Додати документ"
          trailing={<Meta>PDF, DOC</Meta>}
          inset={50}
        />
      </Group>
      <input
        ref={photoInput}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          e.target.value = "";
          void pickPhotos(files);
        }}
      />
      <input
        ref={docInput}
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        multiple
        hidden
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          e.target.value = "";
          setDocs((prev) => [...prev, ...files]);
        }}
      />

      {asset && (
        <Group>
          <Row
            title={<span style={{ color: "#ff3b30" }}>Видалити актив</span>}
            onClick={() => setConfirmDelete(true)}
          />
        </Group>
      )}
      <ConfirmSheet
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        message={`Видалити актив «${asset?.name}»?`}
        actions={[{ label: "Видалити актив", destructive: true, onSelect: remove }]}
      />
    </Sheet>
  );
}
