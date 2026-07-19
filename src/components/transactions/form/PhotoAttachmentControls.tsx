import React, { memo, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { HiPhoto, HiEye, HiTrash, HiPaperClip } from "react-icons/hi2";

import Spinner from "../../ui/Spinner";
import { Button } from "../../ui/Button";
import { Overlay, StyledModal } from "../../ui/Modal";
import { useIsMobile } from "../../../hooks/useIsMobile";
import * as S from "./styles";

interface PhotoAttachmentControlsProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  previewCount: number;
  isCompressing: boolean;
  isUploading: boolean;
  isDeleting: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenViewer: () => void;
  onDeleteAll: () => void;
}

export const PhotoAttachmentControls = memo(
  ({
    fileInputRef,
    previewCount,
    isCompressing,
    isUploading,
    isDeleting,
    onFileUpload,
    onOpenViewer,
    onDeleteAll,
  }: PhotoAttachmentControlsProps) => {
    const { t } = useTranslation();
    const isMobile = useIsMobile();
    const [showDeletePhotosModal, setShowDeletePhotosModal] = useState(false);
    const hasPhotos = previewCount > 0;

    return (
      <>
        {showDeletePhotosModal &&
          createPortal(
            <Overlay
              onClick={(e) => {
                e.stopPropagation();
                setShowDeletePhotosModal(false);
              }}
            >
              <StyledModal onClick={(e) => e.stopPropagation()}>
                <S.UnlinkModalContent>
                  <S.UnlinkModalIconWrapper>
                    <HiTrash size={24} />
                  </S.UnlinkModalIconWrapper>
                  <div>
                    <S.UnlinkModalTitle>
                      {t(
                        "transactions:transactionForm.delete_photos_title",
                        "Видалити всі фото?",
                      )}
                    </S.UnlinkModalTitle>
                    <S.UnlinkModalText>
                      {t(
                        "transactions:transactionForm.delete_photos_text",
                        "Усі прикріплені фото будуть видалені з цієї транзакції.",
                      )}
                    </S.UnlinkModalText>
                  </div>
                  <S.UnlinkModalButtons>
                    <Button
                      variation="secondary"
                      onClick={() => setShowDeletePhotosModal(false)}
                    >
                      {t("common:confirmDelete.button_cancel", "Скасувати")}
                    </Button>
                    <Button
                      variation="danger"
                      onClick={() => {
                        onDeleteAll();
                        setShowDeletePhotosModal(false);
                      }}
                      disabled={isDeleting}
                    >
                      {t(
                        "transactions:transactionForm.delete_photos_confirm",
                        "Видалити всі",
                      )}
                    </Button>
                  </S.UnlinkModalButtons>
                </S.UnlinkModalContent>
              </StyledModal>
            </Overlay>,
            document.body,
          )}

        <S.FileUploadWrapper>
          <S.HiddenFileInput
            ref={fileInputRef}
            type="file"
            id="receipt-upload"
            accept="image/*"
            multiple
            onChange={onFileUpload}
            disabled={isUploading || isCompressing}
          />

          {isCompressing ? (
            <S.CompressingState>
              <Spinner size="1.5rem" />
              <S.CompressingText>
                {t("common:common.processing", "Обробка фото...")}
              </S.CompressingText>
            </S.CompressingState>
          ) : (
            <>
              <S.UploadButtonLabel htmlFor="receipt-upload">
                <S.UploadIconButton
                  as="span"
                  $hasFiles={hasPhotos}
                  aria-label={t(
                    "transactions:transactionForm.add_photo",
                    "Додати фото",
                  )}
                >
                  <S.UploadButtonInner>
                    {hasPhotos ? <HiPhoto /> : <HiPaperClip />}
                    {!isMobile && (
                      <S.UploadButtonText>
                        {t(
                          "transactions:transactionForm.add_photo",
                          "Додати фото",
                        )}
                      </S.UploadButtonText>
                    )}
                  </S.UploadButtonInner>
                  {hasPhotos && <S.UploadBadge>{previewCount}</S.UploadBadge>}
                </S.UploadIconButton>
              </S.UploadButtonLabel>

              {isMobile && hasPhotos && (
                <>
                  <S.PhotoSummaryButton
                    type="button"
                    onClick={onOpenViewer}
                    aria-label={t(
                      "transactions:transactionForm.open_photos",
                      "Відкрити фото",
                    )}
                    title={t(
                      "transactions:transactionForm.open_photos",
                      "Відкрити фото",
                    )}
                  >
                    <HiEye />
                    <S.PhotoSummaryCount>{previewCount}</S.PhotoSummaryCount>
                    <S.PhotoSummaryLabel>
                      {t("transactions:transactionForm.photos_label", "фото")}
                    </S.PhotoSummaryLabel>
                  </S.PhotoSummaryButton>

                  <S.PhotoClearButton
                    type="button"
                    onClick={() => setShowDeletePhotosModal(true)}
                    aria-label={t(
                      "transactions:transactionForm.delete_photos",
                      "Видалити всі фото",
                    )}
                    title={t(
                      "transactions:transactionForm.delete_photos",
                      "Видалити всі фото",
                    )}
                  >
                    <HiTrash />
                  </S.PhotoClearButton>
                </>
              )}
            </>
          )}
        </S.FileUploadWrapper>
      </>
    );
  },
);

PhotoAttachmentControls.displayName = "PhotoAttachmentControls";
