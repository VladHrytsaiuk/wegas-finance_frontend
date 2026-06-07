import CenteredSpinner from "./CenteredSpinner";
import { useTranslation } from "react-i18next";

function FullPageSpinner() {
  const { t } = useTranslation();

  return (
    <CenteredSpinner
      fullHeight
      message={t("common:ui.full_page_loading", "Завантаження...")}
    />
  );
}

export default FullPageSpinner;
