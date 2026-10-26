import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HiOutlineTrash, HiXMark } from "react-icons/hi2";
import styled from "styled-components";

// Фото на весь екран: гортання вбік, лічильник, закрити, видалити поточне.

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: flex;
  flex-direction: column;
  background: #000;
  color: #fff;
  font-family: var(--m-font);
`;

const Top = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(env(safe-area-inset-top) + 8px) 12px 8px;
`;

const IconButton = styled.button`
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  cursor: pointer;
`;

const Counter = styled.span`
  font-size: 15px;
  font-variant-numeric: tabular-nums;
`;

const Track = styled.div`
  flex: 1;
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Slide = styled.div`
  flex: 0 0 100%;
  display: grid;
  place-items: center;
  scroll-snap-align: center;

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

const Bottom = styled.div`
  display: flex;
  justify-content: center;
  padding: 8px 12px calc(env(safe-area-inset-bottom) + 12px);
`;

interface PhotoViewerProps {
  urls: string[];
  startIndex: number;
  onClose: () => void;
  /** Видалити фото з цим індексом (без — кнопки немає). */
  onDelete?: (index: number) => void;
}

export function PhotoViewer({ urls, startIndex, onClose, onDelete }: PhotoViewerProps) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(startIndex);

  useEffect(() => {
    const el = track.current;
    if (el) el.scrollLeft = startIndex * el.clientWidth;
  }, [startIndex]);

  return createPortal(
    <Backdrop role="dialog" aria-label="Фото">
      <Top>
        <IconButton type="button" aria-label="Закрити" onClick={onClose}>
          <HiXMark size={22} />
        </IconButton>
        <Counter>
          {index + 1} з {urls.length}
        </Counter>
        <span style={{ width: 44 }} />
      </Top>
      <Track
        ref={track}
        onScroll={(e) => {
          const el = e.currentTarget;
          setIndex(Math.round(el.scrollLeft / Math.max(el.clientWidth, 1)));
        }}
      >
        {urls.map((url, i) => (
          <Slide key={url}>
            <img src={url} alt={`Фото ${i + 1}`} />
          </Slide>
        ))}
      </Track>
      {onDelete && (
        <Bottom>
          <IconButton type="button" aria-label="Видалити фото" onClick={() => onDelete(index)}>
            <HiOutlineTrash size={20} />
          </IconButton>
        </Bottom>
      )}
    </Backdrop>,
    document.body,
  );
}
