import { useIsMobile } from "../../hooks/useIsMobile";
import DesktopAccounts from "./DesktopAccounts";
import MobileAccounts from "../../views/mobile/Accounts/MobileAccounts";

function Accounts() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileAccounts />;
  }

  return <DesktopAccounts />;
}

export default Accounts;
