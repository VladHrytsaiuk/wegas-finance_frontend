import { Outlet, useLocation } from "react-router-dom";
import { useIsMobile } from "../../hooks/useIsMobile";
import DesktopSettingsLayout from "./DesktopSettingsLayout";
import MobileSettings from "../../views/mobile/Settings/MobileSettings";

function SettingsLayout() {
  const isMobile = useIsMobile();
  const location = useLocation();

  if (isMobile) {
    // Якщо ми в корені "/settings", показуємо список налаштувань.
    // Якщо ми в під-маршруті (наприклад, "/settings/profile"), рендеримо Outlet.
    const isRootSettings = location.pathname === "/settings" || location.pathname === "/settings/";
    
    return isRootSettings ? <MobileSettings /> : <Outlet />;
  }

  return <DesktopSettingsLayout />;
}

export default SettingsLayout;
