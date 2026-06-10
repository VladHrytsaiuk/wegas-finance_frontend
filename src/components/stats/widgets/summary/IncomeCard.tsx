import React from "react";
import { HiArrowTrendingUp } from "react-icons/hi2";
import * as S from "./Summary.styles";

interface IncomeCardProps {
  label: string;
  value: string;
}

export const IncomeCard = React.memo(({ label, value }: IncomeCardProps) => {
  return (
    <S.StatCard>
      <S.CardIcon $color="var(--color-green-600)">
        <HiArrowTrendingUp />
      </S.CardIcon>
      <S.CardContent>
        <S.CardLabel>{label}</S.CardLabel>
        <S.CardValue $color="var(--color-green-600)">{value}</S.CardValue>
      </S.CardContent>
    </S.StatCard>
  );
});
