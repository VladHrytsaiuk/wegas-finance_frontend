import styled, { keyframes } from "styled-components";

// --- ANIMATIONS ---
const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
`;

// --- MODAL LAYOUT ---

export const ModalContainer = styled.div<{ $hasImage: boolean }>`
  width: 95vw;
  max-width: 1400px;
  height: 85vh;

  display: flex;
  flex-direction: column;
  background: var(--color-bg-surface);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

  animation: ${fadeIn} 0.2s ease-out;

  @media (max-width: 768px) {
    width: 100vw;
    height: 100%;
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
  padding: 0.5rem 1.5rem 1.5rem 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  background-color: var(--color-bg-surface);

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--color-text-secondary);
    border-radius: 3px;
  }

  @media (max-width: 768px) {
    padding: 1rem;
    padding-bottom: 1rem;
  }
`;

export const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1.5rem 0.6rem 1.5rem;
  background-color: var(--color-bg-surface);
  border-bottom: 1px solid var(--color-border);
  z-index: 10;
  flex-shrink: 0;
`;

export const Title = styled.h2`
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0;
`;

export const ConditionalFieldsContainer = styled.div`
  margin-bottom: 0;
`;

export const MobileDisclosureToggle = styled.div<{ $open?: boolean }>`
  width: 100%;
  background: ${(p) =>
    p.$open ? "var(--color-bg-secondary)" : "var(--color-bg-surface)"};
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 0.95rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  cursor: pointer;
  color: var(--color-text-main);
  min-height: 56px;
  text-align: left;
  line-height: 1.2;
  user-select: none;
  pointer-events: auto;
  position: relative;
  z-index: 1;
  -webkit-tap-highlight-color: transparent;
  transition: background-color 0.2s ease;

  &:hover {
    background: var(--color-bg-hover);
  }

  &:active {
    background: var(--color-bg-hover);
  }
`;

export const MobileDisclosureTitleWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.15rem;
  min-width: 0;
  flex: 1;
`;

export const MobileDisclosureTitle = styled.span`
  display: block;
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--color-text-main);
  line-height: 1.2;
  min-height: 1.15rem;
`;

export const MobileDisclosureSubtitle = styled.span`
  display: block;
  font-size: 0.76rem;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  line-height: 1.2;
`;

export const MobileDisclosureContent = styled.div`
  margin-top: 0.75rem;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  background: var(--color-bg-surface);
`;

export const MobileDateTimeRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 108px;
  gap: 0.75rem;
  align-items: start;
`;

export const RowGroup = styled.div<{ $columns?: string }>`
  display: grid;
  grid-template-columns: ${(props) => props.$columns || "1fr 1fr"};
  gap: 0.8rem;
  align-items: start;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }
`;

export const Label = styled.label`
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: 0.2rem;
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

export const OptionalHint = styled.span`
  margin-left: 0.35rem;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--color-text-tertiary);
`;

export const StyledInput = styled.input<{
  $hasError?: boolean;
  $isLocked?: boolean;
}>`
  width: 100%;
  padding: 0.5rem 0.7rem;
  border: 1px solid
    ${(props) =>
      props.$hasError ? "var(--color-red-600)" : "var(--color-text-light)"};
  border-radius: 6px;
  background-color: ${(props) =>
    props.$isLocked ? "var(--color-bg-secondary)" : "var(--color-bg-surface)"};
  color: var(--color-text-main);
  font-size: 1rem;
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
      props.$isLocked ? "none" : "0 0 0 2px var(--color-brand-50)"};
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
  padding: 0.5rem 0.7rem;
  border: 1px solid var(--color-text-light);
  border-radius: 6px;
  background-color: var(--color-bg-surface);
  color: var(--color-text-main);
  resize: vertical;
  min-height: 32px;
  height: 32px;
  font-family: inherit;
  font-size: 0.9rem;
  transition: all 0.2s;

  &:hover {
    border-color: var(--color-text-secondary);
  }
  &:focus {
    outline: none;
    border-color: var(--color-brand-600);
    box-shadow: 0 0 0 2px var(--color-brand-50);
  }
`;

export const Footer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.8rem 1.5rem;
  background-color: var(--color-bg-surface);
  border-top: 1px solid var(--color-border);
  z-index: 20;
  flex-shrink: 0;

  /* Sticky behavior */
  position: sticky;
  bottom: 0;
  box-shadow: 0 -2px 4px -1px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    padding: 1rem;
    gap: 0.75rem;
    flex-wrap: nowrap;
    align-items: center;
  }
`;

export const FooterNoteWrapper = styled.div<{ $hiddenOnMobile?: boolean }>`
  flex: 1;

  @media (max-width: 768px) {
    display: ${(p) => (p.$hiddenOnMobile ? "none" : "block")};
  }
`;

export const ButtonsGroup = styled.div`
  display: flex;
  gap: 0.8rem;

  @media (max-width: 768px) {
    flex: 1;
    min-width: 0;

    & > * {
      flex: 1;
      min-width: 0;
    }
  }
`;

