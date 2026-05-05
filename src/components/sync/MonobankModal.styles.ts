import styled from "styled-components";
// === STYLED COMPONENTS ===

// 🔥 LAYOUT FIX:
// Container: має max-height.
// ContentWrapper: заповнює все.
// ScrollableList: flex: 1 + overflow-y: auto + min-height: 0. Це магічна комбінація.

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 650px;
  max-height: 80vh; /* Якщо все одно скролить весь екран, спробуй 80vh */
  background-color: var(--color-bg-surface);
  position: relative;
  overflow: hidden; /* Обрізає все, що намагається вилізти */
  border-radius: 12px;
`;

export const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  max-height: 100%; /* Гарантуємо, що не вилізе за межі Container */
  padding: 1.5rem;
  box-sizing: border-box; /* КРИТИЧНО: щоб паддінг не збільшував розмір блоку */
  overflow: hidden; /* Ховаємо загальний скрол на цьому рівні */
`;

// Спеціальна обгортка для центрованих стейтів (Loading, Error, Success)
export const CenterState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 1rem;
`;

export const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  margin-bottom: 1rem;
`;

export const Title = styled.h2`
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--color-text-main);
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

export const Description = styled.div`
  font-size: 0.95rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
`;

export const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  padding: 0.8rem;
  border-radius: 6px;
  color: var(--color-error);
  background-color: var(--color-error-50);
  border: 1px solid var(--color-error-200);
`;

export const ScrollableList = styled.div`
  flex: 1;
  overflow-y: auto;
  min-height: 0;

  padding-right: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--color-border);
    border-radius: 10px;
  }
`;

export const FooterRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
  border-top: 1px solid var(--color-border);
  padding-top: 1rem;
  flex-shrink: 0;
`;

export const DisconnectOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(2px);
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: inherit; /* Спадкує radius контейнера */
`;

export const AccountCard = styled.div<{
  $isSelected: boolean;
  $isLocked?: boolean;
}>`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1rem;
  padding: 1.2rem;
  border: 1px solid
    ${(props) =>
      props.$isSelected ? "var(--color-brand-500)" : "var(--color-border)"};
  border-radius: 12px;
  background-color: ${(props) =>
    props.$isLocked
      ? "var(--color-bg-secondary)"
      : props.$isSelected
        ? "var(--color-brand-50)"
        : "var(--color-bg-surface)"};
  opacity: ${(props) => (props.$isLocked ? 0.8 : 1)};
  transition: all 0.2s ease-in-out;
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 0.8rem;
`;

export const Badge = styled.span`
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 6px;
  background-color: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  font-weight: 600;
  border: 1px solid var(--color-border);

  &.jar {
    background-color: #ea5353;
    color: white;
    border-color: transparent;
  }
`;

export const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
`;

export const FullWidthRow = styled.div`
  grid-column: 1 / -1;
`;

export const Label = styled.label`
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.4rem;
  display: block;
  font-weight: 500;
`;

export const CheckboxContainer = styled.label<{ $disabled?: boolean }>`
  display: inline-block;
  vertical-align: top;
  padding-top: 4px;
  cursor: ${(props) => (props.$disabled ? "default" : "pointer")};
`;

export const HiddenCheckbox = styled.input.attrs({ type: "checkbox" })`
  border: 0;
  clip: rect(0 0 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
`;

export const StyledCheckbox = styled.div<{
  checked: boolean;
  $disabled?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: ${(props) =>
    props.$disabled
      ? "var(--color-text-tertiary)"
      : props.checked
        ? "var(--color-brand-600)"
        : "var(--color-bg-surface)"};
  border: 2px solid
    ${(props) =>
      props.$disabled
        ? "transparent"
        : props.checked
          ? "var(--color-brand-600)"
          : "var(--color-border)"};
  border-radius: 6px;
  transition: all 0.2s;
  color: white;
`;

export const SelectOption = styled.div<{ $isActive?: boolean }>`
  padding: 0.8rem 1rem;
  cursor: pointer;
  font-size: 0.95rem;
  color: var(--color-text-main);
  background-color: ${(props) =>
    props.$isActive ? "var(--color-bg-hover)" : "transparent"};
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background-color: var(--color-bg-hover);
  }
`;

export const GroupLabel = styled.div`
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  background-color: var(--color-bg-secondary);
  text-transform: uppercase;
`;

export const InfoBox = styled.div`
  background-color: var(--color-brand-50);
  border: 1px solid var(--color-brand-200);
  border-radius: 12px;
  padding: 1.2rem;
  margin-bottom: 2rem;
  text-align: left;
`;

export const InfoTitle = styled.h4`
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-brand-700);
  margin-bottom: 8px;
  font-size: 1rem;
  font-weight: 600;
`;

export const InfoList = styled.ul`
  margin: 0;
  padding-left: 1.2rem;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  line-height: 1.6;
  li {
    margin-bottom: 4px;
  }
`;

export const JarSettings = styled.div`
  margin-top: 0.5rem;
  padding: 0.6rem 0.8rem;
  background-color: var(--color-brand-50);
  border-radius: 8px;
  border: 1px dashed var(--color-brand-200);
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

export const SmallCheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text-main);
  cursor: pointer;
  user-select: none;
  width: 100%;
`;

export const WarningText = styled.div`
  font-size: 0.75rem;
  color: var(--color-warning-dark);
  margin-top: 0.3rem;
  display: flex;
  align-items: center;
  gap: 4px;
`;
