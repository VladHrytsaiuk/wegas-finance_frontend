import React, { RefObject } from "react";
import {
  TransformWrapper,
  TransformComponent,
  type ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";
import {
  HiMagnifyingGlassPlus,
  HiMagnifyingGlassMinus,
  HiArrowUturnLeft,
  HiArrowsPointingOut,
  HiTrash,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi2";
import Modal from "../../ui/Modal";
import { DeleteReceiptDialog } from "../../ui/DeleteReceiptDialog";
import { getModKey } from "../../../utils/platform";
import * as S from "./styles";

interface ImagePanelProps {
  previewUrl: string;
  totalImages: number;
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onDeleteCurrent: () => void;
  onDeleteAll: () => void;
  onExpand: () => void;
  isDeleting: boolean;
  transformRef: RefObject<ReactZoomPanPinchRef>; // Додано проп
}

export const ImagePanel = ({
  previewUrl,
  totalImages,
  currentIndex,
  onPrev,
  onNext,
  onDeleteCurrent,
  onDeleteAll,
  onExpand,
  isDeleting,
  transformRef, // Отримуємо ref
}: ImagePanelProps) => {
  const modKey = getModKey();

  return (
    <S.ImagePanel>
      <TransformWrapper
        initialScale={1}
        centerOnInit
        key={previewUrl}
        ref={transformRef} // 🔥 Прив'язуємо ref
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <S.ImageControls>
              <S.ControlButton
                type="button"
                onClick={() => zoomIn()}
                title={`Zoom In (${modKey} +)`}
              >
                <HiMagnifyingGlassPlus />
              </S.ControlButton>
              <S.ControlButton
                type="button"
                onClick={() => zoomOut()}
                title={`Zoom Out (${modKey} -)`}
              >
                <HiMagnifyingGlassMinus />
              </S.ControlButton>
              <S.ControlButton
                type="button"
                onClick={() => resetTransform()}
                title={`Reset (${modKey} 0)`}
              >
                <HiArrowUturnLeft />
              </S.ControlButton>
              <S.ControlButton
                type="button"
                onClick={() => onExpand()}
                title="Fullscreen"
              >
                <HiArrowsPointingOut />
              </S.ControlButton>

              <Modal>
                <Modal.Open opens="delete-options">
                  <S.ControlButton type="button" $variant="danger">
                    <HiTrash />
                  </S.ControlButton>
                </Modal.Open>
                <Modal.Window name="delete-options">
                  <DeleteReceiptDialog
                    onDeleteCurrent={onDeleteCurrent}
                    onDeleteAll={onDeleteAll}
                    isDeleting={isDeleting}
                    isSinglePhoto={totalImages === 1}
                  />
                </Modal.Window>
              </Modal>
            </S.ImageControls>

            {totalImages > 1 && (
              <S.NavigationControls>
                <S.ControlButton type="button" onClick={onPrev}>
                  <HiChevronLeft size={18} />
                </S.ControlButton>
                <S.CounterBadge>
                  {currentIndex + 1} / {totalImages}
                </S.CounterBadge>
                <S.ControlButton type="button" onClick={onNext}>
                  <HiChevronRight size={18} />
                </S.ControlButton>
              </S.NavigationControls>
            )}

            <TransformComponent
              wrapperStyle={{ width: "100%", height: "100%" }}
            >
              <img src={previewUrl} alt="Receipt Preview" />
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </S.ImagePanel>
  );
};
