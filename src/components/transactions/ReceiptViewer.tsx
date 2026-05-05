import {
  HiMagnifyingGlassPlus,
  HiMagnifyingGlassMinus,
  HiArrowPath,
  HiXMark,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import { useReceiptViewer } from "../../hooks/Transactions/useReceiptViewer"; // Шлях може відрізнятись в залежності від папки
import * as S from "./ReceiptViewer.styles";

interface ReceiptViewerProps {
  imageUrls: string[];
  onClose?: () => void;
  onIndexChange?: (index: number) => void;
}

export function ReceiptViewer(props: ReceiptViewerProps) {
  const { t } = useTranslation();
  const { state, handlers } = useReceiptViewer(props);

  if (state.validUrls.length === 0) return null;

  return (
    <S.ViewerContainer>
      <S.Toolbar>
        <S.ToolGroup>
          <S.ToolBtn
            onClick={handlers.handleZoomOut}
            title={t("viewer.zoom_out")}
          >
            <HiMagnifyingGlassMinus />
          </S.ToolBtn>
          <S.ToolBtn onClick={handlers.handleReset} title={t("viewer.reset")}>
            <HiArrowPath />
          </S.ToolBtn>
          <S.ToolBtn
            onClick={handlers.handleZoomIn}
            title={t("viewer.zoom_in")}
          >
            <HiMagnifyingGlassPlus />
          </S.ToolBtn>
        </S.ToolGroup>

        {props.onClose && (
          <S.ToolBtn onClick={props.onClose} title={t("common.close")}>
            <HiXMark />
          </S.ToolBtn>
        )}
      </S.Toolbar>

      <S.ImageArea
        onMouseDown={handlers.handleMouseDown}
        onMouseMove={handlers.handleMouseMove}
        onMouseUp={handlers.handleMouseUp}
        onMouseLeave={handlers.handleMouseUp}
        onWheel={handlers.handleWheel}
      >
        {state.hasMultipleImages && (
          <S.NavBtn
            $pos="left"
            onClick={(e) => {
              e.stopPropagation();
              handlers.handlePrev();
            }}
            title={t("pagination.tooltip_prev")}
          >
            <HiChevronLeft size={24} />
          </S.NavBtn>
        )}

        <S.StyledImage
          src={state.currentUrl}
          $scale={state.scale}
          $x={state.position.x}
          $y={state.position.y}
          draggable={false}
          alt="Receipt preview"
        />

        {state.hasMultipleImages && (
          <S.NavBtn
            $pos="right"
            onClick={(e) => {
              e.stopPropagation();
              handlers.handleNext();
            }}
            title={t("pagination.tooltip_next")}
          >
            <HiChevronRight size={24} />
          </S.NavBtn>
        )}

        {state.hasMultipleImages && (
          <S.Counter>
            {state.index + 1} / {state.validUrls.length}
          </S.Counter>
        )}
      </S.ImageArea>
    </S.ViewerContainer>
  );
}
