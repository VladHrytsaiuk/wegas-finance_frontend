import { Section } from "../../../mobile/ui/Group";
import { Chip, WrapRow } from "../../../mobile/ui/Chips";
import { PrimaryButton, Sheet, SheetTextButton } from "../../../mobile/ui/Sheet";
import {
  countFilters,
  EMPTY_ITEM_FILTERS,
  PRIORITIES,
  type ItemFilters,
} from "./wishlist";

// Фільтри бажань: статус, наявність, пріоритет, автор — усі, що були в старій панелі.

const SECTIONS: {
  key: keyof ItemFilters;
  caption: string;
  options: { value: string; label: string }[];
}[] = [
  {
    key: "status",
    caption: "Статус",
    options: [
      { value: "planning", label: "В планах" },
      { value: "bought", label: "Придбано" },
    ],
  },
  {
    key: "availability",
    caption: "Наявність",
    options: [
      { value: "available", label: "Вільні" },
      { value: "reserved_by_me", label: "Зарезервовані мною" },
    ],
  },
  {
    key: "priority",
    caption: "Пріоритет",
    options: PRIORITIES.map((p) => ({ value: String(p.value), label: p.label })),
  },
  {
    key: "author",
    caption: "Автор",
    options: [
      { value: "me", label: "Створені мною" },
      { value: "others", label: "Спільні" },
    ],
  },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: ItemFilters;
  onChange: (filters: ItemFilters) => void;
}

export function WishFilterSheet({ open, onOpenChange, filters, onChange }: Props) {
  const toggle = (key: keyof ItemFilters, value: string) =>
    onChange({
      ...filters,
      [key]: filters[key].includes(value)
        ? filters[key].filter((v) => v !== value)
        : [...filters[key], value],
    });

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Фільтри"
      hideCancel
      trailing={
        countFilters(filters) > 0 ? (
          <SheetTextButton type="button" onClick={() => onChange(EMPTY_ITEM_FILTERS)}>
            Скинути
          </SheetTextButton>
        ) : undefined
      }
      footer={
        <PrimaryButton type="button" onClick={() => onOpenChange(false)}>
          Готово
        </PrimaryButton>
      }
    >
      {SECTIONS.map((section) => (
        <Section key={section.key} caption={section.caption}>
          <WrapRow role="group" aria-label={section.caption}>
            {section.options.map((o) => (
              <Chip
                key={o.value}
                type="button"
                $active={filters[section.key].includes(o.value)}
                aria-pressed={filters[section.key].includes(o.value)}
                onClick={() => toggle(section.key, o.value)}
              >
                {o.label}
              </Chip>
            ))}
          </WrapRow>
        </Section>
      ))}
    </Sheet>
  );
}
