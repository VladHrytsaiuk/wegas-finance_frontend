import { useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createPortal } from "react-dom";
import styled from "styled-components";

import { Overlay } from "../ui/Modal";
import CreateTransactionForm from "./form";
import type { TransactionType } from "../../types";
import { useScrollLock } from "../../hooks/ui/useScrollLock";

interface TransactionSuccessResponse {
  id?: string;
  data?: {
    id?: string;
  };
}

type TransactionSuccessPayload = TransactionSuccessResponse | string | null;

const CenteredLayout = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 1rem;
`;

interface CreateTransactionModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: (data?: TransactionSuccessPayload) => void;
  initialData?: {
    type?: TransactionType;
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
  onSuccess,
  initialData = {},
}: CreateTransactionModalProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Отримуємо параметри з URL (якщо модалка відкрита через navigate)
  const typeParam = searchParams.get("type");
  const accountIdParam = searchParams.get("accountId");
  const cpIdParam = searchParams.get("counterpartyId");

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  }, [onClose, navigate]);

  useScrollLock(isOpen);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [handleClose]);

  if (!isOpen) return null;

  return createPortal(
    <Overlay onClick={handleClose}>
      <CenteredLayout onClick={(e) => e.stopPropagation()}>
        {/* 🔥 3. Передаємо дані у форму */}
        <CreateTransactionForm
          onCloseModal={handleClose}
          onSuccess={onSuccess}
          // 🔥 ПЕРЕДАЄМО ДАНІ ДАЛІ
          initialType={(initialData.type || typeParam || undefined) as TransactionType}
          initialAccountId={
            initialData.account_id || accountIdParam || undefined
          }
          initialCounterpartyId={
            initialData.counterparty_id || cpIdParam || undefined
          }
          initialAmount={initialData.amount} // <--- ОСЬ ВОНО
          initialNote={initialData.note} // <--- І ЦЕ
        />
      </CenteredLayout>
    </Overlay>,
    document.body,
  );
}

export default CreateTransactionModal;
