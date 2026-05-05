import { HiArrowTrendingDown } from "react-icons/hi2";
import * as S from "./Summary.styles";

interface ExpenseCardProps {
  label: string;
  value: string;
}

export const ExpenseCard = ({ label, value }: ExpenseCardProps) => {
  return (
    <S.StatCard>
      <S.CardIcon $color="var(--color-red-600)">
        <HiArrowTrendingDown />
      </S.CardIcon>
      <S.CardContent>
        <S.CardLabel>{label}</S.CardLabel>
        <S.CardValue $color="var(--color-red-600)">{value}</S.CardValue>
      </S.CardContent>
    </S.StatCard>
  );
};
