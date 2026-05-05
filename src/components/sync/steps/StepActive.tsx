import { HiCheckCircle, HiInformationCircle } from "react-icons/hi2";
import { Button } from "../../ui/Button";
import * as S from "../MonobankModal.styles";

export default function StepActive({ onClose }: { onClose: () => void }) {
  return (
    <S.ContentWrapper>
      <S.CenterState>
        <div style={{ marginBottom: "1rem" }}>
          <HiCheckCircle
            style={{ fontSize: "4rem", color: "var(--color-success)" }}
          />
        </div>
        <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
          Синхронізацію розпочато! 🚀
        </h3>
        <p
          style={{
            color: "var(--color-text-secondary)",
            marginBottom: "1.5rem",
          }}
        >
          Ми завантажуємо транзакції у фоновому режимі.
        </p>
        <S.InfoBox>
          <S.InfoTitle>
            <HiInformationCircle size={20} /> Важливо:
          </S.InfoTitle>
          <S.InfoList>
            <li>
              <strong>Це займе час:</strong> Через ліміти банку ми завантажуємо
              дані порціями.
            </li>
            <li>
              <strong>Можна закрити вікно:</strong> Процес продовжиться
              автоматично.
            </li>
          </S.InfoList>
        </S.InfoBox>
        <Button onClick={onClose}>Зрозуміло</Button>
      </S.CenterState>
    </S.ContentWrapper>
  );
}
