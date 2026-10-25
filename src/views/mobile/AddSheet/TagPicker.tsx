import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HiCheck } from "react-icons/hi2";
import toast from "react-hot-toast";
import styled from "styled-components";

import { createTagApi, getTagsApi } from "../../../services/apiTags";
import { Sheet, SheetTextButton } from "../../../mobile/ui/Sheet";
import { Group, Row } from "../../../mobile/ui/Group";
import { SearchField } from "../../../mobile/ui/SearchField";

// Теги операції: кілька одразу, пошук і створення нового (колір як у старій формі).

const NEW_TAG_COLOR = "#6366f1";

const Check = styled(HiCheck)`
  width: 20px;
  height: 20px;
  color: var(--m-accent);
`;

const Dot = styled.span<{ $color: string }>`
  width: 12px;
  height: 12px;
  margin: 0 9px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${(p) => p.$color};
`;

interface TagPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string[];
  onChange: (ids: string[]) => void;
}

export function TagPicker({ open, onOpenChange, value, onChange }: TagPickerProps) {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const { data: tags = [] } = useQuery({ queryKey: ["tags"], queryFn: getTagsApi, enabled: open });

  const create = useMutation({
    mutationFn: (name: string) => createTagApi({ name, color: NEW_TAG_COLOR }),
    onSuccess: (tag) => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      onChange([...value, tag.id]);
      setQuery("");
    },
    onError: () => toast.error("Не вдалося створити тег"),
  });

  const q = query.trim();
  const filtered = tags.filter((t) => !q || t.name.toLowerCase().includes(q.toLowerCase()));
  const exists = tags.some((t) => t.name.toLowerCase() === q.toLowerCase());
  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);

  return (
    <Sheet
      nested
      open={open}
      onOpenChange={onOpenChange}
      title="Теги"
      hideCancel
      trailing={
        <SheetTextButton type="button" $bold onClick={() => onOpenChange(false)}>
          Готово
        </SheetTextButton>
      }
    >
      <SearchField value={query} onChange={setQuery} placeholder="Пошук або новий тег" label="Пошук тегу" />
      {q && !exists && (
        <Group>
          <Row
            onClick={() => create.mutate(q)}
            title={create.isPending ? "Додаємо…" : `Створити тег «${q}»`}
            inset={16}
          />
        </Group>
      )}
      {filtered.length > 0 && (
        <Group>
          {filtered.map((tag) => (
            <Row
              key={tag.id}
              onClick={() => toggle(tag.id)}
              leading={<Dot $color={tag.color} />}
              title={tag.name}
              trailing={value.includes(tag.id) ? <Check aria-label="Обрано" /> : undefined}
              inset={46}
            />
          ))}
        </Group>
      )}
    </Sheet>
  );
}
