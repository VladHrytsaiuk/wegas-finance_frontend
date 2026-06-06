import styled, { keyframes } from "styled-components";

// --- ANIMATIONS ---
const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
`;

// --- MODAL LAYOUT ---

export const ModalContainer = styled.div<{ $hasImage: boolean }>`
  width: 95vw;
  max-width: 1600px;
  height: 90vh;

  display: flex;
  flex-direction: column;
  background: var(--color-bg-surface);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

  animation: ${fadeIn} 0.2s ease-out;

  @media (max-width: 768px) {
    width: 100vw;
    height: 100dvh;
    border-radius: 0;
  }
`;

export const SplitLayout = styled.div<{ $hasImage: boolean }>`
  display: grid;
  grid-template-columns: ${(props) => (props.$hasImage ? "320px 1fr" : "1fr")};
  height: 100%;
  overflow: hidden;

  @media (max-width: 1100px) {
    grid-template-columns: ${(props) =>
      props.$hasImage ? "260px 1fr" : "1fr"};
  }

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    overflow-y: auto;
  }
`;

export const FormFormElement = styled.form`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

// --- IMAGE PANEL ---

export const ImagePanel = styled.div`
  background-color: #111;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  border-right: 1px solid var(--color-border);
  height: 100%;
  width: 100%;

  .react-transform-wrapper,
  .react-transform-component {
    width: 100% !important;
    height: 100% !important;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  @media (max-width: 900px) {
    height: 300px;
    border-right: none;
    border-bottom: 1px solid var(--color-border);
  }
`;

export const ImageControls = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 20;
`;

export const NavigationControls = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 20;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
  padding: 6px 12px;
  border-radius: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

export const CounterBadge = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: #1f2937;
  min-width: 40px;
  text-align: center;
`;

export const ControlButton = styled.button<{ $variant?: "danger" }>`
  background: transparent;
  border: none;
  color: ${(props) => (props.$variant === "danger" ? "#fca5a5" : "#e5e7eb")};
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1.2rem;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    color: white;
    transform: scale(1.1);
  }
`;

// --- FORM GENERAL AREA ---

export const RightSideWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background-color: var(--color-bg-surface);
`;

export const FormScrollArea = styled.div`
  flex: 1;
  padding: 0.5rem 2rem 2.5rem 2rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  background-color: var(--color-bg-surface);

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--color-text-secondary);
    border-radius: 4px;
  }

  @media (max-width: 768px) {
    padding: 1rem;
    padding-bottom: 2rem;
  }
`;

export const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem 0.8rem 2rem;
  background-color: var(--color-bg-surface);
  border-bottom: 1px solid var(--color-border);
  z-index: 10;
  flex-shrink: 0;
`;

export const Title = styled.h2`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0;
`;

export const ConditionalFieldsContainer = styled.div`
  margin-bottom: 0;
`;

export const RowGroup = styled.div<{ $columns?: string }>`
  display: grid;
  grid-template-columns: ${(props) => props.$columns || "1fr 1fr"};
  gap: 1rem;
  align-items: start;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

export const Label = styled.label`
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: 0.4rem;
`;

export const LabelLockWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

export const LockIconWrapper = styled.span`
  color: var(--color-text-tertiary);
  cursor: help;
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
`;

export const CurrencyHint = styled.span`
  opacity: 0.7;
  white-space: nowrap;
`;

export const AmountLabelInner = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: nowrap;
`;

export const ErrorText = styled.span`
  font-size: 0.85rem;
  color: var(--color-red-600);
  margin-top: 0.3rem;
  display: block;
`;

export const RequiredStar = styled.span`
  color: var(--color-red-500);
`;

