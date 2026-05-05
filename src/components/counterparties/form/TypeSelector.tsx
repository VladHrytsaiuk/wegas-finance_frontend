import { HiBuildingStorefront, HiUser, HiGlobeAlt } from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import * as S from "./styles";

interface Props {
  selectedType: string;
  onSelect: (type: string) => void;
}

// Конфігурація типів винесена з компонента (Static config)
const TYPE_OPTIONS = [
  {
    id: "shop",
    icon: HiBuildingStorefront,
    labelKey: "counterpartyCategoryForm.type_shop",
  },
  {
    id: "person",
    icon: HiUser,
    labelKey: "counterpartyCategoryForm.type_person",
  },
  {
    id: "other",
    icon: HiGlobeAlt,
    labelKey: "counterpartyCategoryForm.type_other",
  },
] as const;

export const TypeSelector = ({ selectedType, onSelect }: Props) => {
  const { t } = useTranslation();

  return (
    <S.TypeGrid>
      {TYPE_OPTIONS.map(({ id, icon: Icon, labelKey }) => (
        <S.TypeCard
          key={id}
          $active={selectedType === id}
          onClick={() => onSelect(id)}
          type="button" // Важливо для доступності, щоб не сабмітило форму
        >
          <Icon />
          <span>{t(labelKey)}</span>
        </S.TypeCard>
      ))}
    </S.TypeGrid>
  );
};
