import styled, { css } from "styled-components";

// --- GLOBAL MODAL SETTINGS ---
export const ModalContainerOverrides = {
  maxWidth: "900px",
  width: "95%",
  padding: "0",
  display: "flex",
  flexDirection: "column" as const,
  maxHeight: "90vh",
  overflow: "hidden",
};

// --- LAYOUT ---
export const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 900px; /* Fixed width to prevent jumping */
  height: 650px; /* Fixed height to prevent jumping */
  max-width: 95vw;
  max-height: 90vh;
  background-color: var(--color-bg-surface);
  position: relative;

  @media (max-width: 768px) {
    width: 100%;
    height: auto;
    max-width: 100%;
    max-height: none;
  }
`;

export const FormHeader = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--color-bg-surface);
  flex-shrink: 0;
`;

export const FormTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0;
`;

export const ScrollArea = styled.div`
  padding: 1rem 1.5rem;
  overflow-y: auto;
  flex: 1;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--color-border);
    border-radius: 4px;
  }
`;

export const FormFooter = styled.div`
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

// --- GRID SYSTEM ---
export const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const Grid = styled.div<{ columns?: string }>`
  display: grid;
  grid-template-columns: ${(p) => p.columns || "1fr 1fr"};
  gap: 1.5rem;
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

export const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

export const Label = styled.label`
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-secondary);
`;

export const SectionTitle = styled.h4`
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-brand-600);
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  border-bottom: 1px dashed var(--color-border);
  padding-bottom: 0.4rem;
`;

// --- WIZARD / STEPPER ---
export const ProgressWrapper = styled.div`
  padding: 1rem 1.5rem 0;
  background-color: var(--color-bg-surface);
`;

export const StepIndicator = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  margin-bottom: 1rem;

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

// --- SELECT / OPTIONS ---
export const SelectOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 4px;
`;

export const OptionItem = styled.div<{ $isActive: boolean }>`
  padding: 0.6rem 0.8rem;
  cursor: pointer;
  font-size: 0.9rem;
  border-radius: 4px;
  background-color: ${(p) =>
    p.$isActive ? "var(--color-bg-hover)" : "transparent"};
  color: var(--color-text-main);
  &:hover {
    background-color: var(--color-bg-hover);
  }
`;

// --- FILE UPLOAD ---
export const FileUploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 1rem;
  border: 1px dashed var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-page);
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
  color: var(--color-text-tertiary);
`;

// --- GALLERY ---
export const ImageGallery = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 4px;
`;

export const ThumbnailWrapper = styled.div`
  position: relative;
  width: 70px;
  height: 70px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  background-color: var(--color-bg-page);
`;

export const Thumbnail = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const RemoveThumbBtn = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.2s ease;
  &:hover {
    background: rgba(0, 0, 0, 0.8);
    transform: scale(1.1);
  }
`;

// --- DOCUMENTS ---
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
  padding: 0.5rem 0.75rem;
  background-color: var(--color-bg-surface);
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
`;

export const DocName = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
`;

export const RemoveDocBtn = styled.button`
  background: none;
  border: none;
  color: var(--color-text-tertiary);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    color: var(--color-red-600);
    background-color: var(--color-bg-hover);
  }
`;

export const ErrorText = styled.span`
  color: var(--color-red-600);
  font-size: 0.75rem;
  margin-top: 0.1rem;
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background-color: var(--color-bg-surface);
  color: var(--color-text-main);
  font-family: inherit;
  font-size: 0.9rem;
  resize: none;
  height: 80px;
  outline: none;
  &:focus {
    border-color: var(--color-brand-600);
  }
`;
