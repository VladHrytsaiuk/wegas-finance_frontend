import { useRef, useEffect, useState, useCallback, useEffectEvent } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useTransactionLogic } from "../../../hooks/Transactions/useTransactionLogic";
import * as S from "./styles";
import type { Transaction } from "../../../types";

// UI Components
import TransactionConflictModal from "./TransactionConflictModal";
import { ReceiptViewer } from "../ReceiptViewer";
import ConfirmDelete from "../../ui/ConfirmDelete";
import ConfirmCloseModal from "../../ui/ConfirmCloseModal";
import { useModal, Overlay, StyledModal } from "../../ui/Modal";
import { useIsMobile } from "../../../hooks/useIsMobile";
import type { CreateTxItem } from "../../../services/apiTransactions";

// Parts
import { ImagePanel } from "./ImagePanel";
import { FormContent } from "./FormContent";

import { focusNextElement } from "../../../utils/focusUtils";

interface CreateTransactionFormProps {
  onCloseModal?: () => void;
  onSuccess?: (data?: unknown) => void;
  transactionToEdit?: Partial<Transaction>;
  initialType?: string;
  initialAccountId?: string;
  initialCounterpartyId?: string;
  initialCategoryId?: string;
  initialAmount?: number;
  initialNote?: string;
  initialDate?: number;
  initialItems?: CreateTxItem[];
}

interface ConfirmPortalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

function ConfirmPortal({ isOpen, onClose, children }: ConfirmPortalProps) {
  if (!isOpen) return null;

  return createPortal(
    <Overlay
      style={{ zIndex: 11000 }}
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <StyledModal
        onClick={(e) => e.stopPropagation()}
        style={{
          zIndex: 11001,
          width: "fit-content",
          maxWidth: "28rem",
          padding: "2.4rem",
        }}
      >
        {children}
      </StyledModal>
    </Overlay>,
    document.body,
  );
}

