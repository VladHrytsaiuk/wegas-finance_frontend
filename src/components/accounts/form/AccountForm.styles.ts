import styled, { css } from "styled-components";

// --- LAYOUT ---

export const FormContainer = styled.div`
  display: flex;
  gap: 2.5rem;
  position: relative;
  height: 500px;
  width: 1000px;
  align-items: stretch;

  @media (max-width: 1000px) {
    flex-direction: column;
    width: 100%;
    gap: 1.5rem;
    height: auto;
  }
`;

export const Form = styled.form`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  min-width: 400px;
  height: 100%;
  max-height: 100%;
  overflow-y: auto;
  padding-right: 1rem;
  padding-bottom: 1rem;

  @media (max-width: 600px) {
    min-width: 100%;
  }

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: 10px;
  }
`;

export const Row = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  & > div {
    flex: 1;
  }
`;

export const LeftColumn = styled.div`
  flex: 1;
  min-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding-top: 1rem;

  @media (max-width: 1000px) {
    width: 100%;
    min-width: 100%;
    order: -1;
  }
`;

// --- PREVIEW SECTION ---

export const PreviewSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-page);
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid var(--color-border);
  width: 100%;
  max-width: 420px;
  box-shadow:
    0 15px 15px -15px rgba(0, 0, 0, 0.6),
    0 2px 4px -1px rgba(0, 0, 0, 0.4);
`;

export const PreviewLabel = styled.label`
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-text-secondary);
`;

// --- BUTTONS & CONTROLS ---

export const ChangeSkinBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.8rem;
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-main);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: var(--color-bg-page);
    border-color: var(--color-brand-500);
  }
`;

export const SegmentControl = styled.div`
  display: flex;
  background-color: var(--color-bg-page);
  padding: 2px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
`;

export const SegmentButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 0.4rem;
  border-radius: 6px;
  border: none;
  background-color: ${(props) =>
    props.$active ? "var(--color-bg-surface)" : "transparent"};
  color: ${(props) =>
    props.$active ? "var(--color-brand-600)" : "var(--color-text-secondary)"};
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${(props) =>
    props.$active ? "0 2px 5px rgba(0,0,0,0.05)" : "none"};

  &:hover {
    color: var(--color-brand-700);
  }
`;

export const SelectItem = styled.button<{ $isSelected: boolean }>`
  width: 100%;
  text-align: left;
  border: none;
  background: ${(p) =>
    p.$isSelected ? "var(--color-brand-50)" : "transparent"};
  color: ${(p) =>
    p.$isSelected ? "var(--color-brand-700)" : "var(--color-text-main)"};
  padding: 0.6rem 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 1px solid var(--color-border);
  font-size: 0.9rem;
  transition: background 0.2s;

  &:hover,
  &:focus {
    background: var(--color-bg-page);
    outline: none;
  }

  &:last-child {
    border-bottom: none;
  }
`;

export const ColorGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
`;

export const ColorSwatch = styled.button<{
  $color: string;
  $selected: boolean;
}>`
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 50%;
  background-color: ${(props) => props.$color};
  border: 2px solid
    ${(props) => (props.$selected ? "var(--color-text-main)" : "transparent")};
  cursor: pointer;
  transition: transform 0.2s;
  &:hover {
    transform: scale(1.1);
  }
`;

export const ErrorText = styled.span`
  color: var(--color-red-600);
  font-size: 0.75rem;
  margin-top: 4px;
  display: block;
  font-weight: 500;
`;

export const FooterRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: auto;
`;

// --- SKIN SELECTOR STYLES ---

export const SkinSelectorBody = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  gap: 1.5rem;
`;

export const BankSidebar = styled.div`
  width: 140px;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow-y: auto;
  border-right: 1px solid var(--color-border);
  padding-right: 0.5rem;
  flex-shrink: 0;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const SidebarItem = styled.button<{ $active: boolean }>`
  padding: 0.6rem 0.8rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  background-color: ${(p) => (p.$active ? "var(--color-bg-hover)" : "transparent")};
  color: ${(p) => (p.$active ? "var(--color-text-main)" : "var(--color-text-secondary)")};

  &:hover {
    background-color: var(--color-bg-hover);
    color: var(--color-text-main);
  }
`;

export const SkinGrid = styled.div`
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  grid-auto-rows: max-content;
  gap: 1rem;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 6px 0.5rem 6px 6px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: 10px;
  }
`;

export const SkinOption = styled.button<{
  $bg: string;
  $textColor: string;
  $selected: boolean;
}>`
  aspect-ratio: 1.586;
  width: 100%;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  background: ${(p) => p.$bg};
  color: ${(p) => p.$textColor};
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.75rem;
  text-align: center;
  padding: 0.5rem;
  box-shadow: 
    inset 0 1px 1px rgba(255, 255, 255, 0.2), 
    0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  outline: ${(p) =>
    p.$selected ? "2px solid var(--color-brand-500)" : "2px solid transparent"};
  outline-offset: 2px;
  opacity: ${(p) => (p.$selected ? 1 : 0.9)};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      inset 0 1px 1px rgba(255, 255, 255, 0.3), 
      0 8px 16px rgba(0, 0, 0, 0.15);
    opacity: 1;
    z-index: 10;
  }

  ${(p) =>
    p.$selected &&
    css`
      &::after {
        content: "✓";
        position: absolute;
        top: 6px;
        right: 6px;
        width: 18px;
        height: 18px;
        background-color: var(--color-brand-600);
        color: white;
        border-radius: 50%;
        font-size: 10px;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }
    `}
`;

export const SkinSelectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 650px;
  height: 480px;
  outline: none;
`;

export const SkinSelectorTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0;
`;

export const SkinSelectorFooter = styled.div`
  margin-top: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
`;
