import { useIsMobile } from "../../hooks/useIsMobile";
import DesktopSettingsLayout from "./DesktopSettingsLayout";
import MobileSettings from "../../views/mobile/Settings/MobileSettings";

function SettingsLayout() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileSettings />;
  }

  return <DesktopSettingsLayout />;
}

export default SettingsLayout;
