import styled from "styled-components";
import { HiExclamationTriangle } from "react-icons/hi2";
import { Button } from "../ui/Button";
import Spinner from "../ui/Spinner";

// 🔥 ВИПРАВЛЕНО: Прибрали фон, тіні та рамки.
// Тепер це просто контейнер для вирівнювання контенту.
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.5rem;

  width: 100%;
  /* Якщо батьківська модалка дуже широка, можна обмежити контент */
  max-width: 400px;
  margin: 0 auto;

  /* background-color: ... прибрали */
  /* box-shadow: ... прибрали */
  /* border: ... прибрали */
  /* padding: ... прибрали (або можна залишити мінімальний, якщо треба відступ від країв модалки) */
`;

const WarningIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: var(--color-warning-light);
  color: var(--color-warning);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  /* margin-bottom прибрав, бо у Container вже є gap */
`;

const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-text-main);
`;

const Text = styled.p`
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin-bottom: 0.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  width: 100%;
  justify-content: center;
`;

interface Props {
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

export function ConfirmDisconnectModal({
  onClose,
  onConfirm,
  isPending,
}: Props) {
  return (
    <Container>
      <WarningIcon>
        <HiExclamationTriangle />
      </WarningIcon>

      <div>
        <Title>Відключити Monobank?</Title>
        <Text>
          Автоматична синхронізація зупиниться. Вже завантажені транзакції
          залишаться у вашій історії.
        </Text>
      </div>

      <ButtonGroup>
        <Button
          $variation="secondary"
          onClick={onClose}
          disabled={isPending}
          // type="button" бажано додати, щоб не сабмітило форму, якщо модалка всередині <form>
          type="button"
        >
          Скасувати
        </Button>

        <Button $variation="danger" onClick={onConfirm} disabled={isPending}>
          {isPending ? <Spinner size="sm" /> : "Відключити"}
        </Button>
      </ButtonGroup>
    </Container>
  );
}
