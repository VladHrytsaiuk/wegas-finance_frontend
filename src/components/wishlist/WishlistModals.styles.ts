import styled from "styled-components";

// Стилі для react-modal
export const ModalContainerOverrides = {
  maxWidth: "500px",
  width: "95%",
  padding: "0",
  display: "flex",
  flexDirection: "column" as const,
  maxHeight: "90vh",
  borderRadius: "16px",
  backgroundColor: "var(--color-bg-surface)",
};

export const ModalContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--color-bg-surface);
`;

export const Header = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--color-bg-surface);
  flex-shrink: 0;
`;

export const Title = styled.h3`
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0;
  color: var(--color-text-main);
`;

export const Content = styled.div`
  padding: 1.25rem 1.5rem;
  overflow-y: auto;
  flex: 1;
  max-height: 60vh;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--color-border);
    border-radius: 10px;
  }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding-bottom: 1rem;
`;

export const Row = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
  width: 100%;
`;

export const HalfRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

export const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  position: relative;
`;

export const Label = styled.label`
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-secondary);
`;

// --- PHOTO UPLOAD ---
export const ImageUploadContainer = styled.div`
  width: 100%;
  height: 140px;
  border-radius: 12px;
  background-color: var(--color-bg-page);
  border: 2px dashed var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--color-brand-500);
    background-color: var(--color-brand-50);
  }
`;

export const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const RemovePhotoButton = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  button {
    background: rgba(0, 0, 0, 0.6);
    color: white;
    border: none;
    padding: 6px;
    &:hover {
      background: rgba(0, 0, 0, 0.8);
      transform: scale(1.1);
    }
  }
`;

export const UploadPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  color: var(--color-text-tertiary);
  text-align: center;

  svg {
    color: var(--color-brand-400);
    width: 28px;
    height: 28px;
  }

  span {
    font-size: 0.85rem;
    font-weight: 500;
  }
`;

export const FooterActions = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--color-border);
  background-color: var(--color-bg-surface);
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
  flex-shrink: 0;
`;

// --- SELECT OPTION ---
export const SelectOption = styled.div<{ $isSelected?: boolean }>`
  padding: 0.6rem 0.8rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${(props) =>
    props.$isSelected ? "var(--color-brand-50)" : "transparent"};
  color: ${(props) =>
    props.$isSelected ? "var(--color-brand-700)" : "var(--color-text-main)"};
  font-weight: ${(props) => (props.$isSelected ? 600 : 400)};
  border-radius: 6px;
  font-size: 0.9rem;

  &:hover {
    background-color: var(--color-bg-hover);
  }
`;

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 1rem;
  background-color: var(--color-bg-page);
  border-radius: 12px;
  border: 1px solid var(--color-border);
`;

export const SectionTitle = styled.h4`
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-tertiary);
  margin: 0;
`;
