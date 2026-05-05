import styled from "styled-components";
import { HiOutlineUser } from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import { useHeader } from "../context/HeaderContext";
import { WorkspaceSwitcher } from "./ui/WorkspaceSwitcher";
import { useExchangeRates } from "../hooks/useExchangeRates"; // Імпортуємо хук
// --- STYLES ---
const StyledHeader = styled.header`
  background-color: var(--color-bg-page);
  padding: 1.2rem 3.2rem;

  /* Змінюємо Flex на Grid для ідеального позиціонування без накладань */
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 1rem;

  @media (max-width: 1024px) {
    padding: 1.2rem 1.5rem; /* Зменшуємо "мертву зону" по боках */
  }
`;

const GreetingSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  /* Захист від занадто довгого тексту при звуженні */
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const Subtitle = styled.span`
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  font-weight: 500;
`;

const SwitcherWrapper = styled.div`
  /* Прибрали absolute та transform! */
  display: flex;
  justify-content: center;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end; /* Притискаємо все вправо */
  gap: 1.2rem;

  @media (max-width: 900px) {
    gap: 0.8rem; /* Трохи ущільнюємо елементи */
  }
`;

// 🔥 Стилі для Курсу Валют
const RatesWidget = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: var(--color-bg-surface);
  padding: 0.4rem 1rem;
  border-radius: 16px;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  height: 40px;

  @media (max-width: 850px) {
    padding: 0.4rem 0.5rem;
    gap: 0.6rem;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const RateItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  font-family: "JetBrains Mono", monospace;

  span.currency {
    color: var(--color-text-tertiary);
    font-weight: 700;
    font-size: 0.75rem;
  }

  span.value {
    color: var(--color-text-main);
    font-size: 0.75rem;
  }
`;

const Divider = styled.div`
  width: 1px;
  height: 16px;
  background-color: var(--color-border);
`;
const UserArea = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: var(--color-bg-surface);
  padding: 0.4rem 0.2rem 0.4rem 1rem;
  border-radius: 20px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
  height: 40px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--color-brand-500);
  }

  /* 🔥 Повністю ховаємо блок профілю на 1280px і менше */
  @media (max-width: 1280px) {
    display: none;
  }
`;

const UserName = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-main);
  /* Зайві медіа-запити прибрані, бо батьківський UserArea вже схований */
`;

const Avatar = styled.div`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: var(--color-brand-100);
  color: var(--color-brand-600);
  display: flex;
  align-items: center;
  justify-content: center;

  & svg {
    width: 1.2rem;
    height: 1.2rem;
  }
`;

function Header() {
  const { t } = useTranslation();
  const user = localStorage.getItem("user_name") || t("shared.user_default");
  const { title, subtitle } = useHeader();

  // Отримуємо курси
  const { usd, eur, isLoading } = useExchangeRates();

  const displayTitle = title || t("dashboardPage.greetings", { name: user });
  const displaySubtitle = title ? subtitle : t("dashboardPage.subtitle");

  return (
    <StyledHeader>
      <GreetingSection>
        <Title>{displayTitle}</Title>
        {displaySubtitle && <Subtitle>{displaySubtitle}</Subtitle>}
      </GreetingSection>

      <SwitcherWrapper>
        <WorkspaceSwitcher />
      </SwitcherWrapper>

      <RightSection>
        {/* 🔥 ВІДЖЕТ КУРСІВ */}
        {/* Показуємо тільки якщо завантажилось і є дані, щоб не миготіло */}
        {!isLoading && usd && eur && (
          <RatesWidget>
            <RateItem>
              <span className="currency">$</span>
              <span className="value">{usd.toFixed(2)}</span>
            </RateItem>
            <Divider />
            <RateItem>
              <span className="currency">€</span>
              <span className="value">{eur.toFixed(2)}</span>
            </RateItem>
          </RatesWidget>
        )}

        <UserArea>
          <UserName>{user}</UserName>
          <Avatar>
            <HiOutlineUser />
          </Avatar>
        </UserArea>
      </RightSection>
    </StyledHeader>
  );
}

export default Header;
