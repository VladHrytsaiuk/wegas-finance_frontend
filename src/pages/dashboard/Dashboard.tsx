import { useIsMobile } from "../../hooks/useIsMobile";
import DesktopDashboard from "./DesktopDashboard";
import MobileDashboard from "../../views/mobile/Dashboard/MobileDashboard";

function Dashboard() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileDashboard />;
  }

  return <DesktopDashboard />;
}

export default Dashboard;
