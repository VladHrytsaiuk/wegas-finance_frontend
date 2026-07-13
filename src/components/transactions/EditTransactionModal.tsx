import { useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";

import { Overlay } from "../ui/Modal";
import CreateTransactionForm from "./form";
import { CenteredSpinner } from "../ui/CenteredSpinner";
import { getTransactionApi } from "../../services/apiTransactions";
import { useScrollLock } from "../../hooks/ui/useScrollLock";

// Просто центрувальник, без обмежень ширини
const CenteredLayout = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 1rem; /* Мінімальний відступ від країв екрану */
`;

function EditTransactionModal() {
  const navigate = useNavigate();
  const { transactionId } = useParams();

  const { data: transaction, isLoading } = useQuery({
    queryKey: ["transaction", transactionId],
    queryFn: () => getTransactionApi(transactionId!),
    enabled: !!transactionId,
  });

  const handleClose = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  useScrollLock(true);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [handleClose]);

  return createPortal(
    <Overlay onClick={handleClose}>
      <CenteredLayout onClick={(e) => e.stopPropagation()}>
        {isLoading ? (
          <CenteredSpinner isContainer />
        ) : (
          <CreateTransactionForm
            transactionToEdit={transaction}
            onCloseModal={handleClose}
          />
        )}
      </CenteredLayout>
    </Overlay>,
    document.body
  );
}

export default EditTransactionModal;
