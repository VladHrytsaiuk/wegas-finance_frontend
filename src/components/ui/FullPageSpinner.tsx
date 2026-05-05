import styled from "styled-components";
import Spinner from "./Spinner";
import { useTranslation } from "react-i18next"; // ⬅️ ІМПОРТ ДЛЯ ПЕРЕКЛАДУ

const StyledFullPage = styled.div`
  height: 100vh;
  background-color: var(--color-bg-page);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 1.6rem;
`;

const Text = styled.p`
  color: var(--color-text-secondary);
  font-size: 1.1rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  animation: pulse 2s infinite;

  @keyframes pulse {
    0% {
      opacity: 0.6;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0.6;
    }
  }
`;

function FullPageSpinner() {
  const { t } = useTranslation(); // ⬅️ ВИКОРИСТАННЯ ХУКА

  return (
    <StyledFullPage>
      <Spinner />
      {/* ➡️ ПЕРЕКЛАД ТЕКСТУ */}
      <Text>{t("common:ui.full_page_loading")}</Text>
    </StyledFullPage>
  );
}

export default FullPageSpinner;
