import styled from "styled-components";

export const Container = styled.div`
  max-width: 600px;
  min-height: 500px;
`;

export const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: var(--color-text-main);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 1rem;
`;

export const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  label {
    font-weight: 500;
    font-size: 0.95rem;
    color: var(--color-text-main);
  }
`;

export const HelperText = styled.p`
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  line-height: 1.4;
`;

export const SettingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
`;

export const Label = styled.div`
  display: flex;
  flex-direction: column;
`;

export const LabelText = styled.span`
  font-weight: 500;
  color: var(--color-text-main);
`;

export const LabelDescription = styled.span`
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-top: 4px;
`;

export const SwitchButton = styled.button<{ $isActive: boolean }>`
  min-width: 48px;
  height: 24px;
  background-color: ${({ $isActive }) =>
    $isActive ? "var(--color-brand-500)" : "var(--color-text-light)"};
  border-radius: 12px;
  position: relative;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
  &::after {
    content: "";
    position: absolute;
    top: 2px;
    left: ${({ $isActive }) => ($isActive ? "26px" : "2px")};
    width: 20px;
    height: 20px;
    background-color: white;
    border-radius: 50%;
    transition: left 0.3s;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }
`;

export const DevZone = styled.div`
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 2px dashed var(--color-border);
  opacity: 0.8;
  transition: opacity 0.2s;
  &:hover {
    opacity: 1;
  }
`;

export const DevZoneDescription = styled.p`
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
`;

// 👇 НОВИЙ СТИЛЬ ДЛЯ ОПЦІЇ В SELECT 👇
export const OptionItem = styled.div<{ $isActive: boolean }>`
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s;
  font-size: 0.9rem;

  /* Активний стан (обраний) */
  background-color: ${(p) =>
    p.$isActive ? "var(--color-brand-50)" : "transparent"};
  color: ${(p) =>
    p.$isActive ? "var(--color-brand-700)" : "var(--color-text-main)"};

  /* Ховер та фокус */
  &:hover,
  &:focus {
    background-color: var(--color-bg-hover);
    outline: none;
  }
`;
