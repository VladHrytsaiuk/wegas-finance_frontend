import styled from "styled-components";

// --- ЛЕЙАУТ МОДАЛКИ ---

export const FormContainer = styled.div`
  width: 55rem; /* Трохи ширше для 3-х колонок */
  max-width: 95vw;
  height: 80vh; /* Трохи менша висота, бо контент стане компактнішим */
  max-height: 800px;
  display: flex;
  flex-direction: column;
  margin: -2.4rem;
  padding: 0;
`;

export const FormHeader = styled.div`
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const FormTitle = styled.h2`
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--color-text-main);
  margin: 0;
`;

export const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 2rem;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--color-border);
    border-radius: 4px;
  }
`;

export const FormFooter = styled.div`
  padding: 1rem 2rem;
  border-top: 1px solid var(--color-border);
  background-color: var(--color-bg-subtle);
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

// --- КОМПАКТНА СІТКА (GRID SYSTEM) ---

export const Grid = styled.div<{ columns?: string }>`
  display: grid;
  grid-template-columns: ${(p) => p.columns || "1fr 1fr"};
  gap: 1rem;
  margin-bottom: 1rem;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Label = styled.label`
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 0.3rem;
  color: var(--color-text-secondary);
`;

export const SectionTitle = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-brand-600);
  margin-top: 1.2rem;
  margin-bottom: 0.8rem;
  padding-bottom: 0.2rem;
  border-bottom: 1px dashed var(--color-border);
  display: flex;
  align-items: center;
  gap: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const SelectOptions = styled.div`
  display: flex;
  flex-direction: column;
`;

export const OptionItem = styled.div<{ $isActive: boolean }>`
  padding: 8px 10px;
  cursor: pointer;
  font-size: 0.9rem;
  background-color: ${(p) =>
    p.$isActive ? "var(--color-brand-50)" : "transparent"};
  color: ${(p) =>
    p.$isActive ? "var(--color-brand-700)" : "var(--color-text-main)"};
  &:hover {
    background-color: var(--color-bg-subtle);
  }
`;

export const FileUploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 1rem;
  border: 1px dashed var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-subtle);
`;

export const FileUploadControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const HiddenInput = styled.input`
  display: none;
`;

export const FileCount = styled.span`
  font-size: 0.85rem;
  color: var(--color-text-secondary);
`;

// --- ГАЛЕРЕЯ ФОТОГРАФІЙ (МІНІАТЮРИ) ---

export const ImageGallery = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 4px;
`;

export const ThumbnailWrapper = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  background-color: var(--color-bg-page);
`;

export const Thumbnail = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

export const RemoveThumbBtn = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid var(--color-border);
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-red-600);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-red-100);
    transform: scale(1.1);
  }
`;

// --- 🔥 СПИСОК ДОКУМЕНТІВ (РЯДКИ) ---

export const DocList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
`;

export const DocItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: var(--color-bg-page);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 0.85rem;
  color: var(--color-text-main);
`;

export const DocInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;

  svg {
    color: var(--color-red-500);
    flex-shrink: 0;
  }
`;

export const DocName = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
`;

export const RemoveDocBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--color-text-tertiary);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition:
    color 0.2s,
    background-color 0.2s;

  &:hover {
    color: var(--color-red-600);
    background-color: var(--color-red-50);
  }
`;
