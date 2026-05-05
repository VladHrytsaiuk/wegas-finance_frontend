import { useTranslation } from "react-i18next";
import type { FilterConfig } from "./types";
import * as S from "./ToggleFilter.styles";

interface ToggleFilterProps {
  config: FilterConfig;
  value: string[];
  onChange: (vals: string[]) => void;
}

export const ToggleFilter = ({
  config,
  value = [],
  onChange,
}: ToggleFilterProps) => {
  const { t } = useTranslation();

  const handleSelect = (val: string | null) => {
    if (val === null) {
      // Клік на "Всі" очищає фільтр
      onChange([]);
    } else {
      // Логіка Toggle: якщо вже вибрано - знімаємо, якщо ні - ставимо.
      // Примітка: цей компонент працює як Radio (один активний) з можливістю Deselect.
      // Якщо потрібен мульти-вибір, логіку треба змінити на [...value, val]
      if (value.includes(val)) {
        onChange([]);
      } else {
        onChange([val]);
      }
    }
  };

  const isAllSelected = value.length === 0;

  return (
    <S.Container>
      <S.Label>{config.label}:</S.Label>
      <S.Group>
        <S.Button
          type="button"
          $active={isAllSelected}
          onClick={() => handleSelect(null)}
        >
          {t("legacy:filterComponent.toggle_all")}
        </S.Button>

        {config.options?.map((opt) => (
          <S.Button
            key={opt.value}
            type="button"
            $active={value.includes(opt.value)}
            onClick={() => handleSelect(opt.value)}
          >
            {opt.label}
          </S.Button>
        ))}
      </S.Group>
    </S.Container>
  );
};
