import styled from "styled-components";

// Плитка застосунку: знак FERP на білому «значку» (як іконка на домашньому екрані).
// Та сама розмітка, що й на екрані запуску в index.html.

const Tile = styled.div<{ $size: number }>`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: ${(p) => p.$size}px;
  height: ${(p) => p.$size}px;
  border-radius: 22%;
  background: #ffffff;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.06),
    0 10px 28px rgba(0, 0, 0, 0.1);

  svg {
    width: 59%;
    height: 59%;
  }

  [data-theme="dark"] & {
    box-shadow:
      0 0 0 0.5px rgba(255, 255, 255, 0.1),
      0 10px 28px rgba(0, 0, 0, 0.6);
  }
`;

export function AppMark({ size = 72 }: { size?: number }) {
  return (
    <Tile $size={size} aria-hidden="true">
      <svg
        viewBox="2.5 1.5 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3 6.98103L4.68196 12.5255L5.53415 9.61091L4.92864 7.42838C4.86884 7.27926 4.6685 6.98103 4.34557 6.98103H3Z"
          fill="#16BE8C"
        />
        <path
          d="M4.83894 12.9999L6.72273 6.60145L7.61978 9.61091L6.7788 12.539C6.70031 12.7288 6.52987 12.9349 6.20693 12.9999H4.83894Z"
          fill="#16BE8C"
        />
        <path
          d="M6.91335 6.11343L8.83079 12.5255L9.68298 9.61091L8.88685 6.66924C8.83826 6.54271 8.77472 6.22189 8.34862 6.11343L8.25049 6.11344C7.93856 6.11344 7.23174 6.11344 6.91335 6.11343Z"
          fill="#0B5C45"
        />
        <path
          d="M8.99898 12.9999L12.0265 2.54823C12.0788 2.37006 12.2732 2.01096 12.632 2C12.9908 1.98904 13.6935 1.99543 14 2L10.9949 12.3357C10.9239 12.5571 10.6966 13 10.3558 13L8.99898 12.9999Z"
          fill="#0B5C45"
        />
      </svg>
    </Tile>
  );
}
