import { HiExclamationTriangle } from "react-icons/hi2";
import { Button } from "../../ui/Button";
import * as S from "../MonobankModal.styles";

export default function StepRateLimit({ onClose }: { onClose: () => void }) {
  return (
    <S.ContentWrapper>
      <S.CenterState>
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            backgroundColor: "var(--color-warning-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-warning-dark)",
          }}
        >
          <HiExclamationTriangle size={40} />
        </div>
        <div>
          <h3
            style={{
              fontSize: "1.2rem",
              fontWeight: 600,
              marginBottom: "0.5rem",
            }}
          >
            Забагато запитів до банку
          </h3>
          <S.Description>Спробуйте ще раз через 60 секунд.</S.Description>
        </div>
        <S.FooterRow>
          <Button onClick={onClose} $variation="secondary">
            Закрити
          </Button>
        </S.FooterRow>
      </S.CenterState>
    </S.ContentWrapper>
  );
}
