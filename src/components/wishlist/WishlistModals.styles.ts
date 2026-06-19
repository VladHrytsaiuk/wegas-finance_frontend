import styled, { css } from "styled-components";

// Стилі для react-modal
export const ModalContainerOverrides = {
  maxWidth: "750px", /* Increased width to ensure it's wider than tall */
  width: "100%",
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
  height: auto; /* Shrink-wrap content */
  background-color: var(--color-bg-surface);
`;

export const Header = styled.div`
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: flex-start; /* Left-aligned like other modals */
  position: relative;
  background-color: var(--color-bg-surface);
  flex-shrink: 0;

  @media (min-width: 768px) {
    padding: 1rem 1.5rem;
  }
`;

export const Title = styled.h3`
  font-size: 1.25rem; /* Matches standard modal title size */
  font-weight: 700;
  margin: 0;
  color: var(--color-text-main);
`;

export const Content = styled.div`
  padding: 1rem;
  overflow-y: auto;
  max-height: 75vh;

  @media (min-width: 768px) {
    padding: 1.5rem;
  }

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
  gap: 1.75rem; /* Balanced gap between major blocks */
  width: 100%;
`;

export const WishForm = styled.form`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  width: 100%;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1.2fr;
    align-items: stretch;
  }
`;

export const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const InputGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  width: 100%;
`;

export const FieldGroup = styled.div<{ $width?: string }>`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
  width: ${(p) => p.$width || "100%"};
`;

export const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  white-space: nowrap;
`;

// --- PHOTO UPLOAD ---
export const ImageUploadContainer = styled.div`
  width: 100%;
  height: 100%; /* Stretch to fill LeftColumn */
  min-height: 250px;
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
    background-color: var(--color-bg-hover);
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
  padding: 1rem;
  border-top: 1px solid var(--color-border);
  background-color: var(--color-bg-surface);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  flex-shrink: 0;

  @media (min-width: 768px) {
    padding: 1rem 1.5rem;
  }

  button {
    height: 38px;
    font-size: 0.95rem;
    padding: 0 1rem;
    min-width: 100px;
    
    @media (min-width: 768px) {
      min-width: 120px;
    }
  }
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

// --- NEW STYLES FOR GROUP MODAL (Restructured) ---

export const CompactInputRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
  margin-bottom: 0.5rem;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: flex-end;
    gap: 1.5rem;
  }
`;

export const PickersRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 1.5rem;
  width: 100%;

  & > div {
    flex: 1;
    width: 100%;
    
    button {
      width: 100% !important;
    }
  }

  @media (min-width: 768px) {
    width: auto;
    
    & > div {
      flex: initial;
      width: auto;
      
      button {
        width: auto !important;
      }
    }
  }
`;


export const InlineGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  height: 44px; /* Matches Input height */
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem; /* Tightened space below label */
  
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--color-brand-600);
  letter-spacing: 0.05em;
`;

export const VisibilitySection = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const ToggleGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem; /* Balanced gap between toggles */
  width: 100%;
`;

export const ToggleButton = styled.div<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 0.5rem 1rem; /* Compact height */
  border-radius: 10px; /* Refined radius */
  border: 2px solid;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;
  font-size: 0.9rem; /* Smaller font size */

  ${(p) =>
    p.$isActive
      ? css`
          background-color: var(--color-brand-50);
          border-color: var(--color-brand-500);
          color: var(--color-brand-700);
        `
      : css`
          background-color: var(--color-bg-surface);
          border-color: var(--color-border);
          color: var(--color-text-tertiary);
          &:hover {
            border-color: var(--color-text-secondary);
            background-color: var(--color-bg-hover);
          }
        `}
`;

export const HideFromContainer = styled.div`
  margin-top: 1rem; /* Separation from toggles */
  padding: 1rem;
  background-color: var(--color-bg-page);
  border-radius: 12px;
  border: 1px solid var(--color-border);
  width: 100%;
`;

export const HideFromLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem; /* Smaller label */
  color: var(--color-text-secondary);
  margin-bottom: 0.5rem; /* Tighter gap */
`;

export const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem; /* Minimal space between tags */
  max-height: 5.5rem;
  overflow-y: auto;
  width: 100%;

  /* Hide scrollbar */
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

export const UserPill = styled.div<{ $isSelected: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.25rem 0.6rem; /* Tighter padding */
  border-radius: 8px;
  font-size: 0.8rem; /* text-sm equivalent */
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid;

  ${(p) =>
    p.$isSelected
      ? css`
          background-color: var(--color-grey-100);
          border-color: var(--color-grey-400);
          color: var(--color-text-main);
        `
      : css`
          background-color: var(--color-bg-surface);
          border-color: var(--color-border);
          color: var(--color-text-secondary);
          &:hover {
            background-color: var(--color-bg-hover);
            border-color: var(--color-text-tertiary);
          }
        `}
`;

// --- WIZARD / STEPPER ---
export const ProgressWrapper = styled.div`
  padding: 1rem 1.5rem 0;
  background-color: var(--color-bg-surface);
  border-bottom: 1px solid var(--color-border);
`;

export const StepIndicator = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  margin-bottom: 1rem;
  max-width: 320px;
  margin-left: auto;
  margin-right: auto;

  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background-color: var(--color-border);
    transform: translateY(-50%);
    z-index: 0;
  }
`;

export const StepItem = styled.div<{ $active: boolean; $completed: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  z-index: 1;
  background-color: var(--color-bg-surface);
  padding: 0 0.75rem;
`;

export const StepNumber = styled.div<{ $active: boolean; $completed: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.75rem;
  transition: all 0.3s ease;

  background-color: ${(props) =>
    props.$active || props.$completed
      ? "var(--color-brand-600)"
      : "var(--color-bg-page)"};
  color: ${(props) =>
    props.$active || props.$completed ? "white" : "var(--color-text-tertiary)"};
  border: 2px solid
    ${(props) =>
      props.$active || props.$completed
        ? "var(--color-brand-600)"
        : "var(--color-border)"};
`;

export const StepLabel = styled.span<{ $active: boolean }>`
  font-size: 0.65rem;
  font-weight: 700;
  color: ${(props) =>
    props.$active ? "var(--color-text-main)" : "var(--color-text-tertiary)"};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;
