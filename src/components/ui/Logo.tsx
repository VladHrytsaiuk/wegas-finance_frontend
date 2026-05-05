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

  /* Плавна зміна ширини від повної до розміру іконки */
  width: ${(p) => (p.$collapsed ? "44px" : "100%")};
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

const IconInner = styled.div`
  color: white;
  background: linear-gradient(
    135deg,
    var(--color-brand-500),
    var(--color-brand-700)
  );
  padding: 0.6rem;
  border-radius: 12px; /* Трохи більш скруглений, як в iOS */
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  justify-content: center;

  & svg {
    width: 1.6rem;
    height: 1.6rem;
  }
`;

const AppName = styled.span`
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--color-text-main);
  letter-spacing: -0.03em;
  margin-left: 0.8rem;

  /* Анімація тексту */
  opacity: ${(p) => (p.$collapsed ? "0" : "1")};
  transform: translateX(${(p) => (p.$collapsed ? "-10px" : "0")});
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
`;

function Logo({ isCollapsed }) {
  return (
    <LogoWrapper>
      <Content $collapsed={isCollapsed}>
        <IconBox>
          <IconInner>
            <HiOutlineBanknotes />
          </IconInner>
        </IconBox>
        <AppName $collapsed={isCollapsed}>WeGaS</AppName>
      </Content>
    </LogoWrapper>
  );
}

export default Logo;
