import { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useTransactionLogic } from "../../../hooks/Transactions/useTransactionLogic";
import * as S from "./styles";

// UI Components
import TransactionConflictModal from "./TransactionConflictModal";
import { ReceiptViewer } from "../ReceiptViewer";
import ConfirmDelete from "../../ui/ConfirmDelete";
import ConfirmCloseModal from "../../ui/ConfirmCloseModal";
import { useModal, Overlay, StyledModal } from "../../ui/Modal";

// Parts
import { ImagePanel } from "./ImagePanel";
import { FormContent } from "./FormContent";

import { focusNextElement } from "../../../utils/focusUtils";

interface CreateTransactionFormProps {
  onCloseModal?: () => void;
  onSuccess?: (data: any) => void;
  transactionToEdit?: any;
  initialType?: string;
  initialAccountId?: string;
  initialCounterpartyId?: string;
  initialAmount?: number;
  initialNote?: string;
}

function CreateTransactionForm(props: CreateTransactionFormProps) {
  const { t } = useTranslation();
  const [showConfirm, setShowConfirm] = useState(false);
  const { setIsDirty } = useModal();

  const { state, actions, handlers, refs } = useTransactionLogic(props);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  // Синхронізуємо dirty-стан
  const isDirty = state.isDirty || false;
  // console.log(isDirty);

  useEffect(() => {
    setIsDirty(isDirty);
    // При розмонтуванні скидаємо, щоб батьківська модалка не "залипла" в стані брудна
    return () => setIsDirty(false);
  }, [isDirty, setIsDirty]);

  // 🔥 Виправлена логіка спроби закриття
  const handleCloseAttempt = () => {
    if (isDirty) {
      setShowConfirm(true);
    } else {
      // Якщо чисто — просто викликаємо пропс закриття
      props.onCloseModal?.();
    }
  };

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
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Якщо відкриті інші "верхні" шари — ігноруємо
        if (state.isViewerOpen || state.conflictState || state.isClearModalOpen)
          return;

        // Зупиняємо подію, щоб вона не дійшла до батьківської модалки/сторінки
        // Це виправить проблему "2 кроки назад" при натисканні ESC
        e.stopPropagation();

        if (showConfirm) {
          // Якщо підтвердження вже відкрите — закриваємо його
          setShowConfirm(false);
        } else {
          // Якщо ні — пробуємо закрити форму (відкриється підтвердження або закриється форма)
          handleCloseAttempt();
        }
      }
    };

    // capture: true важливий, щоб перехопити подію раніше за інших
    document.addEventListener("keydown", handleEsc, true);
    return () => document.removeEventListener("keydown", handleEsc, true);
  }, [
    showConfirm,
    isDirty,
    state.isViewerOpen,
    state.conflictState,
    state.isClearModalOpen,
  ]);

  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.ctrlKey || e.metaKey) return;
    if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
      e.preventDefault();
      focusNextElement(e.target as HTMLElement);
    }
  };

  const hasImage = !!state.allPreviewUrls[state.previewIndex];

  return (
    <>
      {/* --- LAYER 1: Modals & Overlays --- */}

      {/* 1.0 Confirm Close Modal (Portal) */}
      {showConfirm &&
        createPortal(
          <Overlay
            style={{ zIndex: 11000 }}
            // 🔥 ВАЖЛИВО: stopPropagation тут запобігає закриттю батьківської модалки
            // при кліку на затемнений фон цього вікна
            onClick={(e) => {
              e.stopPropagation();
              setShowConfirm(false);
            }}
          >
            <StyledModal
              // stopPropagation тут запобігає закриттю при кліку на саме вікно
              onClick={(e) => e.stopPropagation()}
              style={{
                zIndex: 11001,
                width: "fit-content",
                maxWidth: "28rem",
                padding: "2.4rem",
              }}
            >
              <ConfirmCloseModal
                onConfirm={() => {
                  setIsDirty(false); // Спочатку скидаємо прапорець
                  setShowConfirm(false); // Закриваємо це вікно

                  // Робимо невелику затримку або просто викликаємо закриття
                  // Головне, щоб подія кліку на кнопку "Вийти" не спливла вгору
                  props.onCloseModal?.();
                }}
                onCloseModal={() => setShowConfirm(false)}
              />
            </StyledModal>
          </Overlay>,
          document.body,
        )}

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
                t("transactionForm.resource_items_list") || "список товарів"
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
              isDeleting={state.isDeleting}
              onExpand={() => actions.setIsViewerOpen(true)}
              transformRef={refs.transformRef}
            />
          )}

          <S.FormScrollArea>
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
                    ? t("transactionForm.title_edit")
                    : t("transactionForm.title_new")}
                </S.Title>
              </S.HeaderContainer>

              <FormContent
                state={state}
                actions={actions}
                handlers={handlers}
                refs={refs}
                onCloseModal={handleCloseAttempt}
                modalRef={modalContainerRef}
              />
            </form>
          </S.FormScrollArea>
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
            onClose={() => actions.setIsViewerOpen(false)}
            onIndexChange={actions.setPreviewIndex}
          />
        </div>
      )}
    </>
  );
}

export default CreateTransactionForm;
