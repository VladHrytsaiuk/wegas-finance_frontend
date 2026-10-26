import { useState } from "react";
import { HiCheck } from "react-icons/hi2";
import styled from "styled-components";

import { PRESET_COLORS } from "../../hooks/ui/useColorIconPicker";
import { ICON_MAP, PICKER_ICON_NAMES } from "../../utils/IconConstants";
import { Section } from "./Group";
import { SearchField } from "./SearchField";
import { Sheet, SheetTextButton } from "./Sheet";

// Колір та іконка — ті самі набори, що й у старому ColorIconPicker.

const Colors = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
`;

const Swatch = styled.button<{ $color: string }>`
  display: grid;
  place-items: center;
  aspect-ratio: 1;
  border: none;
  border-radius: 50%;
  background: ${(p) => p.$color};
  color: #fff;
  cursor: pointer;
`;

const Icons = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
`;

const IconCell = styled.button<{ $active: boolean; $color: string }>`
  display: grid;
  place-items: center;
  aspect-ratio: 1;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  color: ${(p) => (p.$active ? "#fff" : p.$color)};
  background: ${(p) => (p.$active ? p.$color : "var(--m-surface)")};
`;

const iconLabel = (name: string) =>
  name
    .replace(/^(Hi|Lu)/, "")
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .toLowerCase();

interface AppearancePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  color: string;
  icon: string;
  onChange: (value: { color: string; icon: string }) => void;
}

export function AppearancePicker({
  open,
  onOpenChange,
  color,
  icon,
  onChange,
}: AppearancePickerProps) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const icons = PICKER_ICON_NAMES.filter(
    (name) => !q || iconLabel(name).includes(q),
  );
  const accent = /^#[\da-f]{6}$/i.test(color) ? color : "#64748b";

  return (
    <Sheet
      nested
      open={open}
      onOpenChange={onOpenChange}
      title="Вигляд"
      hideCancel
      trailing={
        <SheetTextButton
          type="button"
          $bold
          onClick={() => onOpenChange(false)}
        >
          Готово
        </SheetTextButton>
      }
    >
      <Section caption="Колір">
        <Colors role="group" aria-label="Колір">
          {PRESET_COLORS.map((c) => (
            <Swatch
              key={c}
              type="button"
              $color={c}
              aria-label={c}
              aria-pressed={c === color}
              onClick={() => onChange({ color: c, icon })}
            >
              {c === color && <HiCheck size={18} />}
            </Swatch>
          ))}
        </Colors>
      </Section>
      <Section caption="Іконка">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Пошук іконки"
          label="Пошук іконки"
        />
        <Icons role="group" aria-label="Іконка">
          {icons.map((name) => {
            const Icon = ICON_MAP[name];
            if (!Icon) return null;
            return (
              <IconCell
                key={name}
                type="button"
                $active={name === icon}
                $color={accent}
                aria-label={iconLabel(name)}
                aria-pressed={name === icon}
                onClick={() => onChange({ color, icon: name })}
              >
                <Icon size={22} />
              </IconCell>
            );
          })}
        </Icons>
      </Section>
    </Sheet>
  );
}