export const DetailsTriggerButton = styled.button<{
  $desktopVariant?: "default" | "subtle";
  $desktopFullWidth?: boolean;
}>`
  background: var(--color-brand-50);
  border: 1px solid var(--color-brand-200);
  border-radius: 12px;
  color: var(--color-brand-600);
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  cursor: pointer;
  padding: 0.75rem 0.9rem;
  transition: all 0.2s;
  width: 100%;
  min-height: 42px;

  &:hover {
    background: var(--color-brand-100);
    color: var(--color-brand-700);
    border-color: var(--color-brand-400);
  }

  @media (min-width: 769px) {
    width: ${(props) => (props.$desktopFullWidth ? "100%" : "auto")};
    min-width: 0;
    justify-content: ${(props) =>
      props.$desktopFullWidth ? "center" : "flex-start"};
    padding: ${(props) =>
      props.$desktopVariant === "subtle"
        ? "0.46rem 0.72rem 0.46rem 0.58rem"
        : "0.58rem 0.9rem"};
    min-height: ${(props) =>
      props.$desktopVariant === "subtle" ? "36px" : "40px"};
    border-radius: ${(props) =>
      props.$desktopVariant === "subtle" ? "10px" : "12px"};
    background: ${(props) =>
      props.$desktopVariant === "subtle"
        ? "var(--color-bg-surface)"
        : "var(--color-brand-50)"};
    border: 1px solid
      ${(props) =>
        props.$desktopVariant === "subtle"
          ? "var(--color-border)"
          : "var(--color-brand-200)"};
    color: ${(props) =>
      props.$desktopVariant === "subtle"
        ? "var(--color-text-secondary)"
        : "var(--color-brand-700)"};
    box-shadow: ${(props) =>
      props.$desktopVariant === "subtle" ? "var(--shadow-sm)" : "none"};
    font-size: ${(props) =>
      props.$desktopVariant === "subtle" ? "0.78rem" : "0.82rem"};
    font-weight: 600;
    gap: ${(props) =>
      props.$desktopVariant === "subtle" ? "0.48rem" : "0.55rem"};

    svg {
      width: ${(props) =>
        props.$desktopVariant === "subtle" ? "15px" : "16px"};
      height: ${(props) =>
        props.$desktopVariant === "subtle" ? "15px" : "16px"};
      color: var(--color-brand-600);
      flex-shrink: 0;
    }

    &:hover {
      background: ${(props) =>
        props.$desktopVariant === "subtle"
          ? "var(--color-brand-50)"
          : "var(--color-brand-100)"};
      color: ${(props) =>
        props.$desktopVariant === "subtle"
          ? "var(--color-text-main)"
          : "var(--color-brand-800)"};
      border-color: var(--color-brand-200);
      box-shadow: ${(props) =>
        props.$desktopVariant === "subtle"
          ? "0 1px 2px rgba(0, 0, 0, 0.04)"
          : "none"};
      text-decoration: none;
    }
  }

  @media (max-width: 768px) {
    font-size: 0.82rem;
    min-height: 46px;
  }
`;

export const TransferSwapRow = styled.div`
  display: flex;
  justify-content: center;
  margin: 0.15rem 0 0.35rem;
`;

export const TransferSwapButton = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 1px solid var(--color-brand-200);
  background: var(--color-brand-50);
  color: var(--color-brand-700);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover:not(:disabled) {
    background: var(--color-brand-100);
    border-color: var(--color-brand-300);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

// --- FILE UPLOAD ---

export const FileUploadWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;

  @media (min-width: 769px) {
    min-width: 150px;
  }
`;

export const PhotoSummaryButton = styled.button`
  min-width: 84px;
  height: 32px;
  padding: 0 0.75rem;
  border-radius: 10px;
  border: 1px solid var(--color-brand-200);
  background: var(--color-brand-50);
  color: var(--color-brand-700);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
  flex-shrink: 0;

  svg {
    width: 15px;
    height: 15px;
  }

  &:hover {
    background: var(--color-brand-100);
    border-color: var(--color-brand-300);
  }
`;

export const PhotoSummaryCount = styled.span`
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1;
`;

export const PhotoSummaryLabel = styled.span`
  font-size: 0.76rem;
  font-weight: 600;
  line-height: 1;
`;

export const PhotoClearButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 10px;
  border: 1px solid var(--color-red-200);
  background: var(--color-red-50);
  color: var(--color-red-700);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
  flex-shrink: 0;

  svg {
    width: 15px;
    height: 15px;
  }

  &:hover {
    color: var(--color-red-800);
    border-color: var(--color-red-300);
    background: var(--color-red-100);
  }
`;

export const UploadButtonLabel = styled.label`
  cursor: pointer;
`;

export const UploadButtonInner = styled.span`
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
`;

export const UploadButtonText = styled.span`
  font-size: 0.82rem;
  font-weight: 600;
  line-height: 1;

  @media (max-width: 768px) {
    display: none;
  }
`;

export const UploadIconButton = styled.span<{ $hasFiles?: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: ${(p) =>
    p.$hasFiles ? "var(--color-brand-50)" : "var(--color-bg-surface)"};
  color: ${(p) =>
    p.$hasFiles ? "var(--color-brand-600)" : "var(--color-text-secondary)"};
  box-shadow: var(--shadow-sm);
  border: 1px solid
    ${(p) => (p.$hasFiles ? "var(--color-brand-200)" : "var(--color-border)")};
  transition: all 0.2s ease;

  @media (min-width: 769px) {
    width: auto;
    min-width: 104px;
    padding: 0 0.8rem;
    gap: 0.45rem;
  }

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    background: ${(p) =>
      p.$hasFiles ? "var(--color-brand-100)" : "var(--color-bg-page)"};
    color: ${(p) =>
      p.$hasFiles ? "var(--color-brand-700)" : "var(--color-text-main)"};
  }
`;

export const UploadBadge = styled.span`
  position: absolute;
  top: -5px;
  right: -5px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-brand-600);
  color: white;
  font-size: 0.62rem;
  font-weight: 700;
  line-height: 1;
