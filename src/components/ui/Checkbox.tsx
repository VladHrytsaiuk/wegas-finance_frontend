import styled from "styled-components";
import { HiCheck, HiMinus } from "react-icons/hi2";

const Wrapper = styled.div<{ $disabled?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: ${(p) => (p.$disabled ? "not-allowed" : "pointer")};
  opacity: ${(p) => (p.$disabled ? 0.6 : 1)};
  position: relative;
  width: 20px;
  height: 20px;
`;

// Прихований нативний інпут
const HiddenInput = styled.input`
  opacity: 0;
  position: absolute;
  width: 100%;
  height: 100%;
  margin: 0;
  cursor: pointer;
  z-index: 1;
`;

// Видимий квадрат
const StyledBox = styled.div<{ $checked: boolean; $indeterminate: boolean }>`
  width: 100%;
  height: 100%;
  border-radius: 6px;
  border: 2px solid
    ${(p) =>
      p.$checked || p.$indeterminate
        ? "var(--color-brand-600)"
        : "var(--color-border)"};
  background-color: ${(p) =>
    p.$checked || p.$indeterminate
      ? "var(--color-brand-600)"
      : "var(--color-bg-surface)"};

  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  color: white;

  /* Ховер ефект (тільки якщо не активний) */
  ${Wrapper}:hover & {
    border-color: ${(p) =>
      !p.$checked && !p.$indeterminate && "var(--color-brand-400)"};
  }
`;

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  indeterminate?: boolean;
}

export default function Checkbox({
  checked = false,
  indeterminate = false,
  disabled,
  onChange,
  className,
  ...props
}: CheckboxProps) {
  return (
    <Wrapper
      $disabled={disabled}
      className={className}
      onClick={(e) => e.stopPropagation()}
    >
      <HiddenInput
        type="checkbox"
        checked={!!checked}
        disabled={disabled}
        onChange={onChange}
        ref={(input) => {
          if (input) input.indeterminate = !!indeterminate;
        }}
        {...props}
      />
      <StyledBox $checked={!!checked} $indeterminate={!!indeterminate}>
        {indeterminate ? (
          <HiMinus size={14} strokeWidth={3} />
        ) : checked ? (
          <HiCheck size={14} strokeWidth={3} />
        ) : null}
      </StyledBox>
    </Wrapper>
  );
}