export const StyledInput = styled.input<{
  $hasError?: boolean;
  $isLocked?: boolean;
}>`
  width: 100%;
  padding: 0.75rem 0.9rem;
  border: 1px solid
    ${(props) =>
      props.$hasError ? "var(--color-red-600)" : "var(--color-text-light)"};
  border-radius: 8px;
  background-color: ${(props) =>
    props.$isLocked ? "var(--color-bg-secondary)" : "var(--color-bg-surface)"};
  color: var(--color-text-main);
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.2s;
  cursor: ${(props) => (props.$isLocked ? "not-allowed" : "text")};

  &:hover {
    border-color: ${(props) =>
      props.$isLocked
        ? "var(--color-text-light)"
        : "var(--color-text-secondary)"};
  }
  &:focus {
    outline: none;
    border-color: ${(props) =>
      props.$isLocked ? "var(--color-text-light)" : "var(--color-brand-600)"};
    box-shadow: ${(props) =>
      props.$isLocked ? "none" : "0 0 0 3px var(--color-brand-50)"};
  }
`;

export const InputWrapper = styled.div`
  position: relative;
`;

export const ExchangeRateHint = styled.div`
  position: absolute;
  top: -20px;
  right: 0;
  font-size: 0.7rem;
  color: var(--color-text-secondary);
`;

export const StyledTextarea = styled.textarea`
  width: 100%;
  padding: 0.75rem 0.9rem;
  border: 1px solid var(--color-text-light);
  border-radius: 8px;
  background-color: var(--color-bg-surface);
  color: var(--color-text-main);
  resize: vertical;
  min-height: 38px;
  height: 38px;
  font-family: inherit;
  font-size: 0.95rem;
  transition: all 0.2s;

  &:hover {
    border-color: var(--color-text-secondary);
  }
  &:focus {
    outline: none;
    border-color: var(--color-brand-600);
    box-shadow: 0 0 0 3px var(--color-brand-50);
  }
`;

export const Footer = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.25rem 2rem;
  background-color: var(--color-bg-surface);
  border-top: 1px solid var(--color-border);
  z-index: 20;
  flex-shrink: 0;

  /* Sticky behavior */
  position: sticky;
  bottom: 0;
  box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    padding: 1rem;
    gap: 1rem;
  }
`;

export const FooterNoteWrapper = styled.div`
  flex: 1;
`;

export const ButtonsGroup = styled.div`
  display: flex;
  gap: 0.8rem;
`;

export const DetailsTriggerButton = styled.button`
  background: none;
  border: none;
  color: var(--color-brand-600);
  font-size: 0.95rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem 0;
  transition: color 0.2s;

  &:hover {
    text-decoration: underline;
    color: var(--color-brand-700);
  }
`;

export const TransferDetailsHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin: 0.5rem 0;
  color: var(--color-brand-600);
  font-size: 0.9rem;
  font-weight: 500;
`;

// --- FILE UPLOAD ---

export const FileUploadWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const UploadButtonLabel = styled.label`
  cursor: pointer;
`;

export const UploadButtonInner = styled.span`
  display: flex;
  gap: 6px;
  align-items: center;
`;

export const HiddenFileInput = styled.input`
  display: none;
`;

export const CompressingState = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-secondary);
`;

export const CompressingText = styled.span`
  font-size: 0.9rem;
`;

// --- ASSET SECTION ---

export const AssetSection = styled.div`
  margin-bottom: 0;
`;

export const AssetContentWrapper = styled.div`
  margin-top: 0.5rem;
  padding-left: 0.8rem;
  border-left: 2px solid var(--color-border);
  animation: ${fadeIn} 0.2s ease-out;
`;

export const AssetMileageContainer = styled.div`
  margin-top: 1rem;
`;

export const AssetMileageLabelInner = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const AssetMileageInput = styled(StyledInput)`
  font-weight: 500;
`;

export const AssetWarningBlock = styled.div`
  margin-top: 10px;
  padding: 12px;
  background-color: var(--color-yellow-50);
  border: 1px solid var(--color-yellow-200);
  border-radius: 8px;
  color: var(--color-yellow-800);
  font-size: 0.85rem;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  line-height: 1.4;
`;

export const AssetWarningIconWrapper = styled.div`
  color: var(--color-yellow-600);
  flex-shrink: 0;
  margin-top: 1px;
`;

export const AssetWarningTitle = styled.strong`
  display: block;
  margin-bottom: 2px;
`;

export const AssetHistoryHint = styled.div`
  margin-top: 6px;
  font-size: 0.8rem;
  color: var(--color-text-tertiary);
  padding: 4px 8px;
  text-align: right;
