import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useMoveBack } from "../hooks/useMoveBack";
import { Button } from "../components/ui/Button";

const StyledPageNotFound = styled.main`
  height: 100vh;
  background-color: var(--color-bg-page);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4.8rem;
`;

const Box = styled.div`
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  padding: 4.8rem;
  flex: 0 1 60rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin-bottom: 3.2rem;
`;

function PageNotFound() {
  const { t } = useTranslation();
  const moveBack = useMoveBack();

  return (
    <StyledPageNotFound>
      <Box>
        <Title>{t("legacy:pageNotFound.title")}</Title>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <Button
            onClick={moveBack}
            style={{ width: "auto", padding: "1rem 2rem" }}
          >
            &larr; {t("legacy:pageNotFound.back_button")}
          </Button>
        </div>
      </Box>
    </StyledPageNotFound>
  );
}

export default PageNotFound;
