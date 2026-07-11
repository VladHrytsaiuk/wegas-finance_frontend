import styled, { css } from "styled-components";

// --- LAYOUT ---

export const FormContainer = styled.div`
  display: flex;
  gap: 2.5rem;
  position: relative;
  height: 480px;
  width: 900px;
  align-items: flex-start;

  @media (max-width: 900px) {
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
  gap: 0.75rem;
  min-width: 400px;
  height: 100%;
  max-height: 100%;
  overflow-y: auto;
  padding-right: 1rem;

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

export const RightColumn = styled.div`
  width: 340px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (max-width: 900px) {
    width: 100%;
    order: -1;
  }
`;

// --- PREVIEW SECTION ---

export const PreviewSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  background-color: var(--color-bg-page);
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  width: 100%;
  flex-shrink: 0;
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

export const BankTabs = styled.div`
  display: flex;
  gap: 0.6rem;
  overflow-x: auto;
  padding-bottom: 0.8rem;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border);
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const BankTab = styled.button<{ $active: boolean }>`
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  border: 1px solid
    ${(p) => (p.$active ? "var(--color-brand-600)" : "transparent")};
  background-color: ${(p) =>
    p.$active ? "var(--color-brand-50)" : "var(--color-bg-page)"};
  color: ${(p) =>
    p.$active ? "var(--color-brand-700)" : "var(--color-text-secondary)"};

  &:hover {
    background-color: ${(p) =>
      p.$active ? "var(--color-brand-50)" : "var(--color-border)"};
    color: var(--color-text-main);
  }
`;

export const SkinGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 0.8rem;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 350px;
  padding: 1rem 1rem 1rem 1rem;
  margin: 0 -1rem;
`;

export const SkinOption = styled.button<{
  $bg: string;
  $textColor: string;
  $selected: boolean;
}>`
  aspect-ratio: 1.58;
  width: 100%;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background: ${(p) => p.$bg};
  color: ${(p) => p.$textColor};
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.7rem;
  text-align: center;
  padding: 0.4rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  outline: ${(p) =>
    p.$selected ? "3px solid var(--color-brand-500)" : "2px solid transparent"};
  outline-offset: 3px;

  &:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.2);
    z-index: 10;
  }

  ${(p) =>
    p.$selected &&
    css`
      &::after {
        content: "✓";
        position: absolute;
        top: -10px;
        right: -10px;
        width: 24px;
        height: 24px;
        background-color: var(--color-brand-600);
        color: white;
        border-radius: 50%;
        border: 2px solid var(--color-bg-surface);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        z-index: 20;
      }
    `}
`;

export const SkinSelectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  outline: none; /* Щоб при фокусі на контейнері не було рамки */
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

// const CardBase = css`
//   position: relative;
//   width: 100%;

//   /* 🔥 FIX 1: Задаємо min-height, щоб картка не була "сплюснутою" */
//   min-height: 180px;
//   /* aspect-ratio залишаємо як рекомендацію, але min-height головніший */
//   aspect-ratio: 1.586;

//   border-radius: 12px;

//   /* 🔥 FIX 2: Зменшуємо padding з 1.2rem до 1rem (або 1.1), щоб було більше місця */
//   padding: 1rem;

//   display: flex;
//   flex-direction: column;
//   justify-content: space-between;
//   box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
//   overflow: hidden;
//   transition:
//     transform 0.2s ease,
//     box-shadow 0.2s ease;
//   cursor: pointer;
//   box-sizing: border-box;

//   &:hover {
//     transform: translateY(-4px);
//     box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
//     z-index: 10;
//   }
// `;
