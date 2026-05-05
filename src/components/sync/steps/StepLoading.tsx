import Spinner from "../../ui/Spinner";
import * as S from "../MonobankModal.styles";

export default function StepLoading() {
  return (
    <S.ContentWrapper>
      <S.CenterState>
        <Spinner />
        <S.Description>Отримання даних від банку...</S.Description>
      </S.CenterState>
    </S.ContentWrapper>
  );
}
