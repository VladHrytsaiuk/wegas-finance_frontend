import styled from "styled-components";
import { HiMagnifyingGlass, HiXCircle } from "react-icons/hi2";

const Field = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  padding: 0 8px 0 10px;
  border-radius: 10px;
  background: var(--m-fill);
  color: var(--m-label-2);
`;

const Input = styled.input`
  flex: 1;
  min-width: 0;
  border: none;
  background: none;
  outline: none;
  font: inherit;
  /* 16px+ не дає iOS збільшувати сторінку при фокусі */
  font-size: 17px;
  color: var(--m-label);

  &::placeholder {
    color: var(--m-label-2);
  }

  &::-webkit-search-cancel-button {
    display: none;
  }
`;

const Clear = styled.button`
  display: flex;
  padding: 4px;
  border: none;
  background: none;
  cursor: pointer;
  color: var(--m-label-3);
`;

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label: string;
}

export function SearchField({ value, onChange, placeholder = "Пошук", label }: SearchFieldProps) {
  return (
    <Field>
      <HiMagnifyingGlass size={17} aria-hidden="true" />
      <Input
        type="search"
        enterKeyHint="search"
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <Clear type="button" aria-label="Очистити пошук" onClick={() => onChange("")}>
          <HiXCircle size={18} aria-hidden="true" />
        </Clear>
      )}
    </Field>
  );
}
