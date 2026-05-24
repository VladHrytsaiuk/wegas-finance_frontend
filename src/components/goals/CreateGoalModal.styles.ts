import styled from "styled-components";

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

export const ConfirmModalOverrides = {
  zIndex: 2001,
  width: "fit-content",
  maxWidth: "28rem",
  minWidth: "22rem",
  padding: "2.4rem",
  height: "auto",
  maxHeight: "90vh",
};

export const ConfirmOverlayStyles = {
  zIndex: 2000,
};

// --- LAYOUT ---
export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 90vh;
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

export const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0;
`;

export const Content = styled.div`
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

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
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

// --- FIELDS ---
export const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

export const Label = styled.label`
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-secondary);
`;

export const AmountRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 0.75rem;
  align-items: start;
`;

export const DateInputWrapper = styled.div`
  border: 1px solid var(--color-border);
  border-radius: 6px;
  overflow: hidden;
`;

// --- PHOTO ---
export const ImageUploadContainer = styled.div`
  width: 100%;
  height: 140px;
  border-radius: var(--radius-md);
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
`;

export const UploadPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-tertiary);
  text-align: center;
  padding: 0.75rem;
  font-size: 0.85rem;

  svg {
    color: var(--color-brand-500);
    width: 32px;
    height: 32px;
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
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

// --- FUNDING ---
export const FundingContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
`;

export const FundingCard = styled.div<{ $isSelected: boolean; $error?: boolean }>`
  border: 1px solid
    ${(props) =>
      props.$error 
        ? "var(--color-red-500)" 
        : props.$isSelected ? "var(--color-brand-600)" : "var(--color-border)"};
  background-color: ${(props) =>
    props.$isSelected ? "var(--color-brand-50)" : "var(--color-bg-surface)"};
  border-radius: 8px;
  padding: 0.75rem 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;

  &:hover {
    border-color: ${(props) => props.$error ? "var(--color-red-600)" : "var(--color-brand-500)"};
  }
`;

export const CardHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  line-height: 1.2;
`;

export const RadioCircle = styled.div<{ $isSelected: boolean }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid
    ${(props) =>
      props.$isSelected
        ? "var(--color-brand-600)"
        : "var(--color-text-tertiary)"};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &::after {
    content: "";
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: var(--color-brand-600);
    display: ${(props) => (props.$isSelected ? "block" : "none")};
  }
`;

export const CardContent = styled.div`
  margin-top: 0.75rem;
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;


export const SelectOption = styled.div<{ $isSelected?: boolean }>`
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  background-color: ${(props) =>
    props.$isSelected ? "var(--color-bg-hover)" : "transparent"};
  color: var(--color-text-main);

  &:hover {
    background-color: var(--color-bg-hover);
  }
`;

// --- FOOTER ---
export const Footer = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--color-border);
  background-color: var(--color-bg-surface);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  flex-shrink: 0;
`;

// --- WIZARD ---
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

export const ErrorText = styled.span`
  color: var(--color-red-600);
  font-size: 0.75rem;
  margin-top: 0.1rem;
`;