function CreateTransactionForm(props: CreateTransactionFormProps) {
  const { t } = useTranslation();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDeleteCurrentPhotoConfirm, setShowDeleteCurrentPhotoConfirm] =
    useState(false);
  const { setIsDirty } = useModal();
  const isMobile = useIsMobile();

  const { state, actions, handlers, refs } = useTransactionLogic(props);
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const hasImage = !isMobile && !!state.allPreviewUrls[state.previewIndex];

  // Синхронізуємо dirty-стан
  const isDirty = state.isDirty || false;
  // console.log(isDirty);

  useEffect(() => {
    setIsDirty(isDirty);
    // При розмонтуванні скидаємо, щоб батьківська модалка не "залипла" в стані брудна
    return () => setIsDirty(false);
  }, [isDirty, setIsDirty]);

  // 🔥 Виправлена логіка спроби закриття
  const handleCloseAttempt = useCallback(() => {
    if (isDirty) {
      setShowConfirm(true);
    } else {
      // Якщо чисто — просто викликаємо пропс закриття
      props.onCloseModal?.();
    }
  }, [isDirty, props]);

  // Focus Management
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!modalContainerRef.current) return;
      const activeTypeBtn = modalContainerRef.current.querySelector(
        'button[data-active="true"]',
      ) as HTMLElement;

      if (activeTypeBtn) activeTypeBtn.focus();
      else
        modalContainerRef.current
          .querySelector('input:not([type="hidden"]), select')
          ?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // 🔥 ВИПРАВЛЕНИЙ ОБРОБНИК ESCAPE
  const handleEsc = useEffectEvent((e: KeyboardEvent) => {
    if (e.key !== "Escape") return;

    if (state.isViewerOpen || state.conflictState || state.isClearModalOpen)
      return;

    e.stopPropagation();

    if (showConfirm) {
      setShowConfirm(false);
    } else {
      handleCloseAttempt();
    }
  });

  useEffect(() => {
    document.addEventListener("keydown", handleEsc, true);
    return () => document.removeEventListener("keydown", handleEsc, true);
  }, [handleEsc]);

  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
      e.preventDefault();
      focusNextElement(e.target as HTMLElement);
    }
  };

  return (
    <>
      {/* --- LAYER 1: Modals & Overlays --- */}

      {/* 1.0 Confirm Close Modal (Portal) */}
      <ConfirmPortal isOpen={showConfirm} onClose={() => setShowConfirm(false)}>
        <ConfirmCloseModal
          onConfirm={() => {
            setIsDirty(false);
            setShowConfirm(false);
            props.onCloseModal?.();
          }}
          onCloseModal={() => setShowConfirm(false)}
        />
      </ConfirmPortal>

      <ConfirmPortal
        isOpen={showDeleteCurrentPhotoConfirm}
        onClose={() => setShowDeleteCurrentPhotoConfirm(false)}
      >
        <ConfirmDelete
          resourceName={t(
            "transactions:transactionForm.resource_photo",
            "це фото",
          )}
          onConfirm={async () => {
            await handlers.deleteCurrentPhoto();
            const remaining = state.allPreviewUrls.length - 1;
            if (remaining <= 0) {
              actions.setIsViewerOpen(false);
            }
          }}
          onCloseModal={() => setShowDeleteCurrentPhotoConfirm(false)}
          disabled={state.isDeleting}
        />
      </ConfirmPortal>

      {/* 1.1 Conflict Modal */}
      {state.conflictState && (
        <TransactionConflictModal
          data={state.conflictState}
          onCancel={() => actions.setConflictState(null)}
          onUpdateTotal={handlers.resolveConflict.updateTotal}
          onAddRemainder={handlers.resolveConflict.addRemainder}
          onIgnore={handlers.resolveConflict.ignore}
        />
      )}

      {/* 1.2 Clear Items Confirmation */}
      {state.isClearModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          // Теж зупиняємо спливання
          onClick={(e) => {
            e.stopPropagation();
            actions.setIsClearModalOpen(false);
          }}
        >
          <div
            style={{
              backgroundColor: "var(--color-bg-surface)",
              padding: "2rem",
              borderRadius: "var(--border-radius-lg)",
              boxShadow: "var(--shadow-xl)",
              width: "100%",
              maxWidth: "32rem",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <ConfirmDelete
              resourceName={
                t("transactions:transactionForm.resource_items_list") || "список товарів"
              }
              onConfirm={handlers.handleConfirmClearItems}
              onCloseModal={() => actions.setIsClearModalOpen(false)}
              disabled={false}
            />
          </div>
        </div>
      )}

      {/* --- LAYER 2: Main Layout --- */}
      {/* Додаємо onClick stopPropagation на контейнер форми, щоб кліки всередині форми не закривали модалку випадково */}
      <S.ModalContainer
        $hasImage={hasImage}
        ref={modalContainerRef}
        role="dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <S.SplitLayout $hasImage={hasImage}>
          {hasImage && (
            <ImagePanel
              previewUrl={state.allPreviewUrls[state.previewIndex]}
              totalImages={state.allPreviewUrls.length}
              currentIndex={state.previewIndex}
              onPrev={() =>
                actions.setPreviewIndex(
                  (prev: number) =>
                    (prev - 1 + state.allPreviewUrls.length) %
                    state.allPreviewUrls.length,
                )
              }
              onNext={() =>
                actions.setPreviewIndex(
                  (prev: number) => (prev + 1) % state.allPreviewUrls.length,
                )
              }
              onDeleteCurrent={handlers.deleteCurrentPhoto}
              onDeleteAll={handlers.deleteAllPhotos}
              onExpand={() => actions.setIsViewerOpen(true)}
              isDeleting={state.isDeleting}
              transformRef={refs.transformRef}
            />
          )}

          <S.RightSideWrapper>
            <form
              onSubmit={handlers.handleSubmit}
              onKeyDown={handleFormKeyDown}
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <S.HeaderContainer>
                <S.Title>
                  {state.isEditSession
                    ? t("transactions:transactionForm.title_edit")
                    : t("transactions:transactionForm.title_new")}
                </S.Title>
              </S.HeaderContainer>

              <FormContent
                state={state}
                actions={actions}
                handlers={handlers}
                fileInputRef={refs.fileInputRef}
                onCloseModal={handleCloseAttempt}
                modalRef={modalContainerRef}
              />
            </form>
          </S.RightSideWrapper>
        </S.SplitLayout>
      </S.ModalContainer>

      {/* --- LAYER 3: Fullscreen Viewer --- */}
      {state.isViewerOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 9999 }}
          onClick={(e) => e.stopPropagation()}
        >
          <ReceiptViewer
            imageUrls={state.allPreviewUrls}
            currentIndex={state.previewIndex}
            onClose={() => actions.setIsViewerOpen(false)}
            onIndexChange={actions.setPreviewIndex}
            onDeleteCurrent={() => setShowDeleteCurrentPhotoConfirm(true)}
            isDeletingCurrent={state.isDeleting}
          />
        </div>
      )}
    </>
  );
}

export default CreateTransactionForm;
