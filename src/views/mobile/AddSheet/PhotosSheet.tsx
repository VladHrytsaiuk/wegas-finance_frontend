import { useEffect, useMemo } from "react";
import { HiPlus, HiXMark } from "react-icons/hi2";
import styled from "styled-components";

import { Sheet, SheetTextButton } from "../../../mobile/ui/Sheet";

// Фото, прикріплені до операції до збереження: мініатюри, прибрати, додати ще.

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
`;

const Thumb = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  background: var(--m-fill);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const Remove = styled.button`
  position: absolute;
  top: 6px;
  right: 6px;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  cursor: pointer;
`;

const AddTile = styled.button`
  display: grid;
  place-items: center;
  aspect-ratio: 1;
  border: none;
  border-radius: 12px;
  background: var(--m-surface);
  color: var(--m-accent);
  cursor: pointer;
`;

interface PhotosSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  photos: File[];
  onRemove: (index: number) => void;
  onAdd: () => void;
}

export function PhotosSheet({ open, onOpenChange, photos, onRemove, onAdd }: PhotosSheetProps) {
  const urls = useMemo(() => photos.map((photo) => URL.createObjectURL(photo)), [photos]);
  useEffect(() => () => urls.forEach((url) => URL.revokeObjectURL(url)), [urls]);

  return (
    <Sheet
      nested
      open={open}
      onOpenChange={onOpenChange}
      title="Фото"
      hideCancel
      trailing={
        <SheetTextButton type="button" $bold onClick={() => onOpenChange(false)}>
          Готово
        </SheetTextButton>
      }
    >
      <Grid>
        {urls.map((url, index) => (
          <Thumb key={url}>
            <img src={url} alt={`Фото ${index + 1}`} />
            <Remove type="button" aria-label={`Прибрати фото ${index + 1}`} onClick={() => onRemove(index)}>
              <HiXMark size={16} />
            </Remove>
          </Thumb>
        ))}
        <AddTile type="button" aria-label="Додати фото" onClick={onAdd}>
          <HiPlus size={26} />
        </AddTile>
      </Grid>
    </Sheet>
  );
}