`;

// --- ASSET UNLINK MODAL ---

export const UnlinkModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  text-align: center;
  align-items: center;
`;

export const UnlinkModalIconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--color-yellow-100);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-yellow-600);
`;

export const UnlinkModalTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-text-main);
`;

export const UnlinkModalText = styled.p`
  color: var(--color-text-secondary);
`;

export const UnlinkModalButtons = styled.div`
  display: flex;
  gap: 1rem;
  width: 100%;
  margin-top: 0.5rem;

  button {
    flex: 1;
  }
`;

// --- ITEMS TABLE STYLES ---

export const ItemsTableContainer = styled.div`
  margin-top: 0;
`;

export const ItemsContainer = styled.div`
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background-color: var(--color-bg-surface);
  overflow: hidden;
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

export const ItemsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1rem;
  background-color: var(--color-bg-surface);
  border-bottom: 1px solid var(--color-border);
`;

export const ItemsTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text-main);
`;

export const CloseTableButton = styled.button`
  background: none;
  border: none;
  color: var(--color-red-600);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s;

  &:hover {
    background-color: var(--color-red-50);
  }
`;

export const TableScrollWrapper = styled.div`
  overflow-x: auto;
  width: 100%;

  &::-webkit-scrollbar {
    height: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--color-text-secondary);
    border-radius: 4px;
    background-clip: content-box;
    border: 2px solid transparent;
  }
`;

export const TableInnerContent = styled.div`
  min-width: 800px;
`;

const TABLE_GRID_TEMPLATE = "40px 1.5fr 1.5fr 0.8fr 1fr 1fr 1.2fr 40px";

export const TableGridRow = styled.div`
  display: grid;
  grid-template-columns: ${TABLE_GRID_TEMPLATE};
  gap: 10px;
  align-items: center;
  padding: 0.4rem 0.5rem;
  border-bottom: 1px solid var(--color-border);
`;

export const TableHeaderRow = styled(TableGridRow)`
  background-color: rgba(0, 0, 0, 0.02);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  height: 40px;
  border-top: 1px solid var(--color-border);
`;

export const TableRow = styled(TableGridRow)`
  background-color: var(--color-bg-surface);
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--color-bg-page);
  }
`;

// --- TABLE INPUTS & BUTTONS ---

export const TableInput = styled.input`
  width: 100%;
  height: 32px;
  padding: 4px 8px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  color: var(--color-text-main);
  font-size: 0.9rem;
  transition: all 0.2s;

  &:hover {
    border-color: var(--color-border);
    background-color: var(--color-bg-page);
  }

  &:focus {
    outline: none;
    border-color: var(--color-brand-500);
    background-color: var(--color-bg-surface);
    box-shadow: 0 0 0 2px var(--color-brand-100);
  }

  &::placeholder {
    color: var(--color-text-tertiary);
    opacity: 0.7;
  }
`;

export const DeleteButton = styled.button`
  background: transparent;
  border: 1px solid transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    color: var(--color-red-600);
    background-color: var(--color-red-50);
    border-color: var(--color-red-100);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--color-red-100);
  }
`;

// --- TABLE COLUMNS HELPER ---

export const ColCenter = styled.div`
  text-align: center;
`;

export const ColRight = styled.div`
  text-align: right;
`;

export const ColIndex = styled(ColCenter)`
  color: var(--color-text-tertiary);
  font-size: 0.8rem;
`;

export const ColTotal = styled(ColRight)`
  font-weight: 600;
  padding-right: 4px;
  font-family: "Roboto Mono", monospace;
`;

export const EmptyState = styled.div`
  padding: 2rem;
  text-align: center;
  color: var(--color-text-tertiary);
  font-size: 0.95rem;
  font-style: italic;
  border-bottom: 1px solid var(--color-border);
`;

export const ItemsFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: var(--color-bg-surface);
  border-top: 1px solid var(--color-border);
`;

export const TotalAmount = styled.span`
  font-size: 1.2rem;
  font-weight: 700;
  font-family: "Roboto Mono", monospace;
  color: var(--color-text-main);
`;
