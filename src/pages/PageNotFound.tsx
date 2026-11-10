import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "../hooks/usePageTitle";
import { useIsMobile } from "../hooks/useIsMobile";
import { StatusScreen } from "../mobile/StatusScreen";
import { useMoveBack } from "../hooks/useMoveBack";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { HiExclamationTriangle } from "react-icons/hi2";

const StyledPageNotFound = styled.main`
  height: 100vh;
  background-color: var(--color-bg-page);
  display: flex;
  align-items: center;
  justify-content: center;
`;

function DesktopPageNotFound() {
  const { t } = useTranslation();
  usePageTitle(t("legacy:pageNotFound.title", "Сторінку не знайдено"));
  const moveBack = useMoveBack();

  return (
    <StyledPageNotFound>
      <EmptyState
        icon={<HiExclamationTriangle />}
        title={t("legacy:pageNotFound.title")}
        description={t("legacy:pageNotFound.description", "Сторінку не знайдено або у вас немає прав для її перегляду")}
        action={
          <Button onClick={moveBack} variation="secondary">
            &larr; {t("legacy:pageNotFound.back_button")}
          </Button>
        }
      />
    </StyledPageNotFound>
  );
}

// На мобілці — повноекранне повідомлення в стилі iOS.
function PageNotFound() {
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  const moveBack = useMoveBack();
  usePageTitle(t("legacy:pageNotFound.title", "Сторінку не знайдено"));

  if (!isMobile) return <DesktopPageNotFound />;
  return (
    <StatusScreen
      title={t("legacy:pageNotFound.title")}
      message={t("legacy:pageNotFound.description", "Сторінку не знайдено або у вас немає прав для її перегляду")}
      actionLabel={t("legacy:pageNotFound.back_button")}
      onAction={moveBack}
    />
  );
}

export default PageNotFound;