`;

export const HiddenFileInput = styled.input`
  display: none;
`;

export const CompressingState = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-secondary);
  min-height: 32px;
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

  @media (min-width: 769px) {
    margin-top: 0.7rem;
    padding: 0.95rem 1rem;
    border: 1px solid var(--color-border);
    border-radius: 14px;
    background: var(--color-bg-surface);
  }
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

  @media (min-width: 769px) {
    margin-top: 0.1rem;
  }
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

  @media (max-width: 768px) {
    margin-top: 0.75rem;
    border-radius: 16px;
  }
`;

export const ItemsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.8rem;
  background-color: var(--color-bg-surface);
  border-bottom: 1px solid var(--color-border);

  @media (max-width: 768px) {
    padding: 0.85rem 0.95rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
`;

export const ItemsActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    gap: 0.3rem;

    button {
      padding-inline: 0.5rem;
      font-size: 0.75rem;
      flex: 1;
    }
  }
`;

export const ItemsTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-text-main);

  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
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

  @media (max-width: 768px) {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    border: 1px solid var(--color-border);
    background: var(--color-bg-surface);
    flex-shrink: 0;

    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

export const TableScrollWrapper = styled.div`
  overflow-x: auto;
  width: 100%;

  @media (max-width: 768px) {
    overflow: visible;
  }

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

  @media (max-width: 768px) {
    min-width: 0;
  }
`;

const TABLE_GRID_TEMPLATE = "32px 1.8fr 1.6fr 0.8fr 1fr 1fr 1.2fr 32px";

export const TableGridRow = styled.div`
  display: grid;
  grid-template-columns: ${TABLE_GRID_TEMPLATE};
  gap: 6px;
  align-items: center;
  padding: 0.25rem 0.4rem;
  border-bottom: 1px solid var(--color-border);

  gap: 4px;
  padding: 0.2rem 0.3rem;
`;

export const TableHeaderRow = styled(TableGridRow)`
  background-color: rgba(0, 0, 0, 0.02);
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  height: 32px;
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
  height: 28px;
  padding: 2px 6px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  color: var(--color-text-main);
  font-size: 0.85rem;
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

  @media (max-width: 768px) {
    height: 38px;
    padding: 8px 10px;
    font-size: 0.95rem;
    border-color: var(--color-border);
    background: var(--color-bg-surface);
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
  padding: 0.6rem 1rem;
  background-color: var(--color-bg-surface);
  border-top: 1px solid var(--color-border);

  @media (max-width: 768px) {
    padding: 0.85rem 0.95rem;
  }
`;

export const TotalAmount = styled.span`
  font-size: 1.1rem;
  font-weight: 700;
  font-family: "Roboto Mono", monospace;
  color: var(--color-text-main);
`;

export const MobileItemCard = styled.div`
  padding: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-surface);
`;

export const MobileItemHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  cursor: pointer;
`;

export const MobileItemIndex = styled.span`
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
`;

export const MobileItemHeaderMain = styled.div`
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex: 1;
`;

export const MobileItemHeaderTitle = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--color-text-main);
`;

export const MobileItemHeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
`;

export const MobileItemHeaderMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 0;
`;

export const MobileItemHeaderAmount = styled.span`
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--color-text-main);
  font-family: "Roboto Mono", monospace;
  white-space: nowrap;
`;

export const MobileCollapseIcon = styled.span<{ $collapsed?: boolean }>`
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  transform: ${(p) => (p.$collapsed ? "rotate(-90deg)" : "rotate(0deg)")};
  transition: transform 0.2s ease;
`;

export const MobileDeleteButton = styled(DeleteButton)`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border-color: var(--color-border);
  flex-shrink: 0;
`;

export const MobileFieldBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;
`;

export const MobileFieldLabel = styled.span`
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
`;

export const MobileAmountGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.65rem;
  align-items: start;
`;

export const MobileTotalValue = styled.div`
  min-height: 38px;
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-bg-secondary);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-size: 0.95rem;
  font-weight: 700;
  font-family: "Roboto Mono", monospace;
  color: var(--color-text-main);
`;
