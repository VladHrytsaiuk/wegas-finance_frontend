import { HiWallet } from "react-icons/hi2";
import * as S from "./Summary.styles";

interface BalanceCardProps {
  label: string;
  value: string;
}

export const BalanceCard = ({ label, value }: BalanceCardProps) => {
  return (
    <S.MainCard $variant="primary">
      <S.CardIcon>
        <HiWallet />
      </S.CardIcon>
      <S.CardContent>
        <S.CardLabel>{label}</S.CardLabel>
        <S.CardValue>{value}</S.CardValue>
      </S.CardContent>
    </S.MainCard>
  );
};
