import styled from "styled-components";
import { HiOutlineBanknotes } from "react-icons/hi2";

const LogoWrapper = styled.div`
  padding-bottom: 1rem;
  border-bottom: 1px dashed var(--color-border);
  min-height: 4.5rem;
  display: flex;
  /* Вирівнювання по вертикалі, горизонтальне робить внутрішній блок */
  align-items: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

// ✅ Цей блок відповідає за центрування
const Content = styled.div`
  display: flex;
  align-items: center;

  /* Плавна зміна ширини від розміру іконки до повного лого */
  width: ${(p) => (p.$collapsed ? "44px" : "111px")}; /* 162 * (44/64) ≈ 111px */
  height: 44px;

  /* Центрування самого блоку в батьківському контейнері */
  margin: 0 auto;

  /* Внутрішній контент завжди зліва, щоб не стрибав */
  justify-content: flex-start;

  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden; /* Обрізаємо текст при звуженні */
`;

const IconBox = styled.div`
  min-width: 44px; /* Фіксований розмір іконки */
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const IconInner = styled.div<{ $collapsed: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;

  & img {
    height: 44px;
    width: ${(p) => (p.$collapsed ? "44px" : "111px")};
    object-fit: contain;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
`;

function Logo({ isCollapsed }) {
  return (
    <LogoWrapper>
      <Content $collapsed={isCollapsed}>
        <IconInner $collapsed={isCollapsed}>
          <img 
            src={isCollapsed ? "/Logo.svg" : "/Logo_full.svg"} 
            alt="WeGaS Logo" 
          />
        </IconInner>
      </Content>
    </LogoWrapper>
  );
}


export default Logo;
