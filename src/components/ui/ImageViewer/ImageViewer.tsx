import { useState, useEffect } from "react";
import { HiChevronLeft, HiChevronRight, HiXMark } from "react-icons/hi2";
import { Button } from "../Button"; // Твій стандартний компонент кнопки
import * as S from "./ImageViewer.styles";

interface ImageViewerProps {
  imageUrls: string[];
  onCloseModal?: () => void; // Прокидається автоматично через <Modal.Window>
}

export default function ImageViewer({
  imageUrls,
  onCloseModal,
}: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Клавіатурна навігація (Стрілки вліво/вправо)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, imageUrls.length]);

  if (!imageUrls || imageUrls.length === 0) return null;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === imageUrls.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? imageUrls.length - 1 : prev - 1));
  };

  return (
    <S.ViewerContainer onClick={(e) => e.stopPropagation()}>
      <S.TopBar>
        <S.Counter>
          {currentIndex + 1} / {imageUrls.length}
        </S.Counter>
        <Button variation="secondary" size="small" onClick={onCloseModal}>
          <HiXMark size={18} /> Закрити
        </Button>
      </S.TopBar>

      <S.MainImageContainer>
        {imageUrls.length > 1 && (
          <S.NavButton $direction="left" onClick={handlePrev}>
            <HiChevronLeft size={28} />
          </S.NavButton>
        )}

        <S.MainImage
          src={imageUrls[currentIndex]}
          alt={`Photo ${currentIndex + 1}`}
        />

        {imageUrls.length > 1 && (
          <S.NavButton $direction="right" onClick={handleNext}>
            <HiChevronRight size={28} />
          </S.NavButton>
        )}
      </S.MainImageContainer>

      {/* Показуємо стрічку мініатюр тільки якщо фото більше одного */}
      {imageUrls.length > 1 && (
        <S.ThumbnailStrip>
          {imageUrls.map((url, idx) => (
            <S.Thumbnail
              key={idx}
              src={url}
              $isActive={idx === currentIndex}
              onClick={() => setCurrentIndex(idx)}
            />
          ))}
        </S.ThumbnailStrip>
      )}
    </S.ViewerContainer>
  );
}
