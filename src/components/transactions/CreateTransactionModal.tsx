import { useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createPortal } from "react-dom";
import styled from "styled-components";

import { BottomSheetPanel, DragHandle, Overlay } from "../ui/Modal";
import CreateTransactionForm from "./form";
import type { TransactionType } from "../../types";
import { useScrollLock } from "../../hooks/ui/useScrollLock";
import { useIsMobile } from "../../hooks/useIsMobile";

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
  const isMobile = useIsMobile();

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
    <Overlay $isBottomSheet={isMobile} onClick={handleClose}>
      {isMobile ? (
        <BottomSheetPanel onClick={(e) => e.stopPropagation()}>
          <DragHandle />
          <CreateTransactionForm
            onCloseModal={handleClose}
            onSuccess={onSuccess}
            initialType={(initialData.type || typeParam || undefined) as TransactionType}
            initialAccountId={
              initialData.account_id || accountIdParam || undefined
            }
            initialCounterpartyId={
              initialData.counterparty_id || cpIdParam || undefined
            }
            initialAmount={initialData.amount}
            initialNote={initialData.note}
          />
        </BottomSheetPanel>
      ) : (
        <CenteredLayout onClick={(e) => e.stopPropagation()}>
          <CreateTransactionForm
            onCloseModal={handleClose}
            onSuccess={onSuccess}
            initialType={(initialData.type || typeParam || undefined) as TransactionType}
            initialAccountId={
              initialData.account_id || accountIdParam || undefined
            }
            initialCounterpartyId={
              initialData.counterparty_id || cpIdParam || undefined
            }
            initialAmount={initialData.amount}
            initialNote={initialData.note}
          />
        </CenteredLayout>
      )}
    </Overlay>,
    document.body,
  );
}

export default CreateTransactionModal;
