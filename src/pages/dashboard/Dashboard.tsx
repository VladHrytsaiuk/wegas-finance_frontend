import { useIsMobile } from "../../hooks/useIsMobile";
import DesktopDashboard from "./DesktopDashboard";
import MobileOverview from "../../views/mobile/Overview/MobileOverview";

function Dashboard() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileOverview />;
  }

  return <DesktopDashboard />;
}

export default Dashboard;
