import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { addYears, format } from "date-fns";
import {
  HiCheck,
  HiOutlineComputerDesktop,
  HiOutlineCube,
  HiOutlineHome,
  HiOutlinePaperClip,
  HiOutlineTruck,
} from "react-icons/hi2";
import { MdOutlineChair } from "react-icons/md";
import styled from "styled-components";

import type { Asset } from "../../../types";
import { getAssets } from "../../../services/apiAssets";
import { Sheet, PrimaryButton } from "../../../mobile/ui/Sheet";
import { Section, Group, Row, Meta } from "../../../mobile/ui/Group";
import { SearchField } from "../../../mobile/ui/SearchField";
import { Tile } from "../../../mobile/ui/Tile";

// Актив операції: наявний або новий «на льоту» (лише для витрати — так створює
// бекенд, ціною стає сума операції). Поля нового — як у старій формі.

export interface NewAssetDraft {
  name: string;
  type: string;
  /** Кінець гарантії, мс; за замовчуванням — дата операції + 1 рік. */
  warranty_end?: number;
  files: File[];
}

const ASSET_TYPES: { value: string; label: string }[] = [
  { value: "electronics", label: "Електроніка" },
  { value: "furniture", label: "Меблі" },
  { value: "real_estate", label: "Нерухомість" },
  { value: "car", label: "Транспорт" },
  { value: "other", label: "Інше" },
];

const TYPE_ICON: Record<string, React.ReactNode> = {
  electronics: <HiOutlineComputerDesktop size={17} />,
  furniture: <MdOutlineChair size={17} />,
  real_estate: <HiOutlineHome size={17} />,
  car: <HiOutlineTruck size={17} />,
};

const assetIcon = (type?: string) => TYPE_ICON[type || ""] ?? <HiOutlineCube size={17} />;

const Check = styled(HiCheck)`
  width: 20px;
  height: 20px;
  color: var(--m-accent);
`;

const FieldInput = styled.input<{ $align?: "left" | "right" }>`
  flex: 1;
  width: 100%;
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

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Chip = styled.button<{ $active: boolean }>`
  height: 34px;
  padding: 0 14px;
  border: none;
  border-radius: 17px;
  font: inherit;
  font-size: 15px;
  cursor: pointer;
  color: ${(p) => (p.$active ? "var(--m-on-accent)" : "var(--m-label)")};
  background: ${(p) => (p.$active ? "var(--m-accent)" : "var(--m-surface)")};
`;

interface AssetPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assetId: string;
  newAsset: NewAssetDraft | null;
  /** Новий актив можна створити лише разом з витратою. */
  canCreate: boolean;
  /** Дата операції — для гарантії за замовчуванням. */
  operationDate: number;
  onChange: (assetId: string, newAsset: NewAssetDraft | null) => void;
}

export function AssetPicker({
  open,
  onOpenChange,
  assetId,
  newAsset,
  canCreate,
  operationDate,
  onChange,
}: AssetPickerProps) {
  const filesInput = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<NewAssetDraft | null>(null);
  const { data: assets = [] } = useQuery({ queryKey: ["assets"], queryFn: getAssets, enabled: open });

  const q = query.trim().toLowerCase();
  const filtered = assets.filter((a: Asset) => !q || a.name.toLowerCase().includes(q));

  const close = (next: boolean) => {
    if (!next) {
      setDraft(null);
      setQuery("");
    }
    onOpenChange(next);
  };

  const choose = (id: string, created: NewAssetDraft | null) => {
    onChange(id, created);
    close(false);
  };

  if (draft) {
    const warrantyEnd = draft.warranty_end ?? addYears(operationDate, 1).getTime();
    return (
      <Sheet
        nested
        open={open}
        onOpenChange={close}
        onCancel={() => setDraft(null)}
        title="Новий актив"
        footer={
          <PrimaryButton
            type="button"
            disabled={!draft.name.trim()}
            onClick={() => choose("", { ...draft, name: draft.name.trim(), warranty_end: warrantyEnd })}
          >
            Готово
          </PrimaryButton>
        }
      >
        <Group>
          <Row
            title={
              <FieldInput
                $align="left"
                type="text"
                aria-label="Назва активу"
                placeholder="Назва, напр. Ноутбук"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            }
          />
          <Row
            title="Гарантія до"
            trailing={
              <FieldInput
                type="date"
                aria-label="Гарантія до"
                value={format(warrantyEnd, "yyyy-MM-dd")}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    warranty_end: e.target.value ? new Date(`${e.target.value}T12:00:00`).getTime() : undefined,
                  })
                }
              />
            }
          />
          <Row
            onClick={() => filesInput.current?.click()}
            leading={<HiOutlinePaperClip size={20} color="var(--m-accent)" />}
            title="Гарантійні документи"
            trailing={<Meta>{draft.files.length ? `${draft.files.length} файл.` : "Додати"}</Meta>}
            inset={48}
          />
        </Group>
        <input
          ref={filesInput}
          type="file"
          accept="image/*,application/pdf"
          multiple
          hidden
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            e.target.value = "";
            setDraft({ ...draft, files: [...draft.files, ...files] });
          }}
        />
        <Section caption="Тип">
          <ChipRow role="group" aria-label="Тип активу">
            {ASSET_TYPES.map((t) => (
              <Chip
                key={t.value}
                type="button"
                $active={draft.type === t.value}
                aria-pressed={draft.type === t.value}
                onClick={() => setDraft({ ...draft, type: t.value })}
              >
                {t.label}
              </Chip>
            ))}
          </ChipRow>
        </Section>
      </Sheet>
    );
  }

  return (
    <Sheet nested open={open} onOpenChange={close} title="Актив">
      {assets.length > 8 && <SearchField value={query} onChange={setQuery} label="Пошук активу" />}
      {(canCreate || assetId || newAsset) && (
        <Group>
          {canCreate && (
            <Row
              onClick={() => setDraft(newAsset ?? { name: query.trim(), type: "other", files: [] })}
              title={newAsset ? `Новий: ${newAsset.name} — змінити` : "Новий актив"}
              inset={16}
            />
          )}
          {(assetId || newAsset) && <Row onClick={() => choose("", null)} title="Без активу" inset={16} />}
        </Group>
      )}
      {filtered.length > 0 && (
        <Group>
          {filtered.map((asset: Asset) => (
            <Row
              key={asset.id}
              onClick={() => choose(asset.id, null)}
              leading={<Tile icon={assetIcon(asset.type)} size={30} />}
              title={asset.name}
              subtitle={asset.type === "car" && asset.mileage ? `${asset.mileage.toLocaleString("uk-UA")} км` : undefined}
              trailing={asset.id === assetId ? <Check aria-label="Обрано" /> : undefined}
              inset={58}
            />
          ))}
        </Group>
      )}
    </Sheet>
  );
}
