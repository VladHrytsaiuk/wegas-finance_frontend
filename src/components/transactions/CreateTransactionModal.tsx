import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import styled from "styled-components";

import { Overlay } from "../ui/Modal";
import CreateTransactionForm from "./form";

const CenteredLayout = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 1rem;
`;

// 🔥 1. Описуємо інтерфейс пропсів
interface CreateTransactionModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialData?: {
    type?: string;
    account_id?: string;
    counterparty_id?: string; // Важливо!
    amount?: number; // 🔥 ДОДАНО
    note?: string; // 🔥 ДОДАНО
  };
}

// 🔥 2. Приймаємо ці пропси
function CreateTransactionModal({
  isOpen = true,
  onClose,
  initialData = {},
}: CreateTransactionModalProps) {
  const navigate = useNavigate();

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  if (!isOpen) return null;

  return createPortal(
    <Overlay onClick={handleClose}>
      <CenteredLayout onClick={(e) => e.stopPropagation()}>
        {/* 🔥 3. Передаємо дані у форму */}
        <CreateTransactionForm
          onCloseModal={handleClose}
          // 🔥 ПЕРЕДАЄМО ДАНІ ДАЛІ
          initialType={initialData.type}
          initialAccountId={initialData.account_id}
          initialCounterpartyId={initialData.counterparty_id}
          initialAmount={initialData.amount} // <--- ОСЬ ВОНО
          initialNote={initialData.note} // <--- І ЦЕ
        />
      </CenteredLayout>
    </Overlay>,
    document.body,
  );
}

export default CreateTransactionModal;
