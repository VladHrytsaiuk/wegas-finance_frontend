import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import {
  HiMagnifyingGlassPlus,
  HiMagnifyingGlassMinus,
  HiArrowUturnLeft,
} from "react-icons/hi2";
import * as S from "../../pages/Goals/GoalDetails.styles";

interface GoalImagePanelProps {
  src: string;
  alt: string;
}

export const GoalImagePanel = ({ src, alt }: GoalImagePanelProps) => {
  return (
    <TransformWrapper initialScale={1} minScale={0.5} maxScale={4} centerOnInit>
      {({ zoomIn, zoomOut, resetTransform }) => (
        <>
          <S.ImageControls>
            <S.ControlButton
              type="button"
              onClick={() => zoomIn()}
              title="Наблизити"
            >
              <HiMagnifyingGlassPlus />
            </S.ControlButton>
            <S.ControlButton
              type="button"
              onClick={() => zoomOut()}
              title="Віддалити"
            >
              <HiMagnifyingGlassMinus />
            </S.ControlButton>
            <S.ControlButton
              type="button"
              onClick={() => resetTransform()}
              title="Скинути"
            >
              <HiArrowUturnLeft />
            </S.ControlButton>
          </S.ImageControls>

          <TransformComponent
            wrapperStyle={{ width: "100%", height: "100%" }}
            contentStyle={{ width: "100%", height: "100%" }}
          >
            <img src={src} alt={alt} />
          </TransformComponent>
        </>
      )}
    </TransformWrapper>
  );
};
