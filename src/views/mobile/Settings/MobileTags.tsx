import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { HiOutlineTag, HiPlus } from "react-icons/hi2";
import styled from "styled-components";

import type { Tag } from "../../../types";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { createTagApi, deleteTagApi, getTagsApi } from "../../../services/apiTags";
import { ConfirmSheet } from "../../../mobile/ui/ConfirmSheet";
import { RowInput } from "../../../mobile/ui/Field";
import { Group, Row, Section } from "../../../mobile/ui/Group";
import { ScreenState } from "../../../mobile/ui/Loader";
import { NavButton } from "../../../mobile/ui/NavBar";
import { ColorSwatches } from "../../../mobile/ui/AppearancePicker";
import { SearchField } from "../../../mobile/ui/SearchField";
import { PrimaryButton, Sheet } from "../../../mobile/ui/Sheet";
import { Tile } from "../../../mobile/ui/Tile";
import { PRESET_COLORS } from "../../../hooks/ui/useColorIconPicker";
import { CATALOG_SORTS, matches, sortByName, type CatalogSort } from "./catalog";
import { SettingsScreen } from "./SettingsScreen";
import { SortBar } from "./SortBar";

// Теги: список, пошук, сортування, новий тег (назва й колір), видалення.

const Empty = styled.p`
  margin: 0;
  padding: 24px 16px;
  border-radius: var(--m-radius-group);
  background: var(--m-surface);
  text-align: center;
  font-size: 15px;
  color: var(--m-label-2);
`;

function NewTagSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[5]);
  const create = useMutation({
    mutationFn: createTagApi,
    onSuccess: () => {
      toast.success("Тег створено");
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      onOpenChange(false);
    },
    onError: () => toast.error("Не вдалося створити тег"),
  });

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Новий тег"
      footer={
        <PrimaryButton type="button" disabled={!name.trim() || create.isPending} onClick={() => create.mutate({ name: name.trim(), color })}>
          Додати
        </PrimaryButton>
      }
    >
      <Section>
        <Group>
          <Row
            leading={<Tile icon={<HiOutlineTag size={18} />} color={color} size={30} />}
            title="Назва"
            trailing={<RowInput aria-label="Назва тегу" autoFocus value={name} onChange={(e) => setName(e.target.value)} />}
            inset={58}
          />
        </Group>
      </Section>
      <Section caption="Колір">
        <ColorSwatches color={color} onChange={setColor} />
      </Section>
    </Sheet>
  );
}

export default function MobileTags() {
  usePageTitle("Теги");
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<CatalogSort>("default");
  const [sortOpen, setSortOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [target, setTarget] = useState<Tag | null>(null);

  const { data: tags = [], isLoading } = useQuery<Tag[]>({ queryKey: ["tags"], queryFn: getTagsApi });
  const remove = useMutation({
    mutationFn: deleteTagApi,
    onSuccess: () => {
      toast.success("Тег видалено");
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
    onError: () => toast.error("Не вдалося видалити тег"),
  });

  const visible = useMemo(() => sortByName(tags.filter((t) => matches(t.name, query)), sort), [tags, query, sort]);

  return (
    <SettingsScreen
      title="Теги"
      trailing={
        <NavButton type="button" aria-label="Новий тег" onClick={() => setCreating(true)}>
          <HiPlus size={24} />
        </NavButton>
      }
    >
      {tags.length > 6 && <SearchField value={query} onChange={setQuery} label="Пошук тегів" />}
      {visible.length > 1 && <SortBar sort={sort} onOpen={() => setSortOpen(true)} />}

      {isLoading ? (
        <ScreenState loading>Завантаження…</ScreenState>
      ) : visible.length === 0 ? (
        <Empty>{tags.length === 0 ? "Тегів ще немає. Натисніть «+», щоб додати." : "Нічого не знайдено"}</Empty>
      ) : (
        <Section caption={`Теги · ${visible.length}`}>
          <Group>
            {visible.map((tag) => (
              <Row
                key={tag.id}
                onClick={() => setTarget(tag)}
                leading={<Tile icon={<HiOutlineTag size={18} />} color={tag.color} size={30} />}
                title={tag.name}
                inset={58}
              />
            ))}
          </Group>
        </Section>
      )}

      <ConfirmSheet
        open={sortOpen}
        onOpenChange={setSortOpen}
        message="Сортувати теги"
        actions={CATALOG_SORTS.map((s) => ({ label: s.value === sort ? `✓ ${s.label}` : s.label, onSelect: () => setSort(s.value) }))}
      />
      <ConfirmSheet
        open={!!target}
        onOpenChange={(o) => !o && setTarget(null)}
        message={`Тег «${target?.name}»`}
        actions={[{ label: "Видалити тег", destructive: true, onSelect: () => target && remove.mutate(target.id) }]}
      />
      {creating && <NewTagSheet open={creating} onOpenChange={(o) => !o && setCreating(false)} />}
    </SettingsScreen>
  );
}
